
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { 
  ClipboardList, LayoutDashboard, Settings, Plus, Bell, Calendar, 
  Kanban, List, Menu, RefreshCw, StickyNote, Activity, Layers, 
  ChevronFirst, ChevronLast, Sun, Moon, AlertCircle, X, LogOut, Trash2
} from 'lucide-react';
import { DataService } from './services/dataService';
import { BoardData, Task, User } from './types';
import { KanbanBoard } from './views/KanbanBoard';
import { TableView } from './views/TableView';
import { Dashboard } from './views/Dashboard';
import { SettingsView } from './views/SettingsView';
import { NotesView } from './views/NotesView';
import { CalendarView } from './views/CalendarView';
import { TrashView } from './views/TrashView';
import { LandingPage } from './views/LandingPage';
import { AuthView } from './views/AuthView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { UpdateBanner } from './components/UpdateChecker';
import { Avatar } from './components/Shared';
import { AdminPanel } from './views/AdminPanel';
import { UserRole } from './types';
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
  const [dueQueue, setDueQueue] = useState<Task[]>([]);
  const [activeDue, setActiveDue] = useState<Task | null>(null);
  const [nativeNotificationsGranted, setNativeNotificationsGranted] = useState(false);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };


  const doneColumnId = useMemo(() => {
    const normalized = (value: string) => value.toLowerCase();
    const idByTitle = boardData.columnOrder.find(id => {
      const title = boardData.columns[id]?.title || '';
      return /conclu|done/.test(normalized(title));
    });
    return idByTitle || boardData.columnOrder[boardData.columnOrder.length - 1] || 'Done';
  }, [boardData.columnOrder, boardData.columns]);

  const isTaskOverdue = (task: Task) => {
    if (!task?.dueDate) return false;
    const today = new Date().setHours(0,0,0,0);
    return task.status !== doneColumnId && new Date(task.dueDate).getTime() < today;
  };

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

  const playNotificationSound = () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.08;

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 180);
    } catch {
      // ignore audio errors (autoplay restrictions)
    }
  };

  const getNotificationId = (value: string) => {
    let hash = 0;
    for (let index = 0; index < value.length; index++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash) % 2147483000;
  };

  useEffect(() => { fetchBoard(); }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registerPush = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        if (Notification.permission !== 'granted') return;

        const existing = await reg.pushManager.getSubscription();
        if (!existing) {
          const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
          if (!vapidKey) return;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
          });
          await DataService.savePushSubscription(sub);
        } else {
          await DataService.savePushSubscription(existing);
        }
      } catch (e) {
        console.error('Push registration failed:', e);
      }
    };

    registerPush();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!Capacitor.isNativePlatform()) return;

    const setupNativeNotifications = async () => {
      try {
        const permission = await LocalNotifications.requestPermissions();
        setNativeNotificationsGranted(permission.display === 'granted');
        if (permission.display === 'granted') {
          await LocalNotifications.createChannel({
            id: 'due-tasks',
            name: 'Tarefas vencidas',
            description: 'Alertas de vencimento de tarefas',
            importance: 5,
            visibility: 1,
            vibration: true,
          });
        }
      } catch (error) {
        console.error('Falha ao solicitar permissão de notificação nativa:', error);
        setNativeNotificationsGranted(false);
      }
    };

    setupNativeNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!Capacitor.isNativePlatform()) return;
    if (!nativeNotificationsGranted) return;

    const syncNativeDueNotifications = async () => {
      try {
        const tasks = Object.values(boardData.tasks) as Task[];
        const now = Date.now();

        const notifications = tasks
          .filter((task) => {
            if (!task?.dueDate) return false;
            if (task.status === doneColumnId) return false;
            const due = new Date(task.dueDate).getTime();
            return !Number.isNaN(due);
          })
          .map((task) => {
            const due = new Date(task.dueDate).getTime();
            const at = new Date(Math.max(due, now + 1500));

            return {
              id: getNotificationId(task.id),
              title: 'Tarefa vencida',
              body: task.title,
              schedule: { at, allowWhileIdle: true },
              channelId: 'due-tasks',
              extra: { taskId: task.id },
            };
          });

        const activeIds = new Set<number>(notifications.map((notification) => notification.id));
        const pending = await LocalNotifications.getPending();
        const toCancel = pending.notifications
          .filter((notification) => !activeIds.has(notification.id))
          .map((notification) => ({ id: notification.id }));

        if (toCancel.length > 0) {
          await LocalNotifications.cancel({ notifications: toCancel });
        }

        if (notifications.length > 0) {
          await LocalNotifications.schedule({ notifications });
        }
      } catch (error) {
        console.error('Falha ao sincronizar notificações nativas:', error);
      }
    };

    syncNativeDueNotifications();
  }, [boardData.tasks, doneColumnId, nativeNotificationsGranted, user]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    const sourceColBase = boardData.columns[sourceId];
    const destColBase = boardData.columns[destId];
    if (!sourceColBase || !destColBase) return;

    const sourceCol = {
      ...sourceColBase,
      taskIds: [...sourceColBase.taskIds],
    };
    const destCol = sourceId === destId
      ? sourceCol
      : {
          ...destColBase,
          taskIds: [...destColBase.taskIds],
        };

    const sourceTaskIdx = sourceCol.taskIds.indexOf(draggableId);
    if (sourceTaskIdx === -1) return;

    sourceCol.taskIds.splice(sourceTaskIdx, 1);
    destCol.taskIds.splice(destination.index, 0, draggableId);

    const updatedTask = boardData.tasks[draggableId]
      ? { ...boardData.tasks[draggableId], status: destId }
      : undefined;

    setBoardData((prev) => ({
      ...prev,
      tasks: updatedTask
        ? { ...prev.tasks, [draggableId]: updatedTask }
        : prev.tasks,
      columns: {
        ...prev.columns,
        [sourceId]: sourceCol,
        [destId]: destCol,
      },
    }));

    try {
      await DataService.updateTaskOrder(sourceId, sourceCol.taskIds);
      if (sourceId !== destId) {
        await DataService.updateTaskOrder(destId, destCol.taskIds);
      }
    } catch (error) {
      console.error('Erro ao persistir drag and drop:', error);
      await fetchBoard(true);
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

  const handleTaskDelete = async (taskId: string) => {
    const confirmed = window.confirm('Enviar esta tarefa para a lixeira?');
    if (!confirmed) return;

    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id: getNotificationId(taskId) }] });
      } catch (error) {
        console.error('Falha ao cancelar notificação da tarefa removida:', error);
      }
    }

    await DataService.deleteTask(taskId);
    fetchBoard(true);
    setIsTaskModalOpen(false);
  };

  const overdueCount = useMemo(() => {
    const tasks = Object.values(boardData.tasks) as Task[];
    return tasks.filter(isTaskOverdue).length;
  }, [boardData.tasks, doneColumnId]);

  useEffect(() => {
    if (!user) return;

    const isNative = Capacitor.isNativePlatform();
    if (!isNative && (typeof window === 'undefined' || !('Notification' in window))) return;

    const notifiedKey = `hybridtask-notified:${user.id}`;
    const readNotified = () => new Set<string>(JSON.parse(localStorage.getItem(notifiedKey) || '[]'));
    const writeNotified = (set: Set<string>) => localStorage.setItem(notifiedKey, JSON.stringify(Array.from(set)));

    const checkAndNotify = async () => {
      if (document.visibilityState !== 'visible') return;
      const tasks = Object.values(boardData.tasks) as Task[];
      const now = Date.now();
      const notified = readNotified();

      tasks.forEach(task => {
        if (!task?.dueDate) return;
        if (task.status === doneColumnId) return;
        const due = new Date(task.dueDate).getTime();
        if (Number.isNaN(due)) return;
        if (due <= now && !notified.has(task.id)) {
          setDueQueue((prev) => (prev.some((t) => t.id === task.id) ? prev : [...prev, task]));
          if (isNative) {
            notified.add(task.id);
          } else {
            if (Notification.permission === 'granted') {
              new Notification('Tarefa vencida', {
                body: task.title,
                tag: task.id
              });
              notified.add(task.id);
            } else if (Notification.permission === 'default') {
              Notification.requestPermission();
              notified.add(task.id);
            } else {
              notified.add(task.id);
            }
          }
        }
      });

      writeNotified(notified);
    };

    const interval = window.setInterval(() => {
      checkAndNotify();
    }, 30000);
    checkAndNotify();
    return () => window.clearInterval(interval);
  }, [boardData.tasks, doneColumnId, nativeNotificationsGranted, user]);

  useEffect(() => {
    if (activeDue || dueQueue.length === 0) return;
    setActiveDue(dueQueue[0]);
    setDueQueue((prev) => prev.slice(1));
  }, [activeDue, dueQueue]);

  useEffect(() => {
    if (!activeDue) return;
    playNotificationSound();
  }, [activeDue]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#111315] gap-4 animate-in fade-in">
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
        <Route path="/admin" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Rota de admin protegida por role
  if (location.pathname === '/admin' && user.role !== UserRole.ADMIN) {
    return (
      <Routes>
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // Se for admin acessando /admin, mostrar painel
  if (location.pathname === '/admin' && user.role === UserRole.ADMIN) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/kanban', label: t('kanban'), icon: Kanban },
    { to: '/table', label: t('table'), icon: List },
    { to: '/calendar', label: t('calendar'), icon: Calendar },
    { to: '/notes', label: t('notes'), icon: StickyNote },
    { to: '/trash', label: t('trash'), icon: Trash2 },
    { to: '/settings', label: t('settings'), icon: Settings },
  ];

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#111315] overflow-hidden transition-all">
      {/* Verificador de Atualizações */}
      <UpdateBanner />

      {activeDue && (
        <div className="fixed bottom-4 right-4 z-[120] w-[280px] sm:w-[320px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1d21] shadow-2xl p-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 p-1.5 rounded-lg bg-red-500 shadow-sm">
              <AlertCircle size={12} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Tarefa vencida</p>
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">{activeDue.title}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Vencimento: {new Date(activeDue.dueDate).toLocaleString()}</p>
            </div>
            <button onClick={() => setActiveDue(null)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setActiveDue(null)} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-white/[0.05] rounded-lg">Dispensar</button>
            <button onClick={() => { handleEditTask(activeDue); setActiveDue(null); }} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Abrir</button>
          </div>
        </div>
      )}
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-[#1a1d21] border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ${isSidebarCollapsed ? 'w-14' : 'w-48'}`}>
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
        <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm lg:hidden animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 h-full bg-white dark:bg-[#1a1d21] flex flex-col animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
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
        <header className="safe-top safe-top-height flex items-center justify-between px-3 sm:px-4 bg-white dark:bg-[#1a1d21] border-b border-slate-200 dark:border-slate-800 z-40">
           <div className="flex items-center gap-2">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1 text-slate-500"><Menu size={18} /></button>
             <h1 className="text-[11px] sm:text-xs font-bold tracking-widest dark:text-white uppercase truncate max-w-[140px] sm:max-w-none">
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
                      {overdueCount > 0 ? (Object.values(boardData.tasks) as Task[]).filter(isTaskOverdue).map(t => <NotificationItem key={t.id} icon={AlertCircle} color="bg-red-500" title={t.title} time={new Date(t.dueDate).toLocaleDateString()} onClick={() => { handleEditTask(t); setShowNotifications(false); }} />) : <div className="p-4 text-center text-[9px] font-medium text-slate-400">Sem alertas</div>}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => { setSelectedTask(undefined); setIsTaskModalOpen(true); }} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase shadow-sm flex items-center gap-1 hover:bg-indigo-700 transition-colors"><Plus size={14} /> <span className="hidden sm:inline">Novo</span></button>
           </div>
        </header>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 custom-scrollbar bg-slate-50 dark:bg-[#111315]">
           <Routes>
              <Route path="/dashboard" element={<Dashboard data={boardData} onEditTask={handleEditTask} />} />
              <Route path="/kanban" element={<KanbanBoard data={boardData} onDragEnd={handleDragEnd} onEditTask={handleEditTask} onDeleteTask={async(id) => { await DataService.deleteTask(id); fetchBoard(true); }} />} />
              <Route path="/table" element={<TableView data={boardData} onEditTask={handleEditTask} onDeleteTask={async(id) => { await DataService.deleteTask(id); fetchBoard(true); }} />} />
              <Route path="/calendar" element={<CalendarView data={boardData} onEditTask={handleEditTask} onAddTaskOnDate={(date) => { setSelectedTask({ dueDate: date } as Task); setIsTaskModalOpen(true); }} onUpdate={() => fetchBoard(true)} />} />
              <Route path="/notes" element={<NotesView data={boardData} onUpdate={() => fetchBoard(true)} />} />
              <Route path="/trash" element={<TrashView onUpdate={() => fetchBoard(true)} />} />
              <Route path="/settings" element={<SettingsView data={boardData} fontSize={fontSize} onFontSizeChange={setFontSize} onAddColumn={async (t, c) => { await DataService.addColumn(t, c); fetchBoard(true); }} onUpdateColumn={async (id, u) => { await DataService.updateColumn(id, u); fetchBoard(true); }} onDeleteColumn={async (id) => { await DataService.deleteColumn(id); fetchBoard(true); }} onAddPriority={async (t, c) => { await DataService.addPriority(t, c); fetchBoard(true); }} onUpdatePriority={async (id, u) => { await DataService.updatePriority(id, u); fetchBoard(true); }} onDeletePriority={async (id) => { await DataService.deletePriority(id); fetchBoard(true); }} onAddAssignee={async (n, e) => { await DataService.addAssignee(n, e); fetchBoard(true); }} onDeleteAssignee={async (id) => { await DataService.deleteAssignee(id); fetchBoard(true); }} onRestoreDefaults={async () => { await DataService.restoreDefaults(); fetchBoard(true); }} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
           </Routes>
        </div>
      </main>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSubmit={handleTaskSubmit} onDelete={handleTaskDelete} initialData={selectedTask} boardData={boardData} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user!} onUpdate={async (id, upd) => { const u = await DataService.updateCurrentUser(id, upd); setUser(u); }} />
    </div>
  );
};

const App = () => (
  <LanguageProvider><HashRouter><AppContent /></HashRouter></LanguageProvider>
);
export default App;
