import { BoardData, Column, Task, User, Priority, Assignee } from '../types';
import { supabase, supabaseAdmin } from '../utils/supabaseClient';
import { DEFAULT_PRIORITIES, DEFAULT_COLUMNS } from '../constants';

export const DataService = {
  
  // --- Auth & User ---

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    
    // Fetch profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
        return {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar
        };
    }
    
    return {
        id: session.user.id,
        name: session.user.user_metadata.name || session.user.email,
        email: session.user.email!,
        avatar: session.user.user_metadata.avatar
    };
  },

  login: async (email: string, password?: string): Promise<User> => {
    if (!password) throw new Error("Password required");
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
       if (error.message.includes("Invalid login credentials")) throw new Error("Email ou senha inválidos.");
       if (error.message.includes("Email not confirmed")) throw new Error("Por favor, confirme seu email.");
       throw error;
    }

    if (data.user) {
        // Fetch profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        return {
            id: data.user.id,
            name: profile?.name || data.user.user_metadata.name || email,
            email: data.user.email!,
            avatar: profile?.avatar || data.user.user_metadata.avatar
        };
    }
    throw new Error("Login failed");
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
    // 1. Create Default Columns (Only if none exist)
    const { count: colCount } = await supabase.from('kanban_columns').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (colCount === 0) {
        for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
            const col = DEFAULT_COLUMNS[i];
            await supabase.from('kanban_columns').insert({
                id: col.id, 
                title: col.title,
                color: col.color,
                position: i,
                user_id: user.id
            });
        }
    }

    // 2. Create Default Priorities (Only if none exist)
    const { count: prioCount } = await supabase.from('kanban_priorities').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (prioCount === 0) {
        for (const prio of DEFAULT_PRIORITIES) {
            await supabase.from('kanban_priorities').insert({
                id: prio.id,
                title: prio.title,
                color: prio.color,
                user_id: user.id
            });
        }
    }

    // 3. Create Self as First Assignee (Only if none exist)
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

    // Force restore Columns
    for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
        const col = DEFAULT_COLUMNS[i];
        // Upsert: Create if missing, update if exists (resets title/color to default)
        await supabase.from('kanban_columns').upsert({
             id: col.id, 
             title: col.title,
             color: col.color,
             position: i,
             user_id: user.id
        });
    }

    // Force restore Priorities
    for (const prio of DEFAULT_PRIORITIES) {
        await supabase.from('kanban_priorities').upsert({
             id: prio.id,
             title: prio.title,
             color: prio.color,
             user_id: user.id
        });
    }

    // Also ensure assignee exists
    const { count: assigneeCount } = await supabase.from('kanban_assignees').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (assigneeCount === 0) {
        await supabase.from('kanban_assignees').insert({
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            user_id: user.id
        });
    }

    return DataService.getBoardData();
  },

  getBoardData: async (): Promise<BoardData> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // REMOVED AUTO-SEED LOGIC HERE to allow empty boards
    // Data seeding now only happens on signup or manual restore

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

    // --- MIGRATION: ENFORCE DEFAULT TITLES FOR EXISTING USERS ---
    // If user has standard IDs (To Do, In Progress, Done) but wrong titles (e.g. English or Capitalized), fix them.
    const updatesPromises: Promise<any>[] = [];
    
    if (columnsData) {
        DEFAULT_COLUMNS.forEach(defCol => {
            const existing = columnsData.find(c => c.id === defCol.id);
            if (existing && existing.title !== defCol.title) {
                // Optimistically update local data
                existing.title = defCol.title;
                // Fire update to DB
                updatesPromises.push(
                    supabase.from('kanban_columns')
                        .update({ title: defCol.title })
                        .eq('id', defCol.id)
                        .eq('user_id', user.id)
                );
            }
        });
    }

    if (prioritiesData) {
        DEFAULT_PRIORITIES.forEach(defPrio => {
            const existing = prioritiesData.find(p => p.id === defPrio.id);
            if (existing && existing.title !== defPrio.title) {
                 existing.title = defPrio.title;
                 updatesPromises.push(
                    supabase.from('kanban_priorities')
                        .update({ title: defPrio.title })
                        .eq('id', defPrio.id)
                        .eq('user_id', user.id)
                 );
            }
        });
    }

    if (updatesPromises.length > 0) {
        // We don't await this to avoid blocking the UI load. 
        // We already updated the local objects (columnsData/prioritiesData) by reference/mutation above if needed.
        Promise.all(updatesPromises).catch(err => console.error("Auto-migration failed", err));
    }
    // ------------------------------------------------------------

    // 3. Transform
    const tasks: Record<string, Task> = {};
    const columns: Record<string, Column> = {};
    const columnOrder: string[] = [];
    
    // Sort priorities based on our DEFAULT_PRIORITIES order if they exist, otherwise append custom ones
    const defaultPriorityIds = DEFAULT_PRIORITIES.map(p => p.id);
    const sortedPriorities = (prioritiesData || []).sort((a, b) => {
        const idxA = defaultPriorityIds.indexOf(a.id);
        const idxB = defaultPriorityIds.indexOf(b.id);
        // If both are defaults, sort by default order
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        // If A is default, it comes first
        if (idxA !== -1) return -1;
        // If B is default, it comes first
        if (idxB !== -1) return 1;
        // Otherwise stable/alphabetical
        return a.title.localeCompare(b.title);
    }).map(p => ({ id: p.id, title: p.title, color: p.color }));

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
            dueDate: t.due_date, // Keeping TS interface compatible
            createdAt: t.created_at,
            tags: [] 
        };
        tasks[task.id] = task;
        if (columns[t.status]) {
            columns[t.status].taskIds.push(t.id);
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

    const id = title.trim();

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

    const id = title.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36); 
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