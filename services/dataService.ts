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

  signup: async (name: string, email: string, password: string): Promise<User> => {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { name, avatar: avatarUrl } }
    });
    if (error) throw error;
    if (data.user) {
         if (!data.session) throw new Error("CONFIRM_EMAIL");
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

  restoreDefaults: async (): Promise<BoardData> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    await supabase.from('kanban_columns').delete().eq('user_id', user.id);
    await supabase.from('kanban_priorities').delete().eq('user_id', user.id);
    await DataService.seedUserData(user);
    return DataService.getBoardData();
  },

  getBoardData: async (): Promise<BoardData> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const [cols, prios, tasks, ass, notes] = await Promise.all([
        supabase.from('kanban_columns').select('*').eq('user_id', user.id).order('position'),
        supabase.from('kanban_priorities').select('*').eq('user_id', user.id),
        supabase.from('kanban_tasks').select('*').eq('user_id', user.id).order('position'),
        supabase.from('kanban_assignees').select('*').eq('user_id', user.id),
        supabase.from('kanban_notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    if (cols.data?.length === 0) {
        await DataService.seedUserData(user);
        return DataService.getBoardData();
    }

    const transformedTasks: Record<string, Task> = {};
    const columns: Record<string, Column> = {};
    const columnOrder: string[] = [];

    (cols.data || []).forEach(col => {
        columns[col.id] = { id: col.id, title: col.title, color: col.color, taskIds: [] };
        columnOrder.push(col.id);
    });

    (tasks.data || []).forEach(t => {
        const task: Task = {
            id: t.id, title: t.title, description: t.description, status: t.status,
            priority: t.priority, assigneeId: t.assignee_id, dueDate: t.due_date,
            createdAt: t.created_at, tags: [] 
        };
        transformedTasks[task.id] = task;
        if (columns[t.status]) columns[t.status].taskIds.push(t.id);
    });

    return {
        tasks: transformedTasks,
        columns,
        columnOrder,
        priorities: (prios.data || []).map(p => ({ id: p.id, title: p.title, color: p.color })),
        assignees: (ass.data || []).map(a => ({ id: a.id, name: a.name, email: a.email, avatar: a.avatar })),
        notes: (notes.data || []).map(n => ({ id: n.id, title: n.title, content: n.content, color: n.color, createdAt: n.created_at }))
    };
  },

  // --- Tasks ---

  addTask: async (task: Task): Promise<BoardData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");
    const { error } = await supabase.from('kanban_tasks').insert({
        title: task.title, description: task.description, status: task.status,
        priority: task.priority, assignee_id: task.assigneeId || null,
        due_date: task.dueDate, user_id: user.id, position: 9999
    });
    if (error) throw error;
    return DataService.getBoardData();
  },

  updateTask: async (task: Task): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_tasks').update({
        title: task.title, description: task.description, status: task.status,
        priority: task.priority, assignee_id: task.assigneeId || null, due_date: task.dueDate
    }).eq('id', task.id);
    if (error) throw error;
    return DataService.getBoardData();
  },

  updateTaskPosition: async (taskId: string, newStatus: string, newPosition: number) => {
      await supabase.from('kanban_tasks').update({ status: newStatus, position: newPosition }).eq('id', taskId);
  },

  deleteTask: async (taskId: string) => {
    await supabase.from('kanban_tasks').delete().eq('id', taskId);
    return DataService.getBoardData();
  },

  // --- Structural ---

  addColumn: async (title: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const id = `${title.trim().toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${user?.id}`;
    await supabase.from('kanban_columns').insert({ id, title, color, user_id: user?.id, position: 999 });
    return DataService.getBoardData();
  },

  deleteColumn: async (id: string) => {
    await supabase.from('kanban_columns').delete().eq('id', id);
    return DataService.getBoardData();
  },

  updateColumn: async (id: string, updates: any) => {
    await supabase.from('kanban_columns').update(updates).eq('id', id);
    return DataService.getBoardData();
  },

  addPriority: async (title: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const id = `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${user?.id}`;
    await supabase.from('kanban_priorities').insert({ id, title, color, user_id: user?.id });
    return DataService.getBoardData();
  },

  updatePriority: async (id: string, updates: any) => {
    await supabase.from('kanban_priorities').update(updates).eq('id', id);
    return DataService.getBoardData();
  },

  deletePriority: async (id: string) => {
    await supabase.from('kanban_priorities').delete().eq('id', id);
    return DataService.getBoardData();
  },

  addAssignee: async (name: string, email: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    await supabase.from('kanban_assignees').insert({ name, email, avatar, user_id: user?.id });
    return DataService.getBoardData();
  },

  deleteAssignee: async (id: string) => {
    await supabase.from('kanban_assignees').delete().eq('id', id);
    return DataService.getBoardData();
  },

  // --- Notes ---

  addNote: async (note: Partial<Note>): Promise<BoardData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");
    const id = `note_${Date.now()}_${user.id}`;
    const { error } = await supabase.from('kanban_notes').insert({
        id: id, title: note.title, content: note.content, color: note.color, user_id: user.id
    });
    if (error) throw error;
    return DataService.getBoardData();
  },

  updateNote: async (note: Note): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_notes').update({
        title: note.title, content: note.content, color: note.color
    }).eq('id', note.id);
    if (error) throw error;
    return DataService.getBoardData();
  },

  deleteNote: async (id: string): Promise<BoardData> => {
    const { error } = await supabase.from('kanban_notes').delete().eq('id', id);
    if (error) throw error;
    return DataService.getBoardData();
  }
};