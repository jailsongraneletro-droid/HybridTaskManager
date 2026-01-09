import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  Layout, LayoutDashboard, Settings, Plus, LogOut, Globe, User as UserIcon, 
  Lock, Mail, Bell, Calendar, CheckCircle, Circle, AlertTriangle, Kanban, List, ArrowLeft, KeyRound, Link as LinkIcon, 
  ShieldAlert, Menu, X, RefreshCw, StickyNote, WifiOff, Clock, BarChart3,
  Layers, ChevronDown, Rocket, CheckCircle2, Zap, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2 as CheckIcon,
  Download, ChevronLeft, ChevronRight, Edit3, Volume2, MousePointer2, Sparkles, Smartphone, Shield, HelpCircle, 
  BookOpen, CheckSquare, ArrowRight, MousePointerClick, Filter, PieChart as ChartIcon, Monitor
} from 'lucide-react';
import { DataService } from './services/dataService';
import { BoardData, Task, User, Priority } from './types';
import { KanbanBoard } from './views/KanbanBoard';
import { TableView } from './views/TableView';
import { Dashboard } from './views/Dashboard';
import { SettingsView } from './views/SettingsView';
import { NotesView } from './views/NotesView';
import { CalendarView } from './views/CalendarView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { ConfirmationModal, Modal, Avatar } from './components/Shared';
import { DropResult } from '@hello-pangea/dnd';
import { LanguageProvider, useLanguage } from './utils/i18n';
import { supabase } from './utils/supabaseClient';

// -- Notification Item Component --
const NotificationItem = ({ icon: Icon, color, title, time, onClick }: any) => (
  <div onClick={onClick} className="p-3 hover:bg-slate-50 cursor-pointer flex gap-3 border-b border-slate-100 last:border-0 transition-colors">
    <div className={`p-2 rounded-lg ${color} shrink-0`}>
      <Icon size={16} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{time}</p>
    </div>
  </div>
);

// -- Landing Page Component --
const LandingPage = ({ onGoToLogin, onGoToSignup }: { onGoToLogin: () => void, onGoToSignup: () => void }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 scroll-smooth">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-100">
              <Layout className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">HybridTask</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
             <a href="#ferramentas" className="hover:text-indigo-600 transition-colors">Ferramentas</a>
             <a href="#manual" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"><BookOpen size={14} /> Ajuda</a>
             <a href="#faq" className="hover:text-indigo-600 transition-colors">Suporte</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onGoToLogin} className="text-slate-600 font-bold hover:text-indigo-600 transition-colors px-4 py-2">{t('signIn')}</button>
            <button onClick={onGoToSignup} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95">{t('signUp')}</button>
          </div>
        </div>
      </nav>

      <section className="pt-48 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles size={14} /> PRODUTIVIDADE REIMAGINADA
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.95] animate-in fade-in slide-in-from-bottom-4 duration-700">
            Domine seus projetos <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500">com clareza total.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            O único sistema que integra Kanban, Calendário, Tabelas e Notas em um fluxo de trabalho perfeito. Grátis, seguro e pronto para sua equipe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button onClick={onGoToSignup} className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 hover:-translate-y-1 active:scale-95 flex items-center gap-3">
              {t('landingStartBtn')} <ArrowRight size={20} />
            </button>
            <div className="flex items-center gap-3 text-slate-400 font-bold text-sm">
              <CheckCircle2 size={20} className="text-green-500" /> Sem cartões. Grátis para sempre.
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm font-medium">© 2024 HybridTask Manager. Feito para quem faz acontecer.</p>
        </div>
      </footer>
    </div>
  );
};

