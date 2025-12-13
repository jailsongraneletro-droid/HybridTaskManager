
import { BoardData, Column, Task, User, Priority } from '../types';
import { supabase } from '../utils/supabaseClient';

export const DataService = {
  // --- User / Auth (Supabase) ---
  
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
    return null;
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data } = await supabase.from('profiles').select('*');
    return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        avatar: p.avatar
    }));
  },

  login: async (email: string, password?: string): Promise<User> => {
    if (!password) throw new Error("Password required");
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    if (data.user) {
        // Fetch profile to return full user object
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        return {
            id: data.user.id,
            name: profile?.name || email,
            email: data.user.email!,
            avatar: profile?.avatar
        };
    }
    throw new Error("Login failed");
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            }
        }
    });

    if (error) throw error;
    
    // Note: If email confirmation is enabled in Supabase, user won't be returned immediately active.
    // For this MVP, disable email confirmation in Supabase Dashboard > Authentication > Providers > Email
    if (data.user) {
         return {
            id: data.user.id,
            name: name,
            email: email,
            avatar: data.user.user_metadata.avatar
        };
    }
    throw new Error("Signup failed");
  },

  updateCurrentUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const { error } = await supabase
        .from('profiles')
        .update({
            name: updates.name,
            avatar: updates.avatar
        })
        .eq('id', userId);

    if (error) throw error;
    
    // Password update is separate in Supabase
    if (updates.password) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: updates.password });
        if (pwdError) throw pwdError;
    }

    return { id: userId, ...updates } as User;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  // --- Board Data (Supabase) ---

  getBoardData: async (): Promise<BoardData> => {
    // 1. Fetch Columns
    const { data: columnsData, error: colError } = await supabase
        .from('kanban_columns')
        .select('*')
        .order('position');
    
    if (colError) throw colError;

    // 2. Fetch Priorities
    const { data: prioritiesData, error: prioError } = await supabase
        .from('kanban_priorities')
        .select('*');
        
    if (prioError) throw prioError;

    // 3. Fetch Tasks
    const { data: tasksData, error: taskError } = await supabase
        .from('kanban_tasks')
        .select('*')
        .order('position'); // Order by drag position

    if (taskError) throw taskError;

    // 4. Transform to BoardData structure
    const tasks: Record<string, Task> = {};
    const columns: Record<string, Column> = {};
    const columnOrder: string[] = [];
    const priorities: Priority[] = prioritiesData.map(p => ({
        id: p.id,
        title: p.title,
        color: p.color
    }));

    // Initialize Columns
    columnsData.forEach(col => {
        columns[col.id] = {
            id: col.id,
            title: col.title,
            color: col.color,
            taskIds: [] // Will populate next
        };
        columnOrder.push(col.id);
    });

    // Populate Tasks and Column TaskIds
    tasksData.forEach(t => {
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
        
        // Add to column if column exists
        if (columns[t.status]) {
            columns[t.status].taskIds.push(t.id);
        }
    });

    return {
        tasks,
        columns,
        columnOrder,
        priorities
    };
  },

  saveBoardData: async (data: BoardData) => {
    // In SQL version, we save granularly. This method might be deprecated 
    // or used to sync positions if needed, but we handle individual ops below.
    console.log("Bulk save not implemented for SQL - usage individual methods");
  },

  addTask: async (task: Task): Promise<BoardData> => {
    // Get current max position in the column to append
    // This is a simplification; ideally we query DB. 
    // We will assume appending to end.
    
    const { error } = await supabase.from('kanban_tasks').insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assigneeId || null,
        due_date: task.dueDate,
        position: 999999 // Put at end, or calculate logic
    });

    if (error) throw error;
    return DataService.getBoardData();
  },

  updateTask: async (task: Task): Promise<BoardData> => {
    // If it's just content update
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

  // Special method for Drag and Drop reordering
  updateTaskPosition: async (taskId: string, newStatus: string, newPosition: number): Promise<void> => {
      await supabase
        .from('kanban_tasks')
        .update({
            status: newStatus,
            position: newPosition
        })
        .eq('id', taskId);
  },

  deleteTask: async (taskId: string): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_tasks').delete().eq('id', taskId);
    if (error) throw error;
    return DataService.getBoardData();
  },

  // --- Columns ---

  addColumn: async (title: string, color: string): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_columns').insert({
        id: title, // Using title as ID as per original design
        title,
        color,
        position: 999
    });
    if (error) throw error;
    return DataService.getBoardData();
  },

  deleteColumn: async (columnId: string): Promise<BoardData> => {
    // Cascade delete handles tasks
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
    const id = title.toLowerCase().replace(/\s+/g, '_');
    const { error } = await supabase.from('kanban_priorities').insert({
        id,
        title,
        color
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
  }
};
