import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  Layout, LayoutDashboard, Settings, Plus, LogOut, Globe, Bell, Calendar, 
  Kanban, List, ArrowLeft, Menu, X, RefreshCw, StickyNote, Activity, Layers, 
  ChevronFirst, ChevronLast, Sun, Moon, AlertCircle, CheckCircle2, Sparkles, ArrowRight,
  BarChart3, ShieldCheck, Zap, BookOpen, Smartphone, Shield
} from 'lucide-react';
import { DataService } from './services/dataService';
import { BoardData, Task, User } from './types';
import { KanbanBoard } from './views/KanbanBoard';
import { TableView } from './views/TableView';
import { Dashboard } from './views/Dashboard';
import { SettingsView } from './views/SettingsView';
import { NotesView } from './views/NotesView';
import { CalendarView } from './views/CalendarView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { Avatar } from './components/Shared';
import { DropResult } from '@hello-pangea/dnd';
import { LanguageProvider, useLanguage } from './utils/i18n';
import { INITIAL_DATA } from './constants';

// -- Item de Notificação --
const NotificationItem = ({ icon: Icon, color, title, time, onClick }: any) => (
  <div onClick={onClick} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex gap-4 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
    <div className={`p-2.5 rounded-xl ${color} shrink-0 shadow-sm`}>
      <Icon size={18} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{title}</p>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{time}</p>
    </div>
  </div>
);

// -- Landing Page (SEO & Recursos) --
const LandingPage = ({ onGoToLogin, onGoToSignup }: { onGoToLogin: () => void, onGoToSignup: () => void }) => {
  const { t } = useLanguage();
  
  const features = [
    { title: t('landingFeature1Title'), desc: t('landingFeature1Desc'), icon: Kanban, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { title: t('landingFeature2Title'), desc: t('landingFeature2Desc'), icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: t('landingFeature3Title'), desc: t('landingFeature3Desc'), icon: List, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: t('landingFeature4Title'), desc: t('landingFeature4Desc'), icon: StickyNote, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' }
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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans scroll-smooth transition-colors">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40">
              <Layout className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight uppercase">HybridTask</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
             <a href="#ferramentas" className="hover:text-indigo-600 transition-colors">Recursos</a>
             <a href="#manual" className="hover:text-indigo-600 transition-colors">Manual</a>
             <a href="#faq" className="hover:text-indigo-600 transition-colors">Dúvidas</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onGoToLogin} className="text-slate-600 dark:text-slate-400 font-bold hover:text-indigo-600 px-4 py-2">{t('signIn')}</button>
            <button onClick={onGoToSignup} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 active:scale-95 glow-effect uppercase tracking-widest">
              {t('signUp')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-48 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black tracking-[0.3em] mb-10 uppercase border border-indigo-100 dark:border-indigo-800">
            <Sparkles size={14} /> Produtividade Re-imaginada
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.9] dark:text-white">
            {t('landingHeroTitle').split(' ').slice(0, 3).join(' ')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500">{t('landingHeroTitle').split(' ').slice(3).join(' ')}</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
            {t('landingHeroSub')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button onClick={onGoToSignup} className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 dark:shadow-indigo-900/40 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 glow-effect">
              {t('landingStartBtn')} <ArrowRight size={24} />
            </button>
            <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
               <ShieldCheck size={24} className="text-green-500" /> Sem cartões de crédito. Grátis para sempre.
            </div>
          </div>
        </div>
      </section>

      {/* Ferramentas (Features) */}
      <section id="ferramentas" className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{t('landingBenefitsTitle')}</h2>
            <div className="h-1.5 w-24 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-2">
                 <div className={`w-16 h-16 ${f.bg} rounded-2xl flex items-center justify-center ${f.color} mb-8 group-hover:scale-110 transition-transform`}>
                   <f.icon size={32} />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">{f.title}</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manual do Usuário */}
      <section id="manual" className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start gap-20">
            <div className="md:w-1/2">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase mb-6 border border-emerald-100 dark:border-emerald-800">
                 <BookOpen size={14} /> Passo a Passo
               </div>
               <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-tight">{t('userManualTitle')}</h2>
               <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-12">{t('userManualSub')}</p>
               <button onClick={onGoToSignup} className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                 Criar conta e ver na prática <ArrowRight size={16} />
               </button>
            </div>
            <div className="md:w-1/2 space-y-12">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-6 animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                   <div className="w-12 h-12 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-xl shadow-slate-200 dark:shadow-indigo-900/30">
                     {s.id}
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">{s.title}</h3>
                     <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{s.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-6">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{t('landingFaqTitle')}</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Tudo o que você precisa saber</p>
           </div>
           <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                   <h3 className="text-lg font-black text-slate-800 dark:text-white mb-3 flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      {faq.q}
                   </h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layout className="text-white w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight uppercase dark:text-white">HybridTask</span>
            </div>
            <div className="flex gap-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <span>Sempre Grátis</span>
              <span>Dados Criptografados</span>
              <span>PWA Ready</span>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-50 dark:border-slate-900 text-center">
            <p className="text-slate-400 text-sm font-medium">
              © 2025 HybridTask Manager. Feito para quem faz acontecer. Projetado por <a href="https://wa.me/+5513985994965" target="_blank" className="text-indigo-600 font-bold hover:underline">JR Marketing</a>
            </p>
          </div>
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
        if (user) onLogin(user);
      }
    } catch (err: any) {
      setError(err.message === 'CONFIRM_EMAIL' ? t('checkEmail') : (err.message || t('loginError')));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-5 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500 font-medium";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg animate-in fade-in zoom-in duration-300">
        <button onClick={onBackToHome} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs mb-10 transition-colors font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> {t('landingBackToHome')}
        </button>
        
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl glow-effect">
              <Layout className="text-white" size={32} />
           </div>
           <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
             {mode === 'login' ? t('signIn') : t('signUp')}
           </h2>
           <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">{mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta gratuita'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">{t('name')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} placeholder="Seu nome" required />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">{t('email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} placeholder="seu@email.com" required />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2 ml-2">{t('password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} placeholder="••••••••" required />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-1">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-tight">{error}</p>
            </div>
          )}

          <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 disabled:opacity-50 transition-all active:scale-[0.98] glow-effect mt-4 text-lg">
            {loading ? <RefreshCw className="animate-spin mx-auto" size={24} /> : (mode === 'login' ? t('signIn') : t('signUp'))}
          </button>
        </form>

        <p className="text-center mt-10 text-slate-500 dark:text-slate-400 text-sm font-medium">
          {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-indigo-600 dark:text-indigo-400 font-black hover:underline underline-offset-8 transition-all">
             {mode === 'login' ? t('signUp') : t('signIn')}
          </button>
        </p>
      </div>
    </div>
  );
};

// -- App Content Principal --
const AppContent = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [boardData, setBoardData] = useState<BoardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [isAuthMode, setIsAuthMode] = useState<'login' | 'signup' | null>(null);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('hybridtask-theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hybridtask-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hybridtask-theme', 'light');
    }
  }, [isDarkMode]);

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
    } catch (e) { console.error("Erro ao carregar quadro:", e); }
  };

  useEffect(() => {
    DataService.getCurrentUser().then(currUser => {
      setUser(currUser);
      if (currUser) fetchBoard();
      setLoading(false);
    });
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
      await DataService.addTask({ ...taskData, createdAt: new Date().toISOString() } as Task);
    }
    await fetchBoard();
    setSelectedTask(undefined);
    setIsTaskModalOpen(false);
  };

  const overdueTasksCount = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    return Object.values(boardData.tasks).filter(t => t.status !== 'Done' && new Date(t.dueDate).getTime() < today).length;
  }, [boardData.tasks]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
      <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl animate-bounce mb-6"><Layout className="text-white" size={40} /></div>
      <div className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Carregando...</div>
    </div>
  );

  if (!user) {
    if (isAuthMode) return (
      <AuthView 
        initialMode={isAuthMode} 
        onLogin={(u) => { setUser(u); fetchBoard(); setIsAuthMode(null); }} 
        onBackToHome={() => setIsAuthMode(null)} 
      />
    );
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm z-30 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className={`p-8 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg icon-shadow shrink-0">
                <Layout className="text-white" size={20} />
              </div>
              {!isSidebarCollapsed && <span className="font-black text-xl tracking-tight uppercase">HybridTask</span>}
           </div>
        </div>

        <nav className={`flex-1 ${isSidebarCollapsed ? 'px-3' : 'px-4'} space-y-3`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-tooltip={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) => 
                `flex items-center rounded-[1.5rem] font-bold text-sm transition-all group relative ${isSidebarCollapsed ? 'sidebar-tooltip justify-center px-0 py-4' : 'gap-4 px-4 py-4'} ${isActive ? 'bg-indigo-600 text-white shadow-xl glow-effect' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'}`
              }
            >
              <item.icon size={isSidebarCollapsed ? 18 : 22} className={`shrink-0 transition-transform group-hover:scale-110 ${location.pathname.startsWith(item.to) ? '' : 'icon-shadow'}`} />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 ${isSidebarCollapsed ? 'px-3' : 'px-4'}`}>
           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`w-full flex items-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all ${isSidebarCollapsed ? 'justify-center py-4' : 'justify-between px-4 py-3'}`}>
              {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Recolher</span>}
              {isSidebarCollapsed ? <ChevronLast size={20} className="icon-shadow" /> : <ChevronFirst size={20} className="icon-shadow" />}
           </button>
           <div onClick={() => setIsProfileModalOpen(true)} className={`flex items-center rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all group ${isSidebarCollapsed ? 'justify-center py-4' : 'gap-3 px-4 py-3'}`}>
              <Avatar name={user.name} url={user.avatar} size={isSidebarCollapsed ? 'sm' : 'md'} />
              {!isSidebarCollapsed && <div className="min-w-0"><p className="text-sm font-black dark:text-white truncate">{user.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('editProfile')}</p></div>}
           </div>
           <button onClick={async () => { await DataService.logout(); setUser(null); }} className={`w-full flex items-center rounded-2xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${isSidebarCollapsed ? 'justify-center py-4' : 'gap-3 px-4 py-3'}`}>
              <LogOut size={22} className="icon-shadow" />
              {!isSidebarCollapsed && <span>{t('logout')}</span>}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><Menu size={24} /></button>
             <div className="hidden lg:flex items-center gap-2"><Layout className="text-indigo-600 icon-shadow" size={20} /><span className="font-black text-lg dark:text-white uppercase tracking-tighter">HybridTask</span></div>
           </div>
           <div className="flex items-center gap-2.5">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm" title={isDarkMode ? "Modo Claro" : "Modo Escuro"}>
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2.5 rounded-2xl border transition-all relative ${showNotifications ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 shadow-sm'}`}>
                  <Bell size={20} className="icon-shadow" />
                  {overdueTasksCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-b dark:border-slate-800 flex items-center justify-between"><span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('notifications')}</span><span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-black rounded-full">{overdueTasksCount} alertas</span></div>
                    <div className="max-h-96 overflow-y-auto">
                      {overdueTasksCount > 0 ? Object.values(boardData.tasks).filter(t => t.status !== 'Done' && new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0)).map(task => <NotificationItem key={task.id} icon={AlertCircle} color="bg-red-500" title={`Atrasada: ${task.title}`} time={new Date(task.dueDate).toLocaleDateString()} onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); setShowNotifications(false); }} />) : <div className="p-8 text-center"><CheckCircle2 size={32} className="mx-auto text-green-200 dark:text-green-900 mb-3" /><p className="text-sm font-bold text-slate-400">{t('noNotifications')}</p></div>}
                    </div>
                  </div>
                )}
              </div>
              <Avatar name={user.name} url={user.avatar} size="sm" onClick={() => setIsProfileModalOpen(true)} />
           </div>
        </header>

        <div className="px-6 pt-8 md:px-10 flex items-center justify-between shrink-0 mb-6">
           <div><h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">{navItems.find(i => location.pathname.startsWith(i.to))?.label || t('dashboard')}</h1><p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mt-3 flex items-center gap-2"><Globe size={12} className="text-indigo-500" /> {t('projectOverview')}</p></div>
           <button onClick={() => { setSelectedTask(undefined); setIsTaskModalOpen(true); }} className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center gap-3 hover:bg-indigo-700 shadow-2xl shadow-indigo-100 dark:shadow-indigo-900/40 transition-all active:scale-95 group glow-effect"><div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-300"><Plus size={20} className="icon-shadow" /></div><span className="hidden sm:inline">{t('newTask')}</span></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-12 md:px-10 scroll-smooth custom-scrollbar">
           <Routes>
              <Route path="/dashboard" element={<Dashboard data={boardData} />} />
              <Route path="/kanban" element={<KanbanBoard data={boardData} onDragEnd={handleDragEnd} onEditTask={(t) => { setSelectedTask(t); setIsTaskModalOpen(true); }} onDeleteTask={async(id) => { await DataService.deleteTask(id); fetchBoard(); }} />} />
              <Route path="/table" element={<TableView data={boardData} onEditTask={(t) => { setSelectedTask(t); setIsTaskModalOpen(true); }} onDeleteTask={async(id) => { await DataService.deleteTask(id); fetchBoard(); }} />} />
              <Route path="/calendar" element={<CalendarView data={boardData} onEditTask={(t) => { setSelectedTask(t); setIsTaskModalOpen(true); }} onAddTaskOnDate={(date) => { setSelectedTask({ dueDate: date } as Task); setIsTaskModalOpen(true); }} />} />
              <Route path="/notes" element={<NotesView data={boardData} onUpdate={fetchBoard} />} />
              <Route path="/settings" element={<SettingsView data={boardData} onAddColumn={async (t, c) => { await DataService.addColumn(t, c); fetchBoard(); }} onUpdateColumn={async (id, u) => { await DataService.updateColumn(id, u); fetchBoard(); }} onDeleteColumn={async (id) => { await DataService.deleteColumn(id); fetchBoard(); }} onAddPriority={async (t, c) => { await DataService.addPriority(t, c); fetchBoard(); }} onUpdatePriority={async (id, u) => { await DataService.updatePriority(id, u); fetchBoard(); }} onDeletePriority={async (id) => { await DataService.deletePriority(id); fetchBoard(); }} onAddAssignee={async (n, e) => { await DataService.addAssignee(n, e); fetchBoard(); }} onDeleteAssignee={async (id) => { await DataService.deleteAssignee(id); fetchBoard(); }} onRestoreDefaults={async () => { await DataService.restoreDefaults(); fetchBoard(); }} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
           </Routes>
        </div>

        {isMobileMenuOpen && (
           <div className="lg:hidden fixed inset-0 z-[100]">
              <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>
              <aside className="absolute top-0 left-0 w-80 h-full bg-white dark:bg-slate-900 shadow-2xl p-8 flex flex-col animate-in slide-in-from-left duration-300 rounded-r-[3rem]">
                 <div className="flex items-center justify-between mb-12"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl"><Layout className="text-white" size={20} /></div><span className="font-black text-2xl tracking-tighter dark:text-white">HybridTask</span></div><button onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl"><X size={24} /></button></div>
                 <nav className="flex-1 space-y-3">{navItems.map((item) => (<NavLink key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-4 px-6 py-5 rounded-[2rem] font-bold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><item.icon size={24} className={location.pathname.startsWith(item.to) ? '' : 'icon-shadow'} /> {item.label}</NavLink>))}</nav>
                 <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800"><button onClick={async () => { await DataService.logout(); setUser(null); }} className="w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><LogOut size={24} className="icon-shadow" /> {t('logout')}</button></div>
              </aside>
           </div>
        )}
      </main>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => { setIsTaskModalOpen(false); setSelectedTask(undefined); }} onSubmit={handleTaskSubmit} onDelete={async(id) => { await DataService.deleteTask(id); fetchBoard(); }} initialData={selectedTask} boardData={boardData} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user!} onUpdate={async (id, upd) => { const updatedUser = await DataService.updateCurrentUser(id, upd); setUser(updatedUser); }} />
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