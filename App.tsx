import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Layout, LayoutDashboard, Table2, Settings, Plus, LogOut, Globe, User as UserIcon, Lock, Mail, Bell, Calendar } from 'lucide-react';
import { DataService } from './services/dataService';
import { BoardData, Task, User, Priority } from './types';
import { KanbanBoard } from './views/KanbanBoard';
import { TableView } from './views/TableView';
import { Dashboard } from './views/Dashboard';
import { SettingsView } from './views/SettingsView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { DropResult } from '@hello-pangea/dnd';
import { LanguageProvider, useLanguage } from './utils/i18n';

// -- Login / Signup Component --
const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!email || !password) {
             throw new Error(t('fillAllFields'));
        }
        const user = await DataService.login(email, password);
        onLogin(user);
      } else {
        if (!name || !email || !password) {
            throw new Error(t('fillAllFields'));
        }
        const user = await DataService.signup(name, email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(isLogin ? t('loginError') : (err.message || t('signupError')));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
             <Layout className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">HybridTaskManager</h1>
          <p className="text-slate-500 mt-2">
            {isLogin ? t('welcomeBack') : t('enterDetails')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Signup: Name Field */}
          {!isLogin && (
            <div className="relative">
               <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 placeholder={t('name')}
                 required={!isLogin}
               />
            </div>
          )}

          {/* Email Field */}
          <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="email" 
               value={email}
               onChange={e => setEmail(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
               placeholder={t('email')}
               required
             />
          </div>

          {/* Password Field */}
          <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="password" 
               value={password}
               onChange={e => setPassword(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
               placeholder={t('password')}
               required
             />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center shadow-md shadow-indigo-100 mt-2"
          >
            {loading 
              ? (isLogin ? t('signingIn') : t('signingUp')) 
              : (isLogin ? t('signIn') : t('signUp'))
            }
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
            <button 
              onClick={toggleMode} 
              className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
            >
              {isLogin ? t('signUp') : t('signIn')}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

// -- Main App Content (Wrapped in Context) --
const MainApp = ({ user, onLogout, onUpdateUser }: { user: User, onLogout: () => void, onUpdateUser: (u: User) => void }) => {
  const { t } = useLanguage();
  const [data, setData] = useState<BoardData | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const boardData = await DataService.getBoardData();
      setData(boardData);
    };
    load();
  }, []);

  // Notifications Logic
  const notifications = useMemo(() => {
    if (!data) return [];
    
    const now = new Date();
    // Reset time part for accurate date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const tasks = (Object.values(data.tasks) as Task[]).filter(task => {
        // Skip Done tasks
        const isDone = task.status.toLowerCase().includes('done') || task.status === 'Done'; // Simplified check
        return !isDone; 
    });

    const notifs = tasks.map(task => {
        const dueDate = new Date(task.dueDate);
        const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        
        const diffTime = dueDay.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { task, type: 'overdue', days: Math.abs(diffDays) };
        } else if (diffDays === 0) {
            return { task, type: 'today', days: 0 };
        } else if (diffDays <= 3) {
            return { task, type: 'soon', days: diffDays };
        }
        return null;
    }).filter(n => n !== null);
    
    // Sort: Today first, then Overdue, then Soon
    return notifs.sort((a, b) => {
        const priorityOrder = { today: 0, overdue: 1, soon: 2 };
        return (priorityOrder[a!.type] - priorityOrder[b!.type]);
    }) as { task: Task, type: 'overdue' | 'today' | 'soon', days: number }[];
  }, [data]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !data) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Optimistic Update
    const newData = { ...data };
    
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...startColumn, taskIds: newTaskIds };
      newData.columns[newColumn.id] = newColumn;
    } else {
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = { ...startColumn, taskIds: startTaskIds };

      const finishTaskIds = Array.from(finishColumn.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finishColumn, taskIds: finishTaskIds };

      newData.columns[newStart.id] = newStart;
      newData.columns[newFinish.id] = newFinish;

      // Update task status in data
      newData.tasks[draggableId].status = finishColumn.id;
    }

    setData(newData);
    DataService.saveBoardData(newData);
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    if (editingTask) {
      // Update
      const updated = { ...editingTask, ...task } as Task;
      const newData = await DataService.updateTask(updated);
      setData(newData);
    } else {
      // Create
      const newTask: Task = {
        id: `task-${Date.now()}`,
        status: data?.columnOrder[0] || 'To Do',
        createdAt: new Date().toISOString(),
        tags: [],
        ...(task as any)
      };
      const newData = await DataService.addTask(newTask);
      setData(newData);
    }
    setEditingTask(undefined);
  };

  const handleDeleteTask = async (taskId: string) => {
    const newData = await DataService.deleteTask(taskId);
    setData(newData);
  };

  const openNewTask = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddColumn = async (title: string, color: string) => {
    const newData = await DataService.addColumn(title, color);
    setData(newData);
  };

  const handleUpdateColumn = async (id: string, updates: any) => {
    const newData = await DataService.updateColumn(id, updates);
    setData(newData);
  };

  const handleDeleteColumn = async (id: string) => {
    if (window.confirm(t('confirmDeleteCategory'))) {
        const newData = await DataService.deleteColumn(id);
        setData(newData);
    }
  };

  // -- Priority Handlers --
  const handleAddPriority = async (title: string, color: string) => {
    const newData = await DataService.addPriority(title, color);
    setData(newData);
  };

  const handleUpdatePriority = async (id: string, updates: Partial<Priority>) => {
    const newData = await DataService.updatePriority(id, updates);
    setData(newData);
  };

  const handleDeletePriority = async (id: string) => {
    if (window.confirm(t('deletePriority') + '?')) {
        const newData = await DataService.deletePriority(id);
        setData(newData);
    }
  };

  const handleUpdateProfile = async (userId: string, updateData: Partial<User>) => {
    const updatedUser = await DataService.updateCurrentUser(userId, updateData);
    onUpdateUser(updatedUser);
  };

  if (!data) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20">
          <div className="p-6 flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
               <Layout className="text-white w-5 h-5" />
             </div>
             <span className="font-bold text-white tracking-tight">HybridTask</span>
          </div>

          <nav className="flex-1 px-3 space-y-1 mt-6">
            <NavLink to="/" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              <LayoutDashboard size={18} />
              <span>{t('dashboard')}</span>
            </NavLink>
            <NavLink to="/board" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              <Layout size={18} />
              <span>{t('kanban')}</span>
            </NavLink>
            <NavLink to="/table" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              <Table2 size={18} />
              <span>{t('table')}</span>
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              <Settings size={18} />
              <span>{t('settings')}</span>
            </NavLink>
          </nav>

          <div className="p-4 border-t border-slate-800">
             <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between px-2 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors" onClick={() => setIsProfileModalOpen(true)}>
                    <div className="flex items-center gap-3">
                       {user.avatar ? (
                           <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover" />
                       ) : (
                           <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                             {user.name.charAt(0)}
                           </div>
                       )}
                       <div className="overflow-hidden">
                         <p className="text-sm font-medium text-white truncate w-24">{user.name}</p>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onLogout(); }} 
                            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 mt-0.5"
                         >
                           <LogOut size={10} /> {t('logout')}
                         </button>
                       </div>
                    </div>
                 </div>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
             <h2 className="text-xl font-semibold text-slate-800">{t('projectOverview')}</h2>
             
             <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <div className="relative">
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`p-2 rounded-full transition-colors relative ${isNotificationsOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-3 border-b border-slate-100 bg-slate-50">
                                    <h3 className="font-semibold text-sm text-slate-700">{t('notifications')}</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-slate-400 text-sm">
                                            {t('noNotifications')}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {notifications.map((n, idx) => (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => {
                                                        openEditTask(n.task);
                                                        setIsNotificationsOpen(false);
                                                    }}
                                                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'today' || n.type === 'overdue' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800 line-clamp-1">{n.task.title}</p>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Calendar size={12} className={n.type === 'today' || n.type === 'overdue' ? 'text-red-500' : 'text-amber-500'} />
                                                                <span className={`text-xs font-medium ${n.type === 'today' || n.type === 'overdue' ? 'text-red-500' : 'text-amber-500'}`}>
                                                                    {n.type === 'today' ? t('dueToday') : (n.type === 'overdue' ? `${n.days} ${t('daysOverdue')}` : `${t('dueInDays')} ${n.days} ${t('daysOld')}`)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <button 
                onClick={openNewTask}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                <Plus size={18} />
                {t('newTask')}
                </button>
             </div>
          </header>

          <div className="flex-1 overflow-auto p-8 relative">
            <Routes>
              <Route path="/" element={<Dashboard data={data} />} />
              <Route path="/board" element={
                <KanbanBoard 
                  data={data} 
                  onDragEnd={handleDragEnd} 
                  onEditTask={openEditTask} 
                  onDeleteTask={handleDeleteTask}
                />
              } />
              <Route path="/table" element={
                <TableView 
                  data={data} 
                  onEditTask={openEditTask} 
                  onDeleteTask={handleDeleteTask}
                />
              } />
              <Route path="/settings" element={
                <SettingsView 
                  data={data} 
                  onAddColumn={handleAddColumn}
                  onUpdateColumn={handleUpdateColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onAddPriority={handleAddPriority}
                  onUpdatePriority={handleUpdatePriority}
                  onDeletePriority={handleDeletePriority}
                />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSubmit={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={editingTask}
        boardData={data}
      />

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />
    </HashRouter>
  );
};

const AppShell = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const load = () => {
      const u = DataService.getCurrentUser();
      setUser(u);
    };
    load();
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    DataService.logout();
    setUser(null);
  };

  const handleUpdateUser = (u: User) => {
    setUser(u);
  }

  return (
    <LanguageProvider>
      {user ? (
        <MainApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </LanguageProvider>
  );
};

export default AppShell;