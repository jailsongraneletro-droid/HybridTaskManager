
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  ClipboardList, LayoutDashboard, Settings, Plus, Bell, Calendar, 
  Kanban, List, Menu, RefreshCw, StickyNote, Activity, Layers, 
  ChevronFirst, ChevronLast, Sun, Moon, AlertCircle, X, LogOut
} from 'lucide-react';
import { DataService } from './services/dataService';
import { BoardData, Task, User } from './types';
import { KanbanBoard } from './views/KanbanBoard';
import { TableView } from './views/TableView';
import { Dashboard } from './views/Dashboard';
import { SettingsView } from './views/SettingsView';
import { NotesView } from './views/NotesView';
import { CalendarView } from './views/CalendarView';
import { LandingPage } from './views/LandingPage';
import { AuthView } from './views/AuthView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { Avatar } from './components/Shared';
import { DropResult } from '@hello-pangea/dnd';
import { LanguageProvider, useLanguage } from './utils/i18n';
import { INITIAL_DATA } from './constants';

const NotificationItem = ({ icon: Icon, color, title, time, onClick }: any) => (
  <div onClick={onClick} className="p-2 hover:bg-slate-50 dark:hover:bg-white/[0.05] cursor-pointer flex gap-2 border-b border-slate-100 dark:border-white/[0.05] last:border-0 transition-colors">
    <div className={`p-1.5 rounded-lg ${color} shrink-0 shadow-sm`}>
      <Icon size={12} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">{title}</p>
      <p className="text-[8px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{time}</p>
    </div>
  </div>
);

const AppContent = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [boardData, setBoardData] = useState<BoardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('hybridtask-theme') === 'dark');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('hybridtask-font-size') || 'md');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('hybridtask-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    document.body.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.body.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('hybridtask-font-size', fontSize);
  }, [fontSize]);

  const fetchBoard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const currUser = await DataService.getCurrentUser();
      if (currUser) {
        setUser(currUser);
        let data = await DataService.fetchBoardData(currUser.id);
        if (data.columnOrder.length === 0) {
          await DataService.seedUserData(currUser);
          data = await DataService.fetchBoardData(currUser.id);
        }
        setBoardData(data);
      } else {
        setUser(null);
      }
    } catch (e) { 
      console.error("Error fetching board:", e); 
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await DataService.logout();
    window.location.href = '/';
  };

  useEffect(() => { fetchBoard(); }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newBoard = { ...boardData };
    const sourceCol = newBoard.columns[source.droppableId];
    const destCol = newBoard.columns[destination.droppableId];

    if (sourceCol && destCol) {
      // Remove o item usando o ID real, prevenindo erros se a lista visual estiver filtrada
      const sourceTaskIdx = sourceCol.taskIds.indexOf(draggableId);
      if (sourceTaskIdx !== -1) {
        sourceCol.taskIds.splice(sourceTaskIdx, 1);
      }
      
      // Insere na nova posição da coluna de destino
      destCol.taskIds.splice(destination.index, 0, draggableId);
      
      setBoardData({ ...newBoard });
      
      // Persiste a mudança de status e posição no banco
      await DataService.updateTaskPosition(draggableId, destination.droppableId, destination.index);
      
      // Sincroniza silenciosamente para manter a integridade dos dados
      fetchBoard(true); 
    }
  };

  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    if (selectedTask && (selectedTask as any).id) {
      await DataService.updateTask((selectedTask as any).id, taskData);
    } else {
      await DataService.addTask({ ...taskData, createdAt: new Date().toISOString() } as Task);
    }
    fetchBoard(true);
    setIsTaskModalOpen(false);
  };

  const overdueCount = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    const tasks = Object.values(boardData.tasks) as Task[];
    return tasks.filter(t => t.status !== 'Done' && new Date(t.dueDate).getTime() < today).length;
  }, [boardData.tasks]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-black gap-4 animate-in fade-in">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Sincronizando ambiente...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/kanban', label: t('kanban'), icon: Kanban },
    { to: '/table', label: t('table'), icon: List },
    { to: '/calendar', label: t('calendar'), icon: Calendar },
    { to: '/notes', label: t('notes'), icon: StickyNote },
    { to: '/settings', label: t('settings'), icon: Settings },
  ];

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-black overflow-hidden transition-all">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ${isSidebarCollapsed ? 'w-14' : 'w-48'}`}>
        <div className="p-3 flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
           <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center shadow-lg"><ClipboardList className="text-white" size={14} /></div>
           {!isSidebarCollapsed && <span className="ml-2 font-bold text-xs uppercase tracking-tighter dark:text-white">HybridTask</span>}
        </div>
        <nav className="flex-1 p-1.5 space-y-0.5 mt-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${isActive ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.05] dark:text-slate-400'}`}>
              <item.icon size={15} /> {!isSidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full flex items-center justify-center p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg">{isSidebarCollapsed ? <ChevronLast size={14} /> : <ChevronFirst size={14} />}</button>
          <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg cursor-pointer">
            <Avatar name={user.name} url={user.avatar} size="sm" />
            {!isSidebarCollapsed && <span className="text-[10px] font-bold truncate dark:text-white">{user.name}</span>}
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
            <LogOut size={14} />
            {!isSidebarCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 h-full bg-white dark:bg-[#0a0a0a] flex flex-col animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center"><ClipboardList className="text-white" size={14} /></div>
                <span className="font-bold text-xs uppercase dark:text-white">HybridTask</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400"><X size={18} /></button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.05]'}`}>
                  <item.icon size={16} /> <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t dark:border-slate-800 space-y-2">
               <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] cursor-pointer">
                 <Avatar name={user.name} url={user.avatar} size="md" />
                 <div>
                    <p className="text-xs font-bold dark:text-white leading-none mb-1">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">{user.email}</p>
                 </div>
               </div>
               <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest">
                  <LogOut size={16} /> {t('logout')}
               </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-10 flex items-center justify-between px-4 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-slate-800 z-40">
           <div className="flex items-center gap-2">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1 text-slate-500"><Menu size={18} /></button>
             <h1 className="text-[11px] font-bold tracking-widest dark:text-white uppercase truncate max-w-[120px] sm:max-w-none">
                {navItems.find(i => location.pathname.startsWith(i.to))?.label || 'Painel'}
             </h1>
           </div>
           <div className="flex items-center gap-1.5">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]">{isDarkMode ? <Sun size={14} /> : <Moon size={14} />}</button>
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-slate-400 relative hover:bg-slate-100 dark:hover:bg-white/[0.05]">
                  <Bell size={14} />
                  {overdueCount > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-1 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[100] animate-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-[9px] font-semibold uppercase text-slate-400">Avisos ({overdueCount})</div>
                    <div className="max-h-60 overflow-y-auto">
                      {overdueCount > 0 ? (Object.values(boardData.tasks) as Task[]).filter(t => t.status !== 'Done' && new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0)).map(t => <NotificationItem key={t.id} icon={AlertCircle} color="bg-red-500" title={t.title} time={new Date(t.dueDate).toLocaleDateString()} onClick={() => { handleEditTask(t); setShowNotifications(false); }} />) : <div className="p-4 text-center text-[9px] font-medium text-slate-400">Sem alertas</div>}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => { setSelectedTask(undefined); setIsTaskModalOpen(true); }} className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold text-[10px] uppercase shadow-sm flex items-center gap-1 hover:bg-indigo-700 transition-colors"><Plus size={14} /> <span className="hidden sm:inline">Novo</span></button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar bg-slate-50 dark:bg-black">
           <Routes>
              <Route path="/dashboard" element={<Dashboard data={boardData} onEditTask={handleEditTask} />} />
              <Route path="/kanban" element={<KanbanBoard data={boardData} onDragEnd={handleDragEnd} onEditTask={handleEditTask} onDeleteTask={async(id) => { await DataService.deleteTask(id); fetchBoard(true); }} />} />
              <Route path="/table" element={<TableView data={boardData} onEditTask={handleEditTask} onDeleteTask={async(id) => { await DataService.deleteTask(id); fetchBoard(true); }} />} />
              <Route path="/calendar" element={<CalendarView data={boardData} onEditTask={handleEditTask} onAddTaskOnDate={(date) => { setSelectedTask({ dueDate: date } as Task); setIsTaskModalOpen(true); }} onUpdate={() => fetchBoard(true)} />} />
              <Route path="/notes" element={<NotesView data={boardData} onUpdate={() => fetchBoard(true)} />} />
              <Route path="/settings" element={<SettingsView data={boardData} fontSize={fontSize} onFontSizeChange={setFontSize} onAddColumn={async (t, c) => { await DataService.addColumn(t, c); fetchBoard(true); }} onUpdateColumn={async (id, u) => { await DataService.updateColumn(id, u); fetchBoard(true); }} onDeleteColumn={async (id) => { await DataService.deleteColumn(id); fetchBoard(true); }} onAddPriority={async (t, c) => { await DataService.addPriority(t, c); fetchBoard(true); }} onUpdatePriority={async (id, u) => { await DataService.updatePriority(id, u); fetchBoard(true); }} onDeletePriority={async (id) => { await DataService.deletePriority(id); fetchBoard(true); }} onAddAssignee={async (n, e) => { await DataService.addAssignee(n, e); fetchBoard(true); }} onDeleteAssignee={async (id) => { await DataService.deleteAssignee(id); fetchBoard(true); }} onRestoreDefaults={async () => { await DataService.restoreDefaults(); fetchBoard(true); }} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
           </Routes>
        </div>
      </main>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSubmit={handleTaskSubmit} initialData={selectedTask} boardData={boardData} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user!} onUpdate={async (id, upd) => { const u = await DataService.updateCurrentUser(id, upd); setUser(u); }} />
    </div>
  );
};

const App = () => (
  <LanguageProvider><HashRouter><AppContent /></HashRouter></LanguageProvider>
);
export default App;
