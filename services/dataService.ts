import { BoardData, Column, Task, User, Priority, Assignee } from '../types';
import { supabase, supabaseAdmin } from '../utils/supabaseClient';
import { DEFAULT_PRIORITIES, DEFAULT_COLUMNS } from '../constants';

export const DataService = {
  
  // --- Auth & User ---

  getCurrentUser: async (): Promise<User | null> => {
    try {
        // 1. Check for active session first (Fast, hits LocalStorage)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error("Session check error:", sessionError);
            return null;
        }

        if (!session?.user) return null;
        
        // 2. Try to fetch extended profile data
        try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError) {
                console.warn("Profile fetch warning (using fallback):", profileError.message);
            }

            if (profile) {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    avatar: profile.avatar
                };
            }
        } catch (innerError) {
            console.warn("Network error fetching profile, using session data:", innerError);
        }
        
        // 3. Fallback: If profile missing or fetch failed, return User based on Auth Session
        // This ensures the user stays logged in even if the DB is slow.
        return {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email,
            email: session.user.email!,
            avatar: session.user.user_metadata.avatar
        };

    } catch (e) {
        console.error("Critical error in getCurrentUser:", e);
        return null;
    }
  },

  login: async (email: string, password?: string): Promise<User> => {
    if (!password) throw new Error("Password required");
    
    // 1. Attempt Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
       console.error("Supabase Login Error:", error);
       if (error.message.includes("Invalid login credentials")) throw new Error("Email ou senha inválidos.");
       if (error.message.includes("Email not confirmed")) throw new Error("Por favor, confirme seu email.");
       throw error;
    }

    if (data.user) {
        // 2. Fetch Profile (Safely)
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            return {
                id: data.user.id,
                name: profile?.name || data.user.user_metadata.name || email,
                email: data.user.email!,
                avatar: profile?.avatar || data.user.user_metadata.avatar
            };
        } catch (profileError) {
             console.warn("Error fetching profile, falling back to auth data", profileError);
             // Fallback to basic auth data so login succeeds even if profile fetch fails
             return {
                 id: data.user.id,
                 name: data.user.user_metadata.name || email,
                 email: data.user.email!,
                 avatar: data.user.user_metadata.avatar
             };
        }
    }
    throw new Error("Login failed: No user data returned.");
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, avatar: avatarUrl } }
    });

    if (error) throw error;
    
    if (data.user) {
         if (!data.session) throw new Error("CONFIRM_EMAIL");

         // Create Profile
         await supabase.from('profiles').upsert({
             id: data.user.id,
             name: name,
             email: email,
             avatar: avatarUrl
         });
         
         // Create default User object
         const newUser: User = { id: data.user.id, name, email, avatar: avatarUrl };

         // IMPORTANT: Seed default data IMMEDIATELY so new users have columns/status
         try {
            await DataService.seedUserData(newUser);
         } catch (seedError) {
             console.error("Error seeding initial data:", seedError);
             // Proceed anyway, getBoardData will retry later
         }

         return newUser;
    }
    throw new Error("Signup failed");
  },

  // --- NEW: DIRECT ADMIN RESET ---
  adminForcePasswordReset: async (email: string, newPassword: string) => {
    if (!supabaseAdmin) {
        throw new Error("Chave de Admin (service_role) não configurada no supabaseClient.ts");
    }

    // 1. Find User ID by Email (using the Profiles table which is readable)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        throw new Error("Usuário não encontrado com este e-mail.");
    }

    // 2. Force Update Password using Admin Client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.id,
        { password: newPassword }
    );

    if (updateError) throw updateError;
    
    return true;
  },

  // 3. Update Password (used after OTP verification)
  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  updateCurrentUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const { error } = await supabase
        .from('profiles')
        .update({ name: updates.name, avatar: updates.avatar })
        .eq('id', userId);

    if (error) throw error;
    
    if (updates.password) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: updates.password });
        if (pwdError) throw pwdError;
    }

    return { id: userId, ...updates } as User;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  // --- Board Data & Isolation Logic ---

  // Helper to create default data for a new user
  seedUserData: async (user: User) => {
    // 1. Create Default Columns (Unique IDs per user to prevent collision)
    const { count: colCount } = await supabase.from('kanban_columns').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (colCount === 0) {
        for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
            const col = DEFAULT_COLUMNS[i];
            const uniqueId = `${col.id}_${user.id}`; // CRITICAL: Unique ID per user
            await supabase.from('kanban_columns').insert({
                id: uniqueId, 
                title: col.title,
                color: col.color,
                position: i,
                user_id: user.id
            });
        }
    }

    // 2. Create Default Priorities
    const { count: prioCount } = await supabase.from('kanban_priorities').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (prioCount === 0) {
        for (const prio of DEFAULT_PRIORITIES) {
            const uniqueId = `${prio.id}_${user.id}`; // CRITICAL: Unique ID per user
            await supabase.from('kanban_priorities').insert({
                id: uniqueId,
                title: prio.title,
                color: prio.color,
                user_id: user.id
            });
        }
    }

    // 3. Create Self as First Assignee
    const { count: assigneeCount } = await supabase.from('kanban_assignees').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (assigneeCount === 0) {
        await supabase.from('kanban_assignees').insert({
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            user_id: user.id
        });
    }
  },

  // Manually restore defaults - Useful for users with broken/empty boards
  restoreDefaults: async (): Promise<BoardData> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // 1. Delete ALL existing structural data for this user to prevent ID conflicts
    await supabase.from('kanban_columns').delete().eq('user_id', user.id);
    await supabase.from('kanban_priorities').delete().eq('user_id', user.id);

    // 2. Re-seed with UNIQUE IDs
    const newColumnsMap: Record<string, string> = {}; // Old Generic ID -> New Unique ID
    const newFirstColumnId = `${DEFAULT_COLUMNS[0].id}_${user.id}`;

    for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
        const col = DEFAULT_COLUMNS[i];
        const uniqueId = `${col.id}_${user.id}`;
        newColumnsMap[col.id] = uniqueId;
        
        await supabase.from('kanban_columns').insert({
             id: uniqueId, 
             title: col.title,
             color: col.color,
             position: i,
             user_id: user.id
        });
    }

    for (const prio of DEFAULT_PRIORITIES) {
        const uniqueId = `${prio.id}_${user.id}`;
        await supabase.from('kanban_priorities').insert({
             id: uniqueId,
             title: prio.title,
             color: prio.color,
             user_id: user.id
        });
    }

    // 3. Ensure assignee exists
    const { count: assigneeCount } = await supabase.from('kanban_assignees').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (assigneeCount === 0) {
        await supabase.from('kanban_assignees').insert({
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            user_id: user.id
        });
    }

    // 4. EMERGENCY FIX: Update ALL tasks to the first new column to prevent them from being orphaned
    await supabase
        .from('kanban_tasks')
        .update({ status: newFirstColumnId })
        .eq('user_id', user.id);

    return DataService.getBoardData();
  },

  getBoardData: async (): Promise<BoardData> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // 2. Fetch All Data with explicit user_id filter
    // CRITICAL FIX: Check for errors! Do not just assume empty array is "no data", it could be "fetch failed".
    const [
        columnsResult,
        prioritiesResult,
        tasksResult,
        assigneesResult
    ] = await Promise.all([
        supabase.from('kanban_columns').select('*').eq('user_id', user.id).order('position'),
        supabase.from('kanban_priorities').select('*').eq('user_id', user.id),
        supabase.from('kanban_tasks').select('*').eq('user_id', user.id).order('position'),
        supabase.from('kanban_assignees').select('*').eq('user_id', user.id).order('created_at')
    ]);

    if (columnsResult.error) throw new Error("Erro ao buscar colunas: " + columnsResult.error.message);
    if (prioritiesResult.error) throw new Error("Erro ao buscar prioridades: " + prioritiesResult.error.message);
    if (tasksResult.error) throw new Error("Erro ao buscar tarefas: " + tasksResult.error.message);
    if (assigneesResult.error) throw new Error("Erro ao buscar responsáveis: " + assigneesResult.error.message);

    const columnsData = columnsResult.data;
    const prioritiesData = prioritiesResult.data;
    const tasksData = tasksResult.data;
    const assigneesData = assigneesResult.data;

    // 3. Transform
    const tasks: Record<string, Task> = {};
    const columns: Record<string, Column> = {};
    const columnOrder: string[] = [];
    
    // Sort priorities. Since IDs are now unique (e.g., high_123), we can't strict match string IDs.
    // We sort simply by title or creation for now.
    const sortedPriorities = (prioritiesData || []).sort((a, b) => a.title.localeCompare(b.title))
        .map(p => ({ id: p.id, title: p.title, color: p.color }));

    const assignees: Assignee[] = (assigneesData || []).map(a => ({ id: a.id, name: a.name, email: a.email, avatar: a.avatar }));

    (columnsData || []).forEach(col => {
        columns[col.id] = {
            id: col.id,
            title: col.title,
            color: col.color,
            taskIds: []
        };
        columnOrder.push(col.id);
    });

    (tasksData || []).forEach(t => {
        const task: Task = {
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            assigneeId: t.assignee_id,
            dueDate: t.due_date,
            createdAt: t.created_at,
            tags: [] 
        };
        tasks[task.id] = task;
        if (columns[t.status]) {
            columns[t.status].taskIds.push(t.id);
        } else if (columnOrder.length > 0) {
             // Fallback: If task status refers to a deleted column, move to first column locally
             columns[columnOrder[0]].taskIds.push(t.id);
        }
    });

    return { tasks, columns, columnOrder, priorities: sortedPriorities, assignees };
  },

  // --- Tasks ---

  addTask: async (task: Task): Promise<BoardData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    const { error } = await supabase.from('kanban_tasks').insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assigneeId || null,
        due_date: task.dueDate,
        position: 999999,
        user_id: user.id
    });

    if (error) {
        if (error.message?.includes('kanban_tasks_assignee_id_fkey')) {
             throw new Error("Erro de Banco de Dados: Chave estrangeira inválida. Execute o script SQL para corrigir a tabela kanban_tasks.");
        }
        throw error;
    }
    return DataService.getBoardData();
  },

  updateTask: async (task: Task): Promise<BoardData> => {
    const { error } = await supabase
        .from('kanban_tasks')
        .update({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignee_id: task.assigneeId || null,
            due_date: task.dueDate
        })
        .eq('id', task.id);

    if (error) {
        if (error.message?.includes('kanban_tasks_assignee_id_fkey')) {
             throw new Error("Erro de Banco de Dados: Chave estrangeira inválida. Execute o script SQL para corrigir a tabela kanban_tasks.");
        }
        throw error;
    }
    return DataService.getBoardData();
  },

  updateTaskPosition: async (taskId: string, newStatus: string, newPosition: number): Promise<void> => {
      await supabase.from('kanban_tasks').update({ status: newStatus, position: newPosition }).eq('id', taskId);
  },

  deleteTask: async (taskId: string): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_tasks').delete().eq('id', taskId);
    if (error) throw error;
    return DataService.getBoardData();
  },

  // --- Columns ---

  addColumn: async (title: string, color: string): Promise<BoardData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    // CRITICAL: Generate Unique ID so users don't conflict
    const id = `${title.trim().toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${user.id}`;

    const { error } = await supabase.from('kanban_columns').insert({
        id: id, 
        title,
        color,
        position: 999,
        user_id: user.id
    });
    if (error) throw error;
    return DataService.getBoardData();
  },

  deleteColumn: async (columnId: string): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_columns').delete().eq('id', columnId);
    if (error) throw error;
    return DataService.getBoardData();
  },

  updateColumn: async (columnId: string, updates: Partial<Column>): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_columns').update(updates).eq('id', columnId);
    if (error) throw error;
    return DataService.getBoardData();
  },

  // --- Priorities ---

  addPriority: async (title: string, color: string): Promise<BoardData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    const id = title.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36) + '_' + user.id; 
    const { error } = await supabase.from('kanban_priorities').insert({
        id,
        title,
        color,
        user_id: user.id
    });
    if (error) throw error;
    return DataService.getBoardData();
  },

  updatePriority: async (id: string, updates: Partial<Priority>): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_priorities').update(updates).eq('id', id);
    if (error) throw error;
    return DataService.getBoardData();
  },

  deletePriority: async (priorityId: string): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_priorities').delete().eq('id', priorityId);
    if (error) throw error;
    return DataService.getBoardData();
  },

  // --- Assignees (Responsibles) ---

  addAssignee: async (name: string, email: string): Promise<BoardData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    // Check for duplicate
    if (email) {
        const { data: existing } = await supabase
            .from('kanban_assignees')
            .select('id')
            .eq('user_id', user.id)
            .eq('email', email)
            .maybeSingle();
        
        if (existing) {
            throw new Error("Já existe um responsável cadastrado com este e-mail.");
        }
    }

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    const { error } = await supabase.from('kanban_assignees').insert({
        name,
        email,
        avatar,
        user_id: user.id
    });
    if (error) throw error;
    return DataService.getBoardData();
  },

  updateAssignee: async (id: string, updates: Partial<Assignee>): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_assignees').update(updates).eq('id', id);
    if (error) throw error;
    return DataService.getBoardData();
  },

  deleteAssignee: async (id: string): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_assignees').delete().eq('id', id);
    if (error) throw error;
    return DataService.getBoardData();
  }
};