// -- Auth View (Login/Signup) --
const AuthView = ({ onLogin, onBackToHome, initialMode }: { onLogin: (user: User) => void, onBackToHome: () => void, initialMode: 'login' | 'signup' }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
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
      if (mode === 'login') {
        const user = await DataService.login(email, password);
        onLogin(user);
      } else {
        const user = await DataService.signup(name, email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md">
        <button onClick={onBackToHome} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Voltar ao Início
        </button>
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-indigo-100">
              <div className="text-white"><Layout /></div>
           </div>
           <h2 className="text-2xl font-black text-slate-900">{mode === 'login' ? 'Entrar' : 'Cadastrar'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className={inputClasses} 
              placeholder="Nome" 
              required 
            />
          )}
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className={inputClasses} 
            placeholder="Email" 
            required 
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className={inputClasses} 
            placeholder="Senha" 
            required 
          />
          {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
          <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all active:scale-[0.98]">
            {loading ? <RefreshCw className="animate-spin mx-auto" size={20} /> : 'Continuar'}
          </button>
        </form>
        <p className="text-center mt-6 text-slate-500 text-sm">
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-indigo-600 font-bold hover:underline transition-all">
             {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
          </button>
        </p>
      </div>
    </div>
  );
};

// -- Main App Content --
const MainApp = ({ user, onLogout, onUpdateUser }: { user: User, onLogout: () => void, onUpdateUser: (u: User) => void }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const [data, setData] = useState<BoardData | null>(null);
  
  // Sidebar States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [deleteIntent, setDeleteIntent] = useState<{ type: string, id: string } | null>(null);

  const loadData = async () => {
    try {
      const boardData = await DataService.getBoardData();
      setData(boardData);
      checkNotifications(boardData);
    } catch (e) { console.error(e); }
  };

  const checkNotifications = (board: BoardData) => {
    const list: any[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    const doneColId = board.columnOrder.find(id => {
      const title = board.columns[id].title.toLowerCase();
      return ['done', 'concluido', 'concluído', 'finalizado'].includes(title);
    });

    Object.values(board.tasks).forEach((task: Task) => {
      if (task.status === doneColId) return;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0,0,0,0);

      if (dueDate.getTime() === today.getTime()) {
        list.push({ id: `due_${task.id}`, icon: Clock, color: 'bg-indigo-500', title: `Tarefa Vence Hoje: ${task.title}`, time: 'Hoje', task });
      } else if (dueDate.getTime() < today.getTime()) {
        list.push({ id: `overdue_${task.id}`, icon: AlertTriangle, color: 'bg-red-500', title: `Tarefa Atrasada: ${task.title}`, time: 'Vencida', task });
      }
    });

    setNotifications(list);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !data) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const newData = { ...data };
    if (source.droppableId === destination.droppableId) {
      const col = newData.columns[source.droppableId];
      const newTaskIds = Array.from(col.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      newData.columns[col.id] = { ...col, taskIds: newTaskIds };
    } else {
      const start = newData.columns[source.droppableId];
      const finish = newData.columns[destination.droppableId];
      const startTaskIds = Array.from(start.taskIds);
      startTaskIds.splice(source.index, 1);
      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      newData.columns[start.id] = { ...start, taskIds: startTaskIds };
      newData.columns[finish.id] = { ...finish, taskIds: finishTaskIds };
      newData.tasks[draggableId].status = finish.id;
    }
    setData(newData);
    await DataService.updateTaskPosition(draggableId, destination.droppableId, destination.index);
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    if (editingTask && editingTask.id) {
        const updated = await DataService.updateTask({ ...editingTask, ...task } as Task);
        setData(updated);
        checkNotifications(updated);
    } else {
        const added = await DataService.addTask({ ...task } as Task);
        setData(added);
        checkNotifications(added);
    }
    setEditingTask(undefined);
    setIsTaskModalOpen(false);
  };

  const executeDelete = async () => {
    if (!deleteIntent) return;
    if (deleteIntent.type === 'task') {
        const res = await DataService.deleteTask(deleteIntent.id);
        setData(res);
        checkNotifications(res);
    }
    setDeleteIntent(null);
  };

  if (!data) return <div className="h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/50 z-[40] md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />}

      <aside className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-[50] fixed inset-y-0 left-0 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
         <div className={`p-6 flex items-center ${isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"><Layout className="text-white w-5 h-5" /></div>
               {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-black text-white tracking-tighter text-lg whitespace-nowrap">HybridTask</span>}
            </div>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`hidden md:flex p-1.5 text-slate-500 hover:text-white transition-colors ${isSidebarCollapsed ? 'absolute -right-3 top-6 bg-slate-900 rounded-full border border-slate-700 p-0.5' : ''}`}>
              {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={18} />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1.5 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
         </div>

         <nav className="flex-1 px-4 space-y-1 mt-6">
            {[
              { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { to: "/kanban", icon: Kanban, label: "Quadro" },
              { to: "/table", icon: List, label: "Tabela" },
              { to: "/calendar", icon: Calendar, label: "Calendário" },
              { to: "/notes", icon: StickyNote, label: "Notas" },
              { to: "/settings", icon: Settings, label: "Ajustes" }
            ].map(item => (
              <NavLink key={item.to} to={item.to} className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800'} ${isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center' : ''}`} title={isSidebarCollapsed ? item.label : ''}>
                <item.icon size={20} className="shrink-0" /> 
                {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-bold whitespace-nowrap">{item.label}</span>}
              </NavLink>
            ))}
         </nav>

         <div className="p-4 border-t border-slate-800 space-y-2">
            <button onClick={() => setIsProfileModalOpen(true)} className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 w-full text-left ${isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center' : ''}`}>
               <Avatar name={user.name} url={user.avatar} size="sm" />
               {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-bold text-sm truncate">{user.name}</span>}
            </button>
            <button onClick={onLogout} className={`flex items-center gap-3 p-2 rounded-xl text-red-400 hover:bg-slate-800 w-full ${isSidebarCollapsed && !isMobileMenuOpen ? 'justify-center' : ''}`}>
               <LogOut size={20} className="shrink-0" /> 
               {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-bold text-sm">Sair</span>}
            </button>
         </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 relative">
         <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><Menu size={24} /></button>
              <h2 className="text-xl font-black text-slate-800 truncate">Workspace</h2>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative">
                    <Bell size={20} />
                    {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                  </button>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-[45]" onClick={() => setShowNotifications(false)} />
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[50] animate-in slide-in-from-top-2">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-bold text-slate-800">Notificações</h3>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-black text-slate-500 uppercase">{notifications.length} Pendentes</span>
                        </div>
                        <div className="max-h-[300px] overflow-auto">
                          {notifications.length > 0 ? notifications.map(n => (
                            <NotificationItem key={n.id} {...n} onClick={() => { setEditingTask(n.task); setIsTaskModalOpen(true); setShowNotifications(false); }} />
                          )) : <div className="p-8 text-center text-slate-400 text-sm font-medium">Tudo em dia por aqui!</div>}
                        </div>
                      </div>
                    </>
                  )}
               </div>
               <button onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                  <Plus size={18} /> <span className="hidden sm:inline">Nova Tarefa</span>
               </button>
            </div>
         </header>
         
         <div className="flex-1 overflow-auto p-4 md:p-8">
            <Routes>
               <Route path="/dashboard" element={<Dashboard data={data} />} />
               <Route path="/kanban" element={<KanbanBoard data={data} onDragEnd={handleDragEnd} onEditTask={setEditingTask} onDeleteTask={id => setDeleteIntent({type:'task', id})} />} />
               <Route path="/table" element={<TableView data={data} onEditTask={setEditingTask} onDeleteTask={id => setDeleteIntent({type:'task', id})} />} />
               <Route path="/calendar" element={
                  <CalendarView 
                    data={data} 
                    onEditTask={setEditingTask} 
                    onAddTaskOnDate={(d) => {
                      setEditingTask({ dueDate: d } as Task);
                      setIsTaskModalOpen(true);
                    }} 
                  />
                } />
               <Route path="/notes" element={<NotesView data={data} onUpdate={loadData} />} />
               <Route path="/settings" element={<SettingsView data={data} onAddColumn={DataService.addColumn} onUpdateColumn={DataService.updateColumn} onDeleteColumn={DataService.deleteColumn} onAddPriority={DataService.addPriority} onUpdatePriority={DataService.updatePriority} onDeletePriority={DataService.deletePriority} onAddAssignee={DataService.addAssignee} onDeleteAssignee={DataService.deleteAssignee} onRestoreDefaults={loadData} />} />
               <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
         </div>
      </main>

      <TaskModal 
        isOpen={isTaskModalOpen || !!(editingTask && editingTask.id)} 
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(undefined); }} 
        onSubmit={handleSaveTask} 
        initialData={editingTask} 
        boardData={data} 
      />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} onUpdate={async (id, d) => onUpdateUser(await DataService.updateCurrentUser(id, d))} />
      <ConfirmationModal isOpen={!!deleteIntent} onClose={() => setDeleteIntent(null)} onConfirm={executeDelete} title="Confirmar" message="Deseja excluir permanentemente?" />
    </div>
  );
};

// -- Root Component --
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  useEffect(() => { DataService.getCurrentUser().then(u => { setUser(u); setLoading(false); }); }, []);
  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><RefreshCw className="animate-spin text-indigo-600" size={48} /></div>;
  if (user) return (
    <HashRouter>
      <LanguageProvider>
        <MainApp user={user} onLogout={async () => { await DataService.logout(); setUser(null); }} onUpdateUser={setUser} />
      </LanguageProvider>
    </HashRouter>
  );
  return (
    <LanguageProvider>
      {authView === 'landing' ? ( <LandingPage onGoToLogin={() => setAuthView('login')} onGoToSignup={() => setAuthView('signup')} /> ) : ( <AuthView initialMode={authView === 'signup' ? 'signup' : 'login'} onLogin={setUser} onBackToHome={() => setAuthView('landing')} /> )}
    </LanguageProvider>
  );
};
export default App;