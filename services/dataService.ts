import { BoardData, Column, Task, User, Priority, Assignee, Note } from '../types';
import { supabase, supabaseAdmin } from '../utils/supabaseClient';
import { DEFAULT_PRIORITIES, DEFAULT_COLUMNS } from '../constants';

export const DataService = {
  
  // --- Auth & User ---

  getCurrentUser: async (): Promise<User | null> => {
    try {
        const { data, error: sessionError } = await supabase.auth.getSession().catch(() => ({ data: { session: null }, error: null }));
        const session = data?.session;
        if (sessionError || !session?.user) return null;
        
        try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile) {
                return { id: profile.id, name: profile.name, email: profile.email, avatar: profile.avatar };
            }
        } catch (innerError) {
            console.warn("Network error fetching profile:", innerError);
        }
        
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

  updateCurrentUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const { name, email, avatar, password } = updates;
    
    if (password) {
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        name: name, 
        email: email, 
        avatar: avatar 
      })
      .select()
      .single();

    if (profileError) throw profileError;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar
    };
  },

  login: async (email: string, password?: string): Promise<User> => {
    if (!password) throw new Error("Password required");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
        return {
            id: data.user.id,
            name: data.user.user_metadata.name || email,
            email: data.user.email!,
            avatar: data.user.user_metadata.avatar
        };
    }
    throw new Error("Login failed");
  },

  signup: async (name: string, email: string, password: string): Promise<User | null> => {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { name, avatar: avatarUrl } }
    });
    if (error) throw error;
    
    if (data.user) {
         if (!data.session) {
             throw new Error("CONFIRM_EMAIL");
         }
         
         await supabase.from('profiles').upsert({ id: data.user.id, name, email, avatar: avatarUrl });
         const newUser: User = { id: data.user.id, name, email, avatar: avatarUrl };
         await DataService.seedUserData(newUser);
         return newUser;
    }
    throw new Error("Signup failed");
  },

  adminForcePasswordReset: async (email: string, newPassword: string) => {
    if (!supabaseAdmin) throw new Error("Service role key missing.");
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
    if (!profile) throw new Error("User not found.");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.id, { password: newPassword });
    if (error) throw error;
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  // --- Seeding ---

  seedUserData: async (user: User) => {
    const { count: colCount } = await supabase.from('kanban_columns').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (colCount === 0) {
        for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
            const col = DEFAULT_COLUMNS[i];
            await supabase.from('kanban_columns').insert({
                id: `${col.id}_${user.id}`, title: col.title, color: col.color, position: i, user_id: user.id
            });
        }
    }
    const { count: prioCount } = await supabase.from('kanban_priorities').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (prioCount === 0) {
        for (const prio of DEFAULT_PRIORITIES) {
            await supabase.from('kanban_priorities').insert({
                id: `${prio.id}_${user.id}`, title: prio.title, color: prio.color, user_id: user.id
            });
        }
    }
    const { count: assCount } = await supabase.from('kanban_assignees').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (assCount === 0) {
        await supabase.from('kanban_assignees').insert({ name: user.name, email: user.email, avatar: user.avatar, user_id: user.id });
    }
  },

  // --- Board Data Fetching ---

  fetchBoardData: async (userId: string): Promise<BoardData> => {
    const [tasksRes, columnsRes, prioritiesRes, assigneesRes, notesRes] = await Promise.all([
      supabase.from('kanban_tasks').select('*').eq('user_id', userId),
      supabase.from('kanban_columns').select('*').eq('user_id', userId).order('position'),
      supabase.from('kanban_priorities').select('*').eq('user_id', userId),
      supabase.from('kanban_assignees').select('*').eq('user_id', userId),
      supabase.from('kanban_notes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    const tasks: Record<string, Task> = {};
    tasksRes.data?.forEach((t: any) => {
      tasks[t.id] = { 
        id: t.id, title: t.title, description: t.description || '', status: t.status, 
        priority: t.priority, assigneeId: t.assignee_id, dueDate: t.due_date, createdAt: t.created_at 
      };
    });

    const columns: Record<string, Column> = {};
    const columnOrder: string[] = [];
    columnsRes.data?.forEach((c: any) => {
      columns[c.id] = { id: c.id, title: c.title, color: c.color, taskIds: [] };
      columnOrder.push(c.id);
    });

    Object.values(tasks).forEach(task => {
      if (columns[task.status]) columns[task.status].taskIds.push(task.id);
    });

    return {
      tasks,
      columns,
      columnOrder,
      priorities: prioritiesRes.data || [],
      assignees: assigneesRes.data || [],
      notes: notesRes.data?.map((n: any) => ({ ...n, createdAt: n.created_at })) || []
    };
  },

  // --- Task Mutations ---

  addTask: async (task: Partial<Task>): Promise<Task> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase.from('kanban_tasks').insert({
      title: task.title, description: task.description, status: task.status,
      priority: task.priority, assignee_id: task.assigneeId, due_date: task.dueDate, user_id: user.id
    }).select().single();
    if (error) throw error;
    return { ...data, assigneeId: data.assignee_id, dueDate: data.due_date, createdAt: data.created_at };
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const { data, error } = await supabase.from('kanban_tasks').update({
      title: updates.title, description: updates.description, status: updates.status,
      priority: updates.priority, assignee_id: updates.assigneeId, due_date: updates.dueDate
    }).eq('id', taskId).select().single();
    if (error) throw error;
    return { ...data, assigneeId: data.assignee_id, dueDate: data.due_date, createdAt: data.created_at };
  },

  deleteTask: async (taskId: string): Promise<void> => {
    const { error } = await supabase.from('kanban_tasks').delete().eq('id', taskId);
    if (error) throw error;
  },

  // --- Column Mutations ---

  addColumn: async (title: string, color: string): Promise<Column> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const { count } = await supabase.from('kanban_columns').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { data, error } = await supabase.from('kanban_columns').insert({
      title, color, position: count || 0, user_id: user.id
    }).select().single();
    if (error) throw error;
    return { ...data, taskIds: [] };
  },

  updateColumn: async (id: string, updates: Partial<Column>): Promise<void> => {
    const { error } = await supabase.from('kanban_columns').update(updates).eq('id', id);
    if (error) throw error;
  },

  deleteColumn: async (id: string): Promise<void> => {
    const { error } = await supabase.from('kanban_columns').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Priority Mutations ---

  addPriority: async (title: string, color: string): Promise<Priority> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase.from('kanban_priorities').insert({ title, color, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },

  updatePriority: async (id: string, updates: Partial<Priority>): Promise<void> => {
    const { error } = await supabase.from('kanban_priorities').update(updates).eq('id', id);
    if (error) throw error;
  },

  deletePriority: async (id: string): Promise<void> => {
    const { error } = await supabase.from('kanban_priorities').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Assignee Mutations ---

  addAssignee: async (name: string, email: string): Promise<Assignee> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    const { data, error } = await supabase.from('kanban_assignees').insert({ name, email, avatar, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },

  deleteAssignee: async (id: string): Promise<void> => {
    const { error } = await supabase.from('kanban_assignees').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Note Mutations (Fixes errors in NotesView) ---

  /**
   * Fix: Added missing addNote method to DataService
   */
  addNote: async (note: { title: string; content: string; color: string }): Promise<Note> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase.from('kanban_notes').insert({
      title: note.title, content: note.content, color: note.color, user_id: user.id
    }).select().single();
    if (error) throw error;
    return { ...data, createdAt: data.created_at };
  },

  /**
   * Fix: Added missing updateNote method to DataService
   */
  updateNote: async (note: Note): Promise<Note> => {
    const { data, error } = await supabase.from('kanban_notes').update({
      title: note.title, content: note.content, color: note.color
    }).eq('id', note.id).select().single();
    if (error) throw error;
    return { ...data, createdAt: data.created_at };
  },

  /**
   * Fix: Added missing deleteNote method to DataService
   */
  deleteNote: async (noteId: string): Promise<void> => {
    const { error } = await supabase.from('kanban_notes').delete().eq('id', noteId);
    if (error) throw error;
  },
};