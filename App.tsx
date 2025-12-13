import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Layout, LayoutDashboard, Settings, Plus, LogOut, Globe, User as UserIcon, Lock, Mail, Bell, Calendar, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle, Kanban, List } from 'lucide-react';
import { DataService } from './services/dataService';
import { BoardData, Task, User, Priority } from './types';
import { KanbanBoard } from './views/KanbanBoard';
import { TableView } from './views/TableView';
import { Dashboard } from './views/Dashboard';
import { SettingsView } from './views/SettingsView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { ConfirmationModal } from './components/Shared';
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
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
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
        // Signup success (auto-login scenario)
        onLogin(user);
      }
    } catch (err: any) {
      if (err.message === 'CONFIRM_EMAIL') {
          // Special case: Signup successful, but email confirmation required
          setSuccessMsg(t('checkEmail'));
          setIsLogin(true); // Switch back to login
          setPassword(''); // Clear password
      } else {
          setError(isLogin ? t('loginError') : (err.message || t('signupError')));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
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

          {successMsg && (
            <div className="text-green-600 text-sm flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [appError, setAppError] = useState<string>('');
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Delete Confirmation State
  const [deleteIntent, setDeleteIntent] = useState<{ type: 'task' | 'column' | 'priority' | 'assignee', id: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const boardData = await DataService.getBoardData();
        setData(boardData);
      } catch (e) {
        console.error("Failed to load board data", e);
        setAppError("Failed to connect to database. Please check your connection.");
      }
    };
    load();
  }, []);

  // Notifications Logic
  const notifications = useMemo(() => {
    if (!data) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const tasks = (Object.values(data.tasks) as Task[]).filter(task => {
        const isDone = task.status.toLowerCase().includes('done') || task.status === 'Done';
        return !isDone; 
    });

    const notifs = tasks.map(task => {
        if (!task.dueDate) return null;
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

    // Optimistic Update locally
    const newData = { ...data };
    
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...startColumn, taskIds: newTaskIds };
      newData.columns[newColumn.id] = newColumn;
      
      // Update DB (Reorder)
      DataService.updateTaskPosition(draggableId, startColumn.id, destination.index);

    } else {
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = { ...startColumn, taskIds: startTaskIds };

      const finishTaskIds = Array.from(finishColumn.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinish = { ...finishColumn, taskIds: finishTaskIds };

      newData.columns[newStart.id] = newStart;
      newData.columns[newFinish.id] = newFinish;
      newData.tasks[draggableId].status = finishColumn.id;

      // Update DB (Move Column)
      DataService.updateTaskPosition(draggableId, finishColumn.id, destination.index);
    }

    setData(newData);
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    setAppError('');
    try {
      if (editingTask) {
        const updated = { ...editingTask, ...task } as Task;
        const newData = await DataService.updateTask(updated);
        setData(newData);
      } else {
        const newTask: Task = {
          id: '', // ID will be generated by Supabase
          status: data?.columnOrder[0] || 'To Do',
          createdAt: new Date().toISOString(),
          tags: [],
          ...(task as any)
        };
        const newData = await DataService.addTask(newTask);
        setData(newData);
      }
      setEditingTask(undefined);
    } catch (e: any) {
        console.error(e);
        setAppError("Error saving task: " + e.message);
    }
  };

  // --- Deletion Handlers with Confirmation ---

  const requestDeleteTask = (taskId: string) => {
    setDeleteIntent({ type: 'task', id: taskId });
  };

  const requestDeleteColumn = (columnId: string) => {
    setDeleteIntent({ type: 'column', id: columnId });
  };

  const requestDeletePriority = (priorityId: string) => {
    setDeleteIntent({ type: 'priority', id: priorityId });
  };

  const requestDeleteAssignee = (assigneeId: string) => {
    setDeleteIntent({ type: 'assignee', id: assigneeId });
  };

  const executeDelete = async () => {
    if (!deleteIntent) return;
    
    setAppError('');
    try {
        let newData = null;
        if (deleteIntent.type === 'task') {
             newData = await DataService.deleteTask(deleteIntent.id);
        } else if (deleteIntent.type === 'column') {
             newData = await DataService.deleteColumn(deleteIntent.id);
        } else if (deleteIntent.type === 'priority') {
             newData = await DataService.deletePriority(deleteIntent.id);
        } else if (deleteIntent.type === 'assignee') {
             newData = await DataService.deleteAssignee(deleteIntent.id);
        }

        if (newData) setData(newData);
    } catch (e: any) {
        setAppError("Error deleting: " + e.message);
    } finally {
        setDeleteIntent(null);
    }
  };

  const getConfirmationTitle = () => {
    switch (deleteIntent?.type) {
        case 'task': return t('confirmDeleteTaskTitle');
        case 'column': return t('confirmDeleteCategoryTitle');
        case 'priority': return t('confirmDeletePriorityTitle');
        case 'assignee': return "Excluir Responsável";
        default: return t('confirmDeleteTitle');
    }
  };

  const getConfirmationMessage = () => {
    switch (deleteIntent?.type) {
        case 'task': return t('confirmDeleteTaskMessage');
        case 'column': return t('confirmDeleteCategoryMessage');
        case 'priority': return t('confirmDeletePriorityMessage');
        case 'assignee': return "Tem certeza que deseja remover este responsável?";
        default: return t('confirmDeleteMessage');
    }
  };

  // -------------------------------------------

  const openNewTask = () => {
    setEditingTask(undefined);
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddColumn = async (title: string, color: string) => {
    setAppError('');
    try {
        const newData = await DataService.addColumn(title, color);
        setData(newData);
    } catch (e: any) {
        setAppError("Error: " + e.message);
    }
  };

  const handleUpdateColumn = async (id: string, updates: any) => {
    setAppError('');
    try {
        const newData = await DataService.updateColumn(id, updates);
        setData(newData);
    } catch (e: any) {
        setAppError("Error: " + e.message);
    }
  };

  const handleAddPriority = async (title: string, color: string) => {
    setAppError('');
    try {
        const newData = await DataService.addPriority(title, color);
        setData(newData);
    } catch (e: any) {
        setAppError("Error: " + e.message);
    }
  };

  const handleUpdatePriority = async (id: string, updates: Partial<Priority>) => {
    setAppError('');
    try {
        const newData = await DataService.updatePriority(id, updates);
        setData(newData);
    } catch (e: any) {
        setAppError("Error: " + e.message);
    }
  };

  const handleAddAssignee = async (name: string, email: string) => {
    setAppError('');
    try {
        const newData = await DataService.addAssignee(name, email);
        setData(newData);
    } catch (e: any) {
        setAppError("Error: " + e.message);
    }
  };

  const handleUpdateProfile = async (userId: string, updateData: Partial<User>) => {
    setAppError('');
    try {
        const updatedUser = await DataService.updateCurrentUser(userId, updateData);
        onUpdateUser(updatedUser);
    } catch (e: any) {
        setAppError("Error updating profile: " + e.message);
    }
  };

  if (!data) return <div className="flex items-center justify-center h-screen text-slate-500">Connecting to database...</div>;

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 transition-all duration-300 relative`}>
          <div className={`p-6 flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
               <Layout className="text-white w-5 h-5" />
             </div>
             {!isSidebarCollapsed && <span className="font-bold text-white tracking-tight animate-in fade-in duration-300">HybridTask</span>}
          </div>

          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute top-8 -right-3 bg-indigo-600 text-white p-1 rounded-full border-2 border-slate-900 z-50 hover:bg-indigo-700 shadow-md transition-transform hover:scale-105"
            title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <nav className="flex-1 px-3 space-y-1 mt-6">
            <NavLink to="/" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <LayoutDashboard size={18} title={isSidebarCollapsed ? t('dashboard') : ''} />
              {!isSidebarCollapsed && <span>{t('dashboard')}</span>}
            </NavLink>
            <NavLink to="/board" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <Kanban size={18} title={isSidebarCollapsed ? t('kanban') : ''} />
              {!isSidebarCollapsed && <span>{t('kanban')}</span>}
            </NavLink>
            <NavLink to="/table" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <List size={18} title={isSidebarCollapsed ? t('table') : ''} />
              {!isSidebarCollapsed && <span>{t('table')}</span>}
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <Settings size={18} title={isSidebarCollapsed ? t('settings') : ''} />
              {!isSidebarCollapsed && <span>{t('settings')}</span>}
            </NavLink>
          </nav>

          <div className="p-4 border-t border-slate-800">
             <div className="flex flex-col gap-4">
                 <div className={`flex items-center gap-3 px-2 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`} onClick={() => setIsProfileModalOpen(true)}>
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover shrink-0" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30 shrink-0">
                            {user.name.charAt(0)}
                        </div>
                    )}
                    
                    {!isSidebarCollapsed && (
                       <div className="overflow-hidden animate-in fade-in duration-300">
                         <p className="text-sm font-medium text-white truncate w-24">{user.name}</p>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onLogout(); }} 
                            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 mt-0.5"
                         >
                           <LogOut size={10} /> {t('logout')}
                         </button>
                       </div>
                    )}
                 </div>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
             <h2 className="text-xl font-semibold text-slate-800">{t('projectOverview')}</h2>
             
             <div className="flex items-center gap-4">
                {/* Error Banner */}
                {appError && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-100 animate-in slide-in-from-top-2">
                        <AlertTriangle size={14} />
                        <span>{appError}</span>
                        <button onClick={() => setAppError('')} className="ml-1 hover:text-red-800 font-bold">×</button>
                    </div>
                )}

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
                  onDeleteTask={requestDeleteTask}
                />
              } />
              <Route path="/table" element={
                <TableView 
                  data={data} 
                  onEditTask={openEditTask} 
                  onDeleteTask={requestDeleteTask}
                />
              } />
              <Route path="/settings" element={
                <SettingsView 
                  data={data} 
                  onAddColumn={handleAddColumn}
                  onUpdateColumn={handleUpdateColumn}
                  onDeleteColumn={requestDeleteColumn}
                  onAddPriority={handleAddPriority}
                  onUpdatePriority={handleUpdatePriority}
                  onDeletePriority={requestDeletePriority}
                  onAddAssignee={handleAddAssignee}
                  onDeleteAssignee={requestDeleteAssignee}
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
        onDelete={requestDeleteTask}
        initialData={editingTask}
        boardData={data}
      />

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />

      {/* Global Confirmation Modal */}
      <ConfirmationModal 
        isOpen={!!deleteIntent}
        onClose={() => setDeleteIntent(null)}
        onConfirm={executeDelete}
        title={getConfirmationTitle()}
        message={getConfirmationMessage()}
      />
    </HashRouter>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await DataService.getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.error("No user found or session expired");
        // User remains null
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await DataService.logout();
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading...</p>
      </div>
    );
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

export default App;