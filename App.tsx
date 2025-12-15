import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Layout, LayoutDashboard, Settings, Plus, LogOut, Globe, User as UserIcon, Lock, Mail, Bell, Calendar, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle, Kanban, List, ArrowLeft, KeyRound, Link as LinkIcon, ShieldAlert, Menu, X, RefreshCw } from 'lucide-react';
import { DataService } from './services/dataService';
import { BoardData, Task, User, Priority } from './types';
import { KanbanBoard } from './views/KanbanBoard';
import { TableView } from './views/TableView';
import { Dashboard } from './views/Dashboard';
import { SettingsView } from './views/SettingsView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { ConfirmationModal, Modal } from './components/Shared';
import { DropResult } from '@hello-pangea/dnd';
import { LanguageProvider, useLanguage } from './utils/i18n';
import { supabase } from './utils/supabaseClient';

// -- Login / Signup / Direct Reset Flow --
type AuthMode = 'login' | 'signup' | 'direct_reset';

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<AuthMode>('login');
  
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
      if (mode === 'login') {
        if (!email || !password) throw new Error(t('fillAllFields'));
        const user = await DataService.login(email, password);
        onLogin(user);

      } else if (mode === 'signup') {
        if (!name || !email || !password) throw new Error(t('fillAllFields'));
        const user = await DataService.signup(name, email, password);
        onLogin(user);

      } else if (mode === 'direct_reset') {
        // Direct Database Update (Internal Mode)
        if (!email || !password) throw new Error(t('fillAllFields'));
        if (password.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");

        // Call the admin bypass
        await DataService.adminForcePasswordReset(email, password);
        
        setSuccessMsg("Senha alterada com sucesso! Você pode fazer login agora.");
        // Clear fields and go back to login after delay
        setTimeout(() => {
            setMode('login');
            setPassword('');
        }, 2000);
      }
      
    } catch (err: any) {
      if (err.message === 'CONFIRM_EMAIL') {
          setSuccessMsg(t('checkEmail'));
          setMode('login'); 
          setPassword('');
      } else {
          // Improve error message if Service Key is missing
          if (err.message.includes("Service Role")) {
              setError("Erro de Configuração: Adicione a chave Service Role no arquivo supabaseClient.ts");
          } else {
              setError(err.message || t('loginError'));
          }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setPassword('');
  };

  // --- Sub-Components for Direct Reset ---

  // Direct Password Reset View
  if (mode === 'direct_reset') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
             <div className="mb-6">
                <button 
                    onClick={() => toggleMode('login')}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm mb-4 transition-colors"
                >
                    <ArrowLeft size={16} /> Voltar para Login
                </button>
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <ShieldAlert size={24} />
                    <h1 className="text-2xl font-bold text-slate-900">Redefinir Senha</h1>
                </div>
                <p className="text-slate-500 mt-2 text-sm">
                    Modo Interno: Digite seu e-mail e a nova senha desejada. O sistema verificará se o cadastro existe e atualizará a senha imediatamente.
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
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

                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Nova Senha"
                      required
                      minLength={6}
                    />
                 </div>

                 <button 
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center shadow-md shadow-indigo-100"
                 >
                    {loading ? 'Atualizando...' : 'Alterar Senha Agora'}
                 </button>
             </form>
             
             {error && <div className="mt-4 text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</div>}
             {successMsg && <div className="mt-4 text-green-600 text-sm text-center bg-green-50 py-2 rounded-lg border border-green-100">{successMsg}</div>}
          </div>
        </div>
    );
  }

  // Standard Login/Signup View
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
             <Layout className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">HybridTaskManager</h1>
          <p className="text-slate-500 mt-2">
            {mode === 'login' ? t('welcomeBack') : t('enterDetails')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Signup: Name Field */}
          {mode === 'signup' && (
            <div className="relative">
               <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 placeholder={t('name')}
                 required={mode === 'signup'}
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

          {mode === 'login' && (
             <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => toggleMode('direct_reset')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                    {t('forgotPassword')}
                </button>
             </div>
          )}

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
              ? (mode === 'login' ? t('signingIn') : t('signingUp')) 
              : (mode === 'login' ? t('signIn') : t('signUp'))
            }
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
            <button 
              onClick={() => toggleMode(mode === 'login' ? 'signup' : 'login')} 
              className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
            >
              {mode === 'login' ? t('signUp') : t('signIn')}
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appError, setAppError] = useState<string>('');
  const [isRetryLoading, setIsRetryLoading] = useState(false);
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Delete Confirmation State
  const [deleteIntent, setDeleteIntent] = useState<{ type: 'task' | 'column' | 'priority' | 'assignee', id: string } | null>(null);

  const loadData = async () => {
    setAppError('');
    setIsRetryLoading(true);
    try {
      const boardData = await DataService.getBoardData();
      setData(boardData);
    } catch (e: any) {
      console.error("Failed to load board data", e);
      setAppError(e.message || "Failed to connect to database. Please check your connection.");
    } finally {
      setIsRetryLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
        loadData();
    }
  }, [user.id]);

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

  // --- Restore Defaults ---
  const handleRestoreDefaults = async () => {
      setAppError('');
      try {
          const newData = await DataService.restoreDefaults();
          setData(newData);
      } catch (e: any) {
          setAppError("Erro ao restaurar padrões: " + e.message);
      }
  };

  // ERROR HANDLING BLOCK - Show before checking for 'data'
  if (appError && !data) {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Erro de Conexão</h2>
                <p className="text-slate-500 mb-6">{appError}</p>
                <button 
                    onClick={loadData}
                    disabled={isRetryLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                    <RefreshCw size={18} className={isRetryLoading ? "animate-spin" : ""} />
                    {isRetryLoading ? "Reconectando..." : "Tentar Novamente"}
                </button>
            </div>
        </div>
    );
  }

  if (!data) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-500 flex-col gap-3">
             <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="text-sm font-medium">Carregando seus dados...</p>
        </div>
      );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden relative">
        
        {/* Mobile Sidebar Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
            fixed inset-y-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0
            ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
            w-64
        `}>
          <div className={`p-6 flex items-center justify-between gap-3 ${isSidebarCollapsed ? 'md:justify-center' : ''}`}>
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                  <Layout className="text-white w-5 h-5" />
                </div>
                <span className={`font-bold text-white tracking-tight animate-in fade-in duration-300 ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>HybridTask</span>
             </div>
             {/* Mobile Close Button */}
             <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                <X size={20} />
             </button>
          </div>

          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex absolute top-8 -right-3 bg-indigo-600 text-white p-1 rounded-full border-2 border-slate-900 z-50 hover:bg-indigo-700 shadow-md transition-transform hover:scale-105"
            title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <nav className="flex-1 px-3 space-y-1 mt-6">
            <NavLink 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                title={isSidebarCollapsed ? t('dashboard') : ''} 
                className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span className={isSidebarCollapsed ? 'md:hidden' : ''}>{t('dashboard')}</span>
            </NavLink>
            <NavLink 
                to="/board" 
                onClick={() => setIsMobileMenuOpen(false)}
                title={isSidebarCollapsed ? t('kanban') : ''} 
                className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Kanban size={18} />
              <span className={isSidebarCollapsed ? 'md:hidden' : ''}>{t('kanban')}</span>
            </NavLink>
            <NavLink 
                to="/table" 
                onClick={() => setIsMobileMenuOpen(false)}
                title={isSidebarCollapsed ? t('table') : ''} 
                className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <List size={18} />
              <span className={isSidebarCollapsed ? 'md:hidden' : ''}>{t('table')}</span>
            </NavLink>
            <NavLink 
                to="/settings" 
                onClick={() => setIsMobileMenuOpen(false)}
                title={isSidebarCollapsed ? t('settings') : ''} 
                className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Settings size={18} />
              <span className={isSidebarCollapsed ? 'md:hidden' : ''}>{t('settings')}</span>
            </NavLink>
          </nav>

          <div className="p-4 border-t border-slate-800">
             <div className="flex flex-col gap-2">
                 {/* Profile Button */}
                 <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors hover:bg-slate-800 text-left w-full ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    title={user.name}
                 >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover shrink-0" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30 shrink-0">
                            {user.name.charAt(0)}
                        </div>
                    )}
                    
                    <div className={`overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
                         <p className="text-sm font-medium text-white truncate w-32">{user.name}</p>
                         <p className="text-xs text-slate-500">{t('editProfile')}</p>
                    </div>
                 </button>

                 {/* Logout Button */}
                 <button 
                    onClick={onLogout}
                    className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-red-400 hover:bg-slate-800 hover:text-red-300 w-full ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    title={t('logout')}
                 >
                   <LogOut size={20} className="shrink-0" />
                   <span className={`font-medium ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>{t('logout')}</span>
                 </button>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10">
             <div className="flex items-center gap-3">
                 {/* Mobile Menu Button */}
                 <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                 >
                    <Menu size={24} />
                 </button>
                 <h2 className="text-xl font-semibold text-slate-800 truncate">{t('projectOverview')}</h2>
             </div>
             
             <div className="flex items-center gap-2 md:gap-4">
                {/* Error Banner */}
                {appError && (
                    <div className="hidden md:flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-100 animate-in slide-in-from-top-2">
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
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                <Plus size={18} />
                <span className="hidden sm:inline">{t('newTask')}</span>
                </button>
             </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8 relative">
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
                  onRestoreDefaults={handleRestoreDefaults}
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
    let mounted = true;

    // Safety timeout to prevent infinite loading on refresh (F5)
    // If Supabase auth doesn't respond in 3 seconds, we stop loading
    const safetyTimeout = setTimeout(() => {
        if (mounted && loading) {
            console.warn("Auth check timed out, forcing load completion");
            setLoading(false);
        }
    }, 3000);

    const init = async () => {
      try {
        // Try getting user directly first (validate token with server)
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (mounted) {
            if (user && !error) {
                // Manually map to our User type
                const currentUser = await DataService.getCurrentUser();
                setUser(currentUser);
            }
            setLoading(false);
        }
      } catch (error) {
        console.debug("No active session or error", error);
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
             // Re-fetch to be safe
             const currentUser = await DataService.getCurrentUser();
             if (mounted) {
                 setUser(currentUser);
                 setLoading(false);
             }
        } else if (event === 'SIGNED_OUT') {
             if (mounted) {
               setUser(null);
               setLoading(false);
             }
        }
    });

    return () => {
        mounted = false;
        clearTimeout(safetyTimeout);
        subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    // Optimistically clear user state immediately to avoid loop/lag
    setUser(null);
    try {
        await DataService.logout();
    } catch (e) {
        console.error("Logout error", e);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
     setUser(prev => prev ? ({ ...prev, ...updatedUser }) : null);
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Carregando...</p>
            </div>
        </div>
    );
  }

  return (
    <LanguageProvider>
       {user ? (
         <MainApp user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
       ) : (
         <Login onLogin={setUser} />
       )}
    </LanguageProvider>
  );
};

export default App;