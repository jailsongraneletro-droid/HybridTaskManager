import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  ClipboardList, LayoutDashboard, Settings, Plus, LogOut, Bell, Calendar, 
  Kanban, List, ArrowLeft, Menu, X, RefreshCw, StickyNote, Activity, Layers, 
  ChevronFirst, ChevronLast, Sun, Moon, AlertCircle, CheckCircle2, Sparkles, ArrowRight,
  BarChart3, BookOpen, Target, Users
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
  <div onClick={onClick} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex gap-3 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
    <div className={`p-2 rounded-lg ${color} shrink-0 shadow-sm`}>
      <Icon size={14} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{title}</p>
      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{time}</p>
    </div>
  </div>
);

// -- Landing Page (SEO & Recursos) --
const LandingPage = ({ onGoToLogin, onGoToSignup }: { onGoToLogin: () => void, onGoToSignup: () => void }) => {
  const { t } = useLanguage();
  
  const features = [
    { 
      title: "Kanban Ágil Profissional", 
      desc: "Workflow visual completo com drag-and-drop. Gerencie backlogs e sprints com colunas customizáveis, etiquetas de prioridade e prazos dinâmicos para máxima eficiência em metodologias ágeis.", 
      icon: Kanban, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50 dark:bg-indigo-900/20' 
    },
    { 
      title: "Business Intelligence Integrado", 
      desc: "Visualize o desempenho com dashboards de analytics. Monitore taxas de conclusão, gargalos no fluxo de trabalho e KPIs de produtividade em tempo real para decisões baseadas em dados.", 
      icon: BarChart3, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20' 
    },
    { 
      title: "Tabelas Dinâmicas de Gestão", 
      desc: "Controle centenas de tarefas com a precisão de um banco de dados. Filtros multicritério, busca instantânea e agrupamentos por responsável ou status para uma visão clara de grandes projetos.", 
      icon: List, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50 dark:bg-amber-900/20' 
    },
    { 
      title: "Documentação e Notas Ricas", 
      desc: "Centralize o conhecimento. Editor de texto rico para atas de reunião, wikis de projeto e brainstorms vinculados às tarefas, mantendo toda a memória do projeto em um só lugar.", 
      icon: StickyNote, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50 dark:bg-rose-900/20' 
    },
    { 
      title: "Calendário e Cronogramas", 
      desc: "Planeje seus marcos críticos com visualização de calendário. Antecipe conflitos de agenda, organize prazos semanais e garanta que cada deadline seja cumprido sem sobrecarga de equipe.", 
      icon: Calendar, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 dark:bg-blue-900/20' 
    },
    { 
      title: "Sincronização Cloud em Real-time", 
      desc: "Colaboração sem fronteiras. Cloud Sync instantâneo que mantém toda a equipe alinhada, com atualizações de status em tempo real e gestão centralizada de responsáveis e permissões.", 
      icon: Users, 
      color: 'text-violet-600', 
      bg: 'bg-violet-50 dark:bg-violet-900/20' 
    }
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
    { q: t('landingFaq3Q'), a: t('landingFaq3A') },
    { q: "O sistema possui modo escuro?", a: "Sim! O HybridTask oferece suporte completo ao modo escuro para reduzir o cansaço visual e se adaptar às suas preferências de ambiente de trabalho." }
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans scroll-smooth transition-colors">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <ClipboardList className="text-white w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight uppercase">HybridTask</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
             <button onClick={() => scrollTo('ferramentas')} className="hover:text-indigo-600 transition-colors">Recursos</button>
             <button onClick={() => scrollTo('manual')} className="hover:text-indigo-600 transition-colors">Manual</button>
             <button onClick={() => scrollTo('faq')} className="hover:text-indigo-600 transition-colors">Dúvidas</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onGoToLogin} className="text-slate-600 dark:text-slate-400 font-bold hover:text-indigo-600 px-3 py-1.5 text-xs">{t('signIn')}</button>
            <button onClick={onGoToSignup} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-[10px] hover:bg-indigo-700 transition-all shadow-lg active:scale-95 glow-effect uppercase tracking-widest">
              {t('signUp')}
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-6 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black tracking-widest mb-6 uppercase border border-indigo-100">
            <Sparkles size={12} /> Produtividade Máxima
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-tight dark:text-white">
            Gerencie Projetos com <span className="text-indigo-600">Alta Performance</span>
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Organize seu fluxo ágil, visualize métricas em dashboards de BI e mantenha sua documentação sincronizada em uma única plataforma cloud.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onGoToSignup} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-base hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-3 glow-effect">
              {t('landingStartBtn')} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <section id="ferramentas" className="py-20 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">Recursos do Ecossistema</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm font-medium">Tudo o que gestores modernos precisam para organizar fluxos de trabalho e equipes de alta entrega.</p>
            <div className="h-1 w-12 bg-indigo-600 mx-auto rounded-full mt-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                 <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center ${f.color} mb-6 group-hover:scale-110 transition-transform`}>
                   <f.icon size={24} />
                 </div>
                 <h3 className="text-lg font-black text-slate-800 dark:text-white mb-3 tracking-tight">{f.title}</h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="manual" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start gap-12">
            <div className="md:w-1/2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase mb-4 border border-emerald-100">
                 <BookOpen size={12} /> Guia de Domínio
               </div>
               <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-tight">{t('userManualTitle')}</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">{t('userManualSub')}</p>
            </div>
            <div className="md:w-1/2 space-y-6">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-4">
                   <div className="w-8 h-8 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-base shrink-0">
                     {s.id}
                   </div>
                   <div>
                     <h3 className="text-base font-black text-slate-800 dark:text-white mb-1">{s.title}</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{s.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
           <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Dúvidas Frequentes (FAQ)</h2>
              <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">Respostas Rápidas para Perguntas Comuns</p>
           </div>
           <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:border-indigo-200 transition-colors group">
                   <h3 className="text-sm font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2 group-hover:text-indigo-600 uppercase tracking-tight">
                      <Target size={14} className="text-indigo-500" />
                      {faq.q}
                   </h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <ClipboardList className="text-white w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight uppercase dark:text-white">HybridTask</span>
          </div>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest text-center">
            © 2025 HybridTask Manager. Desenvolvido com excelência pela <a href="https://wa.me/+5513985994965" target="_blank" className="text-indigo-600 font-bold hover:underline">JR Marketing</a>
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
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const getErrorMessage = (err: any): string => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (err.message) return String(err.message);
    if (err.error_description) return String(err.error_description);
    if (err.error) return typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
    
    try {
      const stringified = JSON.stringify(err);
      return stringified === '{}' ? 'Ocorreu um erro inesperado.' : stringified;
    } catch {
      return String(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await DataService.login(email, password);
        onLogin(user);
      } else {
        try {
          await DataService.signup(name, email, password);
          setSuccessMessage("Cadastro realizado com sucesso! Enviamos um e-mail de confirmação para você. Por favor, ative sua conta antes de tentar entrar.");
          setMode('login');
          setName('');
          setPassword('');
        } catch (signupErr: any) {
          const errMsg = getErrorMessage(signupErr);
          
          if (errMsg === 'CONFIRM_EMAIL') {
            setSuccessMessage("Cadastro realizado! Por favor, verifique seu e-mail para ativar sua conta.");
            setMode('login');
            setName('');
            setPassword('');
          } else if (errMsg.toLowerCase().includes('already registered') || errMsg.toLowerCase().includes('already exists')) {
            setError("Este e-mail já possui uma conta cadastrada. Tente fazer o login ou recupere sua senha.");
          } else {
            throw signupErr;
          }
        }
      }
    } catch (err: any) {
      const finalMsg = getErrorMessage(err);
      if (finalMsg !== 'CONFIRM_EMAIL') {
        setError(finalMsg || t('loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 text-sm font-medium shadow-inner";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md animate-in fade-in zoom-in duration-300">
        <button onClick={onBackToHome} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 text-[10px] mb-8 transition-colors font-black uppercase tracking-widest">
          <ArrowLeft size={14} /> {t('landingBackToHome')}
        </button>
        
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg glow-effect">
              <ClipboardList className="text-white" size={24} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
             {mode === 'login' ? t('signIn') : t('signUp')}
           </h2>
        </div>

        {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{successMessage}</span>
            </div>
        )}

        {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-start gap-3 animate-in shake duration-300">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('name')}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} placeholder="Seu nome completo" required={mode === 'signup'} />
            </div>
          )}
          <div>
            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} placeholder="seu@email.com" required />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} placeholder="••••••••" required />
          </div>

          <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all active:scale-[0.98] glow-effect mt-2 text-xs uppercase tracking-widest">
            {loading ? <RefreshCw className="animate-spin mx-auto" size={18} /> : (mode === 'login' ? t('signIn') : "Criar Minha Conta Grátis")}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
          {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMessage(''); }} className="text-indigo-600 dark:text-indigo-400 font-black hover:underline underline-offset-4 ml-1">
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
      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-bounce mb-4"><ClipboardList className="text-white" size={24} /></div>
      <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Sincronizando...</div>
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
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm z-30 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-56'}`}>
        <div className={`p-5 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg icon-shadow shrink-0">
                <ClipboardList className="text-white" size={16} />
              </div>
              {!isSidebarCollapsed && <span className="font-black text-base tracking-tight uppercase">HybridTask</span>}
           </div>
        </div>

        <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-3'} space-y-1.5`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-tooltip={isSidebarCollapsed ? item.label : undefined}
              className={({ isActive }) => 
                `flex items-center rounded-xl font-bold text-xs transition-all group relative ${isSidebarCollapsed ? 'sidebar-tooltip justify-center px-0 py-3' : 'gap-3 px-3 py-3'} ${isActive ? 'bg-indigo-600 text-white shadow-lg glow-effect' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800'}`
              }
            >
              <item.icon size={isSidebarCollapsed ? 16 : 18} className="shrink-0 transition-transform group-hover:scale-110" />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
           <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`w-full flex items-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all ${isSidebarCollapsed ? 'justify-center py-3' : 'justify-between px-3 py-2.5'}`}>
              {!isSidebarCollapsed && <span className="text-[9px] font-black uppercase tracking-widest">Recolher</span>}
              {isSidebarCollapsed ? <ChevronLast size={16} /> : <ChevronFirst size={16} />}
           </button>
           <div onClick={() => setIsProfileModalOpen(true)} className={`flex items-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all group ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2.5'}`}>
              <Avatar name={user.name} url={user.avatar} size="sm" />
              {!isSidebarCollapsed && <div className="min-w-0"><p className="text-xs font-black dark:text-white truncate">{user.name}</p></div>}
           </div>
           <button onClick={async () => { await DataService.logout(); setUser(null); }} className={`w-full flex items-center rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ${isSidebarCollapsed ? 'justify-center py-3' : 'gap-2.5 px-3 py-2.5'}`}>
              <LogOut size={18} />
              {!isSidebarCollapsed && <span>{t('logout')}</span>}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"><Menu size={20} /></button>
             <div className="hidden lg:flex items-center gap-2"><ClipboardList className="text-indigo-600" size={16} /><span className="font-black text-base dark:text-white uppercase tracking-tighter">HybridTask</span></div>
           </div>
           <div className="flex items-center gap-2">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-600 shadow-sm transition-all">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-xl border transition-all relative ${showNotifications ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 shadow-sm'}`}>
                  <Bell size={16} />
                  {overdueTasksCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 border-b dark:border-slate-800 flex items-center justify-between"><span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('notifications')}</span><span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-600 text-[8px] font-black rounded-full">{overdueTasksCount} alertas</span></div>
                    <div className="max-h-80 overflow-y-auto">
                      {overdueTasksCount > 0 ? Object.values(boardData.tasks).filter(t => t.status !== 'Done' && new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0)).map(task => <NotificationItem key={task.id} icon={AlertCircle} color="bg-red-500" title={task.title} time={new Date(task.dueDate).toLocaleDateString()} onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); setShowNotifications(false); }} />) : <div className="p-6 text-center"><p className="text-[10px] font-bold text-slate-400">{t('noNotifications')}</p></div>}
                    </div>
                  </div>
                )}
              </div>
              <Avatar name={user.name} url={user.avatar} size="sm" onClick={() => setIsProfileModalOpen(true)} />
           </div>
        </header>

        <div className="px-5 pt-6 md:px-8 flex items-center justify-between shrink-0 mb-5">
           <div><h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">{navItems.find(i => location.pathname.startsWith(i.to))?.label || t('dashboard')}</h1></div>
           <button onClick={() => { setSelectedTask(undefined); setIsTaskModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-indigo-700 shadow-xl transition-all active:scale-95 glow-effect"><Plus size={16} /><span className="hidden sm:inline">{t('newTask')}</span></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 md:px-8 scroll-smooth custom-scrollbar">
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
              <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
              <aside className="absolute top-0 left-0 w-64 h-full bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300 rounded-r-3xl">
                 <div className="flex items-center justify-between mb-8"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg"><ClipboardList className="text-white" size={16} /></div><span className="font-black text-lg dark:text-white uppercase tracking-tighter">HybridTask</span></div><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 rounded-xl"><X size={20} /></button></div>
                 <nav className="flex-1 space-y-1.5">{navItems.map((item) => (<NavLink key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}><item.icon size={18} /> {item.label}</NavLink>))}</nav>
                 <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800"><button onClick={async () => { await DataService.logout(); setUser(null); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs text-red-500"><LogOut size={18} /> {t('logout')}</button></div>
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