import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  Layout, LayoutDashboard, Settings, Plus, LogOut, Globe, User as UserIcon, 
  Lock, Mail, Bell, Calendar, CheckCircle, Circle, AlertTriangle, Kanban, List, ArrowLeft, KeyRound, Link as LinkIcon, 
  ShieldAlert, Menu, X, RefreshCw, StickyNote, WifiOff, Clock, BarChart3,
  Layers, ChevronDown, Rocket, CheckCircle2, Zap, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2 as CheckIcon,
  Download, ChevronLeft, ChevronRight, Edit3, Volume2, MousePointer2, Sparkles, Smartphone, Shield, HelpCircle, 
  BookOpen, CheckSquare, ArrowRight, MousePointerClick, Filter, PieChart as ChartIcon, Monitor, ChevronFirst, ChevronLast
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
import { INITIAL_DATA } from './constants';

// -- Notification Item Component --
const NotificationItem = ({ icon: Icon, color, title, time, onClick }: any) => (
  <div onClick={onClick} className="p-4 hover:bg-slate-50 cursor-pointer flex gap-4 border-b border-slate-100 last:border-0 transition-colors">
    <div className={`p-2.5 rounded-xl ${color} shrink-0 shadow-sm`}>
      <Icon size={18} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-slate-800 truncate leading-tight">{title}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{time}</p>
    </div>
  </div>
);

// -- Landing Page Component --
const LandingPage = ({ onGoToLogin, onGoToSignup }: { onGoToLogin: () => void, onGoToSignup: () => void }) => {
  const { t } = useLanguage();
  
  const features = [
    { title: t('landingFeature1Title'), desc: t('landingFeature1Desc'), icon: Kanban, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: t('landingFeature2Title'), desc: t('landingFeature2Desc'), icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: t('landingFeature3Title'), desc: t('landingFeature3Desc'), icon: List, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: t('landingFeature4Title'), desc: t('landingFeature4Desc'), icon: StickyNote, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  const steps = [
    { id: '1', title: t('step1Title'), desc: t('step1Desc') },
    { id: '2', title: t('step2Title'), desc: t('step2Desc') },
    { id: '3', title: t('step3Title'), desc: t('step3Desc') },
    { id: '4', title: t('step4Title'), desc: t('step4Desc') }
  ];

  const faqs = [
    { q: t('landingFaq1Q'), a: t('landingFaq1A') },
    { q: t('landingFaq2Q'), a: t('landingFaq2A') },
    { q: t('landingFaq3Q'), a: t('landingFaq3A') }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-100">
              <Layout className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">HybridTask</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
             <a href="#ferramentas" className="hover:text-indigo-600 transition-colors">Recursos</a>
             <a href="#manual" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"><BookOpen size={14} /> {t('help')}</a>
             <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onGoToLogin} className="text-slate-600 font-bold hover:text-indigo-600 transition-colors px-4 py-2">{t('signIn')}</button>
            <button onClick={onGoToSignup} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95">{t('signUp')}</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles size={14} /> PRODUTIVIDADE REIMAGINADA
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.95] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {t('landingHeroTitle').split(' ').slice(0, 2).join(' ')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500">{t('landingHeroTitle').split(' ').slice(2).join(' ')}</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            {t('landingHeroSub')}
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

      {/* Features Grid */}
      <section id="ferramentas" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">{t('landingBenefitsTitle')}</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Explore as ferramentas integradas que tornam o HybridTask a escolha inteligente para gestão.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-inner group-hover:scale-110 transition-transform`}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Manual Section */}
      <section id="manual" className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-slate-900 mb-6">{t('userManualTitle')}</h2>
            <p className="text-slate-500 font-bold text-lg">{t('userManualSub')}</p>
          </div>
          <div className="space-y-16">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-xl shadow-slate-200">
                  {s.id}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-800">{s.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium text-lg whitespace-pre-line">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">{t('landingFaqTitle')}</h2>
            <p className="text-slate-400 font-medium">Tudo o que você precisa saber sobre o HybridTask.</p>
          </div>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:border-indigo-500 transition-colors">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <HelpCircle size={20} className="text-indigo-400" /> {f.q}
                </h3>
                <p className="text-slate-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Layout className="text-white w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">HybridTask</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            © 2025 HybridTask Manager. Feito para quem faz acontecer. Projetado por <a href="https://wa.me/+5513985994965" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">JR Marketing</a>
          </p>
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
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} placeholder="Nome" required />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} placeholder="Email" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} placeholder="Senha" required />
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
const AppContent = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [boardData, setBoardData] = useState<BoardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [isAuthMode, setIsAuthMode] = useState<'login' | 'signup' | null>(null);
  
  // Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  const fetchBoard = async () => {
    try {
      const currUser = user || await DataService.getCurrentUser();
      if (!currUser) return;
      const data = await DataService.fetchBoardData(currUser.id);
      setBoardData(data);
    } catch (e) { console.error("Error fetching board:", e); }
  };

  useEffect(() => {
    DataService.getCurrentUser().then(currUser => {
      setUser(currUser);
      if (currUser) fetchBoard();
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newBoard = { ...boardData };
    const sourceCol = newBoard.columns[source.droppableId];
    const destCol = newBoard.columns[destination.droppableId];
    
    if (sourceCol && destCol) {
      sourceCol.taskIds.splice(source.index, 1);
      destCol.taskIds.splice(destination.index, 0, draggableId);
      setBoardData(newBoard);
      await DataService.updateTaskPosition(draggableId, destination.droppableId, destination.index);
    }
  };

  const handleTaskSubmit = async (taskData: Partial<Task>) => {
    if (selectedTask && (selectedTask as any).id) {
      await DataService.updateTask((selectedTask as any).id, taskData);
    } else {
      await DataService.addTask({
        ...taskData,
        createdAt: new Date().toISOString()
      } as Task);
    }
    await fetchBoard();
    setSelectedTask(undefined);
    setIsTaskModalOpen(false);
  };

  const handleTaskDelete = async (taskId: string) => {
    await DataService.deleteTask(taskId);
    await fetchBoard();
    setIsTaskModalOpen(false);
  };

  const overdueTasksCount = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return Object.values(boardData.tasks).filter(t => {
      if (t.status === 'Done') return false;
      return new Date(t.dueDate).getTime() < today.getTime();
    }).length;
  }, [boardData.tasks]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-100 animate-bounce mb-4">
          <Layout className="text-white" size={32} />
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
           <RefreshCw className="animate-spin" size={14} /> Carregando...
        </div>
      </div>
    );
  }

  if (!user) {
    if (isAuthMode) {
      return (
        <AuthView 
          initialMode={isAuthMode} 
          onLogin={(u) => { setUser(u); fetchBoard(); setIsAuthMode(null); }} 
          onBackToHome={() => setIsAuthMode(null)} 
        />
      );
    }
    return <LandingPage onGoToLogin={() => setIsAuthMode('login')} onGoToSignup={() => setIsAuthMode('signup')} />;
  }

  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/kanban', label: t('kanban'), icon: Kanban },
    { to: '/table', label: t('table'), icon: List },
    { to: '/calendar', label: t('calendar'), icon: Calendar },
    { to: '/notes', label: t('notes'), icon: StickyNote },
    { to: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 shadow-sm z-30 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className={`p-8 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-200 shrink-0 icon-shadow">
                <Layout className="text-white" size={20} />
              </div>
              {!isSidebarCollapsed && <span className="font-black text-xl tracking-tight transition-all">HybridTask</span>}
           </div>
        </div>

        <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-4'} space-y-3`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-tooltip={item.label}
              className={({ isActive }) => 
                `flex items-center rounded-2xl font-bold text-sm transition-all group relative ${isSidebarCollapsed ? 'sidebar-tooltip justify-center px-0 py-4' : 'gap-4 px-4 py-3.5'} ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`
              }
            >
              <item.icon size={22} className={`shrink-0 transition-transform group-hover:scale-110 ${location.pathname.startsWith(item.to) ? 'icon-shadow-active' : 'icon-shadow'}`} />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`p-4 border-t border-slate-100 space-y-3 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
           <button 
             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
             data-tooltip={isSidebarCollapsed ? "Expandir" : "Recolher"}
             className={`w-full flex items-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-all ${isSidebarCollapsed ? 'sidebar-tooltip justify-center py-4' : 'justify-between px-4 py-3'}`}
           >
              {!isSidebarCollapsed && <span className="text-xs font-black uppercase tracking-widest">Recolher</span>}
              {isSidebarCollapsed ? <ChevronLast size={20} className="icon-shadow" /> : <ChevronFirst size={20} className="icon-shadow" />}
           </button>

           <div 
             onClick={() => setIsProfileModalOpen(true)} 
             data-tooltip={isSidebarCollapsed ? user.name : ""}
             className={`flex items-center rounded-2xl hover:bg-slate-50 cursor-pointer transition-all group ${isSidebarCollapsed ? 'sidebar-tooltip justify-center py-4' : 'gap-3 px-4 py-3'}`}
           >
              <Avatar name={user.name} url={user.avatar} size={isSidebarCollapsed ? 'sm' : 'md'} />
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                   <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{t('editProfile')}</p>
                </div>
              )}
           </div>
           
           <button 
             onClick={async () => { await DataService.logout(); setUser(null); }} 
             data-tooltip={isSidebarCollapsed ? t('logout') : ""}
             className={`w-full flex items-center rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all ${isSidebarCollapsed ? 'sidebar-tooltip justify-center py-4' : 'gap-3 px-4 py-3'}`}
           >
              <LogOut size={22} className="icon-shadow" />
              {!isSidebarCollapsed && <span>{t('logout')}</span>}
           </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              <Menu size={24} />
           </button>
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center icon-shadow">
                <Layout className="text-white" size={16} />
              </div>
              <span className="font-black text-lg">HybridTask</span>
           </div>
           <Avatar name={user.name} url={user.avatar} onClick={() => setIsProfileModalOpen(true)} />
        </header>

        <div className="px-6 pt-8 md:px-10 flex items-center justify-between shrink-0 mb-6">
           <div className="animate-in slide-in-from-left-4 duration-500">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-none">
                 {navItems.find(i => location.pathname.startsWith(i.to))?.label || t('dashboard')}
              </h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
                <Globe size={12} className="text-indigo-500" />
                {t('projectOverview')}
              </p>
           </div>
           
           <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-3 rounded-2xl border transition-all relative ${showNotifications ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'}`}
                >
                  <Bell size={22} className="icon-shadow" />
                  {overdueTasksCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('notifications')}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase">{overdueTasksCount} alertas</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {overdueTasksCount > 0 ? (
                        Object.values(boardData.tasks)
                          .filter(t => t.status !== 'Done' && new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0))
                          .map(task => (
                            <NotificationItem 
                              key={task.id}
                              icon={AlertCircle}
                              color="bg-red-500"
                              title={`Atrasada: ${task.title}`}
                              time={new Date(task.dueDate).toLocaleDateString()}
                              onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); setShowNotifications(false); }}
                            />
                          ))
                      ) : (
                        <div className="p-8 text-center">
                          <CheckCircle2 size={32} className="mx-auto text-green-200 mb-3" />
                          <p className="text-sm font-bold text-slate-400">{t('noNotifications')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => { setSelectedTask(undefined); setIsTaskModalOpen(true); }}
                className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 group"
              >
                  <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                    <Plus size={18} className="icon-shadow" />
                  </div>
                  <span className="hidden sm:inline">{t('newTask')}</span>
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10 md:px-10 scroll-smooth custom-scrollbar">
           <Routes>
              <Route path="/dashboard" element={<Dashboard data={boardData} />} />
              <Route path="/kanban" element={<KanbanBoard data={boardData} onDragEnd={handleDragEnd} onEditTask={(t) => { setSelectedTask(t); setIsTaskModalOpen(true); }} onDeleteTask={handleTaskDelete} />} />
              <Route path="/table" element={<TableView data={boardData} onEditTask={(t) => { setSelectedTask(t); setIsTaskModalOpen(true); }} onDeleteTask={handleTaskDelete} />} />
              <Route path="/calendar" element={<CalendarView data={boardData} onEditTask={(t) => { setSelectedTask(t); setIsTaskModalOpen(true); }} onAddTaskOnDate={(date) => { setSelectedTask({ dueDate: date } as Task); setIsTaskModalOpen(true); }} />} />
              <Route path="/notes" element={<NotesView data={boardData} onUpdate={fetchBoard} />} />
              <Route path="/settings" element={
                <SettingsView 
                  data={boardData} 
                  onAddColumn={async (title, color) => { await DataService.addColumn(title, color); await fetchBoard(); }} 
                  onUpdateColumn={async (id, upd) => { await DataService.updateColumn(id, upd); await fetchBoard(); }} 
                  onDeleteColumn={async (id) => { await DataService.deleteColumn(id); await fetchBoard(); }} 
                  onAddPriority={async (title, color) => { await DataService.addPriority(title, color); await fetchBoard(); }} 
                  onUpdatePriority={async (id, upd) => { await DataService.updatePriority(id, upd); await fetchBoard(); }} 
                  onDeletePriority={async (id) => { await DataService.deletePriority(id); await fetchBoard(); }} 
                  onAddAssignee={async (name, email) => { await DataService.addAssignee(name, email); await fetchBoard(); }} 
                  onDeleteAssignee={async (id) => { await DataService.deleteAssignee(id); await fetchBoard(); }} 
                  onRestoreDefaults={async () => { await DataService.restoreDefaults(); await fetchBoard(); }} 
                />
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
           </Routes>
        </div>

        {isMobileMenuOpen && (
           <div className="lg:hidden fixed inset-0 z-[100]">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>
              <aside className="absolute top-0 left-0 w-80 h-full bg-white shadow-2xl p-8 flex flex-col animate-in slide-in-from-left duration-300 rounded-r-[3rem]">
                 <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-100 icon-shadow">
                          <Layout className="text-white" size={20} />
                       </div>
                       <span className="font-black text-2xl tracking-tighter">HybridTask</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl"><X size={24} /></button>
                 </div>
                 <nav className="flex-1 space-y-3">
                    {navItems.map((item) => (
                       <NavLink 
                        key={item.to} 
                        to={item.to} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-bold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                       >
                          <item.icon size={22} className={location.pathname.startsWith(item.to) ? 'icon-shadow-active' : 'icon-shadow'} /> {item.label}
                       </NavLink>
                    ))}
                 </nav>
                 <div className="mt-auto pt-8 border-t border-slate-100">
                    <button onClick={async () => { await DataService.logout(); setUser(null); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-bold text-red-500 hover:bg-red-50 transition-all">
                       <LogOut size={22} className="icon-shadow" /> {t('logout')}
                    </button>
                 </div>
              </aside>
           </div>
        )}
      </main>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => { setIsTaskModalOpen(false); setSelectedTask(undefined); }} 
        onSubmit={handleTaskSubmit} 
        onDelete={handleTaskDelete} 
        initialData={selectedTask} 
        boardData={boardData} 
      />
      
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={user} 
        onUpdate={async (id, upd) => { 
          const updatedUser = await DataService.updateCurrentUser(id, upd); 
          setUser(updatedUser); 
        }} 
      />
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <HashRouter>
      <AppContent />
    </HashRouter>
  </LanguageProvider>
);

export default App;