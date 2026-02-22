
import { BoardData, Column, Task, User, Priority, Assignee, Note } from '../types';
import { supabase } from '../utils/supabaseClient';
import { DEFAULT_PRIORITIES, DEFAULT_COLUMNS } from '../constants';
import { sanitizeHtml } from '../utils/sanitizeHtml';

type ProfileUpdatePayload = Partial<Pick<User, 'name' | 'email' | 'avatar'>> & {
  newPassword?: string;
};

type AnyProfile = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
  is_active?: boolean;
  max_daily_minutes?: number | null;
  max_weekly_minutes?: number | null;
  created_at?: string;
  last_login?: string;
};

const getUnifiedProfile = async (userId: string): Promise<AnyProfile | null> => {
  const userProfilesRes = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  const profilesRes = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  const fromUserProfiles = (!userProfilesRes.error && userProfilesRes.data)
    ? (userProfilesRes.data as AnyProfile)
    : null;
  const fromProfiles = (!profilesRes.error && profilesRes.data)
    ? (profilesRes.data as AnyProfile)
    : null;

  if (!fromUserProfiles && !fromProfiles) return null;

  return {
    ...(fromProfiles || {}),
    ...(fromUserProfiles || {}),
    role: fromUserProfiles?.role || fromProfiles?.role || 'user',
  } as AnyProfile;
};

export const DataService = {
  
  // --- Auth & User ---

  getCurrentUser: async (): Promise<User | null> => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) return null;

        const profile = await getUnifiedProfile(session.user.id);
        const userRole = profile?.role || 'user';
        console.log('📋 getCurrentUser - Email:', session.user.email, 'Role:', userRole, 'Profile:', profile);

        return {
            id: session.user.id,
            name: profile?.name || session.user.user_metadata.name || session.user.email,
            email: session.user.email!,
            avatar: profile?.avatar || session.user.user_metadata.avatar,
            role: userRole
        };
    } catch (e) {
        console.error("Critical error in getCurrentUser:", e);
        return null;
    }
  },

  updateCurrentUser: async (userId: string, updates: ProfileUpdatePayload): Promise<User> => {
    const { name, email, avatar, newPassword } = updates;
    const cleanName = typeof name === 'string' ? name.trim() : undefined;
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined;
    const cleanAvatar = typeof avatar === 'string' ? avatar.trim() : undefined;
    const cleanPassword = typeof newPassword === 'string' ? newPassword.trim() : undefined;
    
    if (cleanPassword) {
      if (cleanPassword.length < 8) {
        throw new Error('PASSWORD_TOO_WEAK');
      }

      const { error: authError } = await supabase.auth.updateUser({ password: cleanPassword });
      if (authError) throw authError;
    }

    if (cleanEmail) {
      const { error: emailError } = await supabase.auth.updateUser({ email: cleanEmail });
      if (emailError) throw emailError;
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        name: cleanName, 
        email: cleanEmail, 
        avatar: cleanAvatar 
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
    if (!password) throw new Error("Senha obrigatória");
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) throw error;
    if (data.user) {
        const profile = await getUnifiedProfile(data.user.id);
        
        return {
            id: data.user.id,
            name: data.user.user_metadata.name || cleanEmail,
            email: data.user.email!,
            avatar: data.user.user_metadata.avatar,
            role: profile?.role || 'user'
        };
    }
    throw new Error("Falha no login");
  },

  signup: async (name: string, email: string, password: string): Promise<User | null> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random`;
    const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password, 
        options: { 
          data: { name: cleanName, avatar: avatarUrl },
          emailRedirectTo: window.location.origin
        }
    });

    if (error) throw error;

    const userIdentities = data.user?.identities;
    if (data.user && !data.session && Array.isArray(userIdentities) && userIdentities.length === 0) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }
    
    if (data.user) {
         if (!data.session) {
             throw new Error("CONFIRM_EMAIL");
         }
         
         await supabase.from('profiles').upsert({ id: data.user.id, name: cleanName, email: cleanEmail, avatar: avatarUrl });
         const newUser: User = { id: data.user.id, name: cleanName, email: cleanEmail, avatar: avatarUrl };
         await DataService.seedUserData(newUser);
         return newUser;
    }
    throw new Error("Falha ao criar conta");
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  seedUserData: async (user: User) => {
    // Garantir colunas padrão
    const { count: colCount } = await supabase.from('kanban_columns').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (!colCount || colCount === 0) {
        for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
            const col = DEFAULT_COLUMNS[i];
            await supabase.from('kanban_columns').insert({
                id: `${col.id}_${user.id}`, title: col.title, color: col.color, position: i, user_id: user.id
            });
        }
    }
    // Garantir prioridades padrão
    const { count: prioCount } = await supabase.from('kanban_priorities').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (!prioCount || prioCount === 0) {
        for (const prio of DEFAULT_PRIORITIES) {
            await supabase.from('kanban_priorities').insert({
                id: `${prio.id}_${user.id}`, title: prio.title, color: prio.color, user_id: user.id
            });
        }
    }
    // Garantir ao menos o próprio usuário como assignee
    const { count: assCount } = await supabase.from('kanban_assignees').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (!assCount || assCount === 0) {
        await supabase.from('kanban_assignees').insert({ name: user.name, email: user.email, avatar: user.avatar, user_id: user.id });
    }
  },

  restoreDefaults: async (): Promise<BoardData> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Não autenticado");

    await supabase.from('kanban_tasks').delete().eq('user_id', user.id);
    await supabase.from('kanban_columns').delete().eq('user_id', user.id);
    await supabase.from('kanban_priorities').delete().eq('user_id', user.id);
    await supabase.from('kanban_assignees').delete().eq('user_id', user.id);
    await supabase.from('kanban_notes').delete().eq('user_id', user.id);

    await DataService.seedUserData(user);
    return await DataService.fetchBoardData(user.id);
  },

  fetchBoardData: async (userId: string): Promise<BoardData> => {
    const [columnsRes, prioritiesRes, assigneesRes, notesRes] = await Promise.all([
      supabase.from('kanban_columns').select('*').eq('user_id', userId).order('position'),
      supabase.from('kanban_priorities').select('*').eq('user_id', userId),
      supabase.from('kanban_assignees').select('*').eq('user_id', userId),
      supabase.from('kanban_notes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    let tasksRes = await supabase
      .from('kanban_tasks')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (tasksRes.error && tasksRes.error.message?.includes('deleted_at')) {
      tasksRes = await supabase
        .from('kanban_tasks')
        .select('*')
        .eq('user_id', userId);
    }

    const tasks: Record<string, Task> = {};
    tasksRes.data?.forEach((t: any) => {
      tasks[t.id] = { 
        id: t.id,
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        assigneeId: t.assignee_id,
        dueDate: t.due_date,
        createdAt: t.created_at,
        position: typeof t.position === 'number' ? t.position : undefined,
        deletedAt: t.deleted_at
      };
    });

    const columns: Record<string, Column> = {};
    const columnOrder: string[] = [];
    columnsRes.data?.forEach((c: any) => {
      columns[c.id] = { id: c.id, title: c.title, color: c.color, taskIds: [] };
      columnOrder.push(c.id);
    });

    const tasksByColumn: Record<string, Task[]> = {};
    Object.values(tasks).forEach(task => {
      if (!columns[task.status]) return;
      if (!tasksByColumn[task.status]) tasksByColumn[task.status] = [];
      tasksByColumn[task.status].push(task);
    });

    Object.keys(columns).forEach(colId => {
      const colTasks = tasksByColumn[colId] || [];
      const hasPosition = colTasks.some(t => typeof t.position === 'number');
      const sorted = hasPosition
        ? [...colTasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        : colTasks;
      columns[colId].taskIds = sorted.map(t => t.id);
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

  addTask: async (task: Partial<Task>): Promise<Task> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Não autenticado");
    
    const cleanAssigneeId = (task.assigneeId && task.assigneeId.trim() !== '') ? task.assigneeId : null;
    const cleanPriority = (task.priority && task.priority.trim() !== '') ? task.priority : null;

    const { count } = await supabase
      .from('kanban_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', task.status);

    const { data, error } = await supabase.from('kanban_tasks').insert({
      title: task.title, 
      description: task.description, 
      status: task.status,
      priority: cleanPriority, 
      assignee_id: cleanAssigneeId,
      due_date: task.dueDate,
      position: count || 0,
      user_id: user.id
    }).select().single();
    
    if (error) throw error;
    return { ...data, assigneeId: data.assignee_id, dueDate: data.due_date, createdAt: data.created_at, position: data.position };
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const cleanAssigneeId = (updates.assigneeId && updates.assigneeId.trim() !== '') ? updates.assigneeId : null;
    const cleanPriority = (updates.priority && updates.priority.trim() !== '') ? updates.priority : null;

    const { data, error } = await supabase.from('kanban_tasks').update({
      title: updates.title, 
      description: updates.description, 
      status: updates.status,
      priority: cleanPriority, 
      assignee_id: cleanAssigneeId,
      due_date: updates.dueDate,
      position: updates.position,
      deleted_at: updates.deletedAt ?? null
    }).eq('id', taskId).select().single();
    
    if (error) throw error;
    return { ...data, assigneeId: data.assignee_id, dueDate: data.due_date, createdAt: data.created_at, position: data.position };
  },

  updateTaskPosition: async (taskId: string, newStatus: string, newPosition: number): Promise<void> => {
    const { error } = await supabase
      .from('kanban_tasks')
      .update({ status: newStatus, position: newPosition })
      .eq('id', taskId);
    if (error) throw error;
  },

  updateTaskOrder: async (columnId: string, orderedTaskIds: string[]): Promise<void> => {
    const updates = orderedTaskIds.map((id, index) => ({ id, status: columnId, position: index }));
    for (const upd of updates) {
      const { error } = await supabase.from('kanban_tasks').update({
        status: upd.status,
        position: upd.position
      }).eq('id', upd.id);
      if (error) throw error;
    }
  },

  deleteTask: async (taskId: string): Promise<void> => {
    const { error } = await supabase
      .from('kanban_tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', taskId);
    if (error) throw error;
  },

  restoreTask: async (taskId: string): Promise<void> => {
    const { error } = await supabase
      .from('kanban_tasks')
      .update({ deleted_at: null })
      .eq('id', taskId);
    if (error) throw error;
  },

  deleteTaskPermanently: async (taskId: string): Promise<void> => {
    const { error } = await supabase.from('kanban_tasks').delete().eq('id', taskId);
    if (error) throw error;
  },

  emptyTrash: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('kanban_tasks')
      .delete()
      .eq('user_id', userId)
      .not('deleted_at', 'is', null);
    if (error) throw error;
  },

  fetchTrashTasks: async (userId: string): Promise<Task[]> => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const deleteRes = await supabase
      .from('kanban_tasks')
      .delete()
      .eq('user_id', userId)
      .lt('deleted_at', cutoff);

    if (deleteRes.error && deleteRes.error.message?.includes('deleted_at')) {
      return [];
    }

    const { data, error } = await supabase
      .from('kanban_tasks')
      .select('*')
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      assigneeId: t.assignee_id,
      dueDate: t.due_date,
      createdAt: t.created_at,
      position: typeof t.position === 'number' ? t.position : undefined,
      deletedAt: t.deleted_at
    }));
  },

  addColumn: async (title: string, color: string): Promise<void> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Não autenticado");
    const { count } = await supabase.from('kanban_columns').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    
    const colId = crypto.randomUUID(); 
    
    const { error } = await supabase.from('kanban_columns').insert({
      id: colId,
      title, 
      color, 
      position: count || 0, 
      user_id: user.id
    });
    if (error) throw error;
  },

  updateColumn: async (id: string, updates: Partial<Column>): Promise<void> => {
    const { error } = await supabase.from('kanban_columns').update({
      title: updates.title,
      color: updates.color
    }).eq('id', id);
    if (error) throw error;
  },

  deleteColumn: async (id: string): Promise<void> => {
    const { error } = await supabase.from('kanban_columns').delete().eq('id', id);
    if (error) throw error;
  },

  addPriority: async (title: string, color: string): Promise<void> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Não autenticado");
    
    const prioId = crypto.randomUUID(); 
    
    const { error } = await supabase.from('kanban_priorities').insert({
      id: prioId,
      title, 
      color, 
      user_id: user.id
    });
    if (error) throw error;
  },

  updatePriority: async (id: string, updates: Partial<Priority>): Promise<void> => {
    const { error } = await supabase.from('kanban_priorities').update({
      title: updates.title,
      color: updates.color
    }).eq('id', id);
    if (error) throw error;
  },

  deletePriority: async (id: string): Promise<void> => {
    const { error } = await supabase.from('kanban_priorities').delete().eq('id', id);
    if (error) throw error;
  },

  addAssignee: async (name: string, email: string): Promise<void> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Não autenticado");
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    const { error } = await supabase.from('kanban_assignees').insert({
      name, email, avatar: avatarUrl, user_id: user.id
    });
    if (error) throw error;
  },

  deleteAssignee: async (id: string): Promise<void> => {
    const { error } = await supabase.from('kanban_assignees').delete().eq('id', id);
    if (error) throw error;
  },

  addNote: async (note: Partial<Note>): Promise<void> => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Não autenticado");
    
    const noteId = crypto.randomUUID();
    
    const { error } = await supabase.from('kanban_notes').insert({
      id: noteId,
      title: note.title,
      content: sanitizeHtml(note.content || ''),
      color: note.color,
      user_id: user.id
    });
    if (error) throw error;
  },

  updateNote: async (note: Note): Promise<void> => {
    const { error } = await supabase.from('kanban_notes').update({
      title: note.title,
      content: sanitizeHtml(note.content || ''),
      color: note.color
    }).eq('id', note.id);
    if (error) throw error;
  },

  deleteNote: async (id: string): Promise<void> => {
    const { error } = await supabase.from('kanban_notes').delete().eq('id', id);
    if (error) throw error;
  },

  savePushSubscription: async (subscription: PushSubscription) => {
    const user = await DataService.getCurrentUser();
    if (!user) throw new Error("Não autenticado");

    const json = subscription.toJSON();
    const endpoint = subscription.endpoint;
    const p256dh = json.keys?.p256dh || '';
    const auth = json.keys?.auth || '';

    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint,
      p256dh,
      auth
    }, { onConflict: 'endpoint' });

    if (error) throw error;
  }
};
