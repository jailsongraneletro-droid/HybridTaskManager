import { BoardData, Column, Task, User, Priority, Assignee } from '../types';
import { supabase } from '../utils/supabaseClient';
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

         // We do NOT seed data here immediately because RLS might need a fresh session.
         // Data seeding happens on first getBoardData call.

         return { id: data.user.id, name, email, avatar: avatarUrl };
    }
    throw new Error("Signup failed");
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
    // 1. Create Default Columns
    for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
        const col = DEFAULT_COLUMNS[i];
        await supabase.from('kanban_columns').insert({
            id: col.id, // Using string ID as requested by schema, mapped per user via RLS
            title: col.title,
            color: col.color,
            position: i,
            user_id: user.id
        });
    }

    // 2. Create Default Priorities
    for (const prio of DEFAULT_PRIORITIES) {
        await supabase.from('kanban_priorities').insert({
            id: prio.id,
            title: prio.title,
            color: prio.color,
            user_id: user.id
        });
    }

    // 3. Create Self as First Assignee
    await supabase.from('kanban_assignees').insert({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        user_id: user.id
    });
  },

  getBoardData: async (): Promise<BoardData> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // 1. Check if user has columns. If not, seed data.
    // IMPORTANT: Explicitly filter by user.id to handle cases where RLS might be off.
    const { count } = await supabase
        .from('kanban_columns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
    
    if (count === 0) {
        await DataService.seedUserData(user);
    }

    // 2. Fetch All Data with explicit user_id filter
    // This ensures that even if RLS is disabled on Supabase, the user only sees their own data client-side.
    const [
        { data: columnsData },
        { data: prioritiesData },
        { data: tasksData },
        { data: assigneesData }
    ] = await Promise.all([
        supabase.from('kanban_columns').select('*').eq('user_id', user.id).order('position'),
        supabase.from('kanban_priorities').select('*').eq('user_id', user.id),
        supabase.from('kanban_tasks').select('*').eq('user_id', user.id).order('position'),
        supabase.from('kanban_assignees').select('*').eq('user_id', user.id).order('created_at')
    ]);

    // 3. Transform
    const tasks: Record<string, Task> = {};
    const columns: Record<string, Column> = {};
    const columnOrder: string[] = [];
    const priorities: Priority[] = (prioritiesData || []).map(p => ({ id: p.id, title: p.title, color: p.color }));
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
        }
    });

    return { tasks, columns, columnOrder, priorities, assignees };
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

    if (error) throw error;
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

    if (error) throw error;
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

    // Generate a clean ID
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
    // Delete column (RLS handles permission)
    // Note: Database should ideally CASCADE tasks, or we delete tasks first. 
    // Assuming backend handles cascade or we leave orphaned tasks for now (hidden from view due to missing col).
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

    const id = title.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString(36); // Unique ID to prevent collision
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