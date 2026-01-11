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
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: any;
    if (signupSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (signupSuccess && countdown === 0) {
      setSignupSuccess(false);
      setMode('login');
      setCountdown(3);
    }
    return () => clearInterval(timer);
  }, [signupSuccess, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await DataService.login(email, password);
        onLogin(user);
      } else {
        try {
          await DataService.signup(name, email, password);
        } catch (err: any) {
          if (err.message === "CONFIRM_EMAIL") {
            setSignupSuccess(true);
            return;
          }
          throw err;
        }
        setSignupSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 transition-all";

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md text-center animate-in zoom-in-95 duration-300">
           <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border border-green-100">
              <Mail size={40} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-4">Verifique seu E-mail</h2>
           <p className="text-slate-500 font-medium mb-8 leading-relaxed">
             Enviamos um link de confirmação para o seu e-mail. Por favor, confirme sua conta para continuar.
           </p>
           <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
               Redirecionando em {countdown}s
             </div>
             <button 
               onClick={() => { setSignupSuccess(false); setMode('login'); }}
               className="text-indigo-600 font-bold hover:underline transition-all"
             >
               Ir para Login agora
             </button>
           </div>
        </div>
      </div>
    );
  }

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

// -- Main App Component --

/**
 * Fix: Added missing App component and export default App
 */
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [boardData, setBoardData] = useState<BoardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup'>('landing');
  const [activeTask, setActiveTask] = useState<Task | Partial<Task> | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async (u: User) => {
    try {
      const data = await DataService.fetchBoardData(u.id);
      setBoardData(data);
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const u = await DataService.getCurrentUser();
      if (u) {
        setUser(u);
        await fetchData(u);
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = await DataService.getCurrentUser();
        if (u) {
          setUser(u);
          await fetchData(u);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setBoardData(INITIAL_DATA);
        setAuthMode('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const task = boardData.tasks[draggableId];
    if (task.status !== destination.droppableId) {
      const updatedTask = { ...task, status: destination.droppableId };
      setBoardData(prev => {
        const newTasks = { ...prev.tasks, [draggableId]: updatedTask };
        const newColumns = { ...prev.columns };
        newColumns[source.droppableId].taskIds = prev.columns[source.droppableId].taskIds.filter(id => id !== draggableId);
        newColumns[destination.droppableId].taskIds.splice(destination.index, 0, draggableId);
        return { ...prev, tasks: newTasks, columns: newColumns };
      });
      await DataService.updateTask(draggableId, { status: destination.droppableId });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <RefreshCw className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  if (!user) {
    if (authMode === 'landing') return <LanguageProvider><LandingPage onGoToLogin={() => setAuthMode('login')} onGoToSignup={() => setAuthMode('signup')} /></LanguageProvider>;
    return <LanguageProvider><AuthView initialMode={authMode === 'login' ? 'login' : 'signup'} onLogin={(u) => { setUser(u); setAuthMode('landing'); }} onBackToHome={() => setAuthMode('landing')} /></LanguageProvider>;
  }

  return (
    <LanguageProvider>
      <HashRouter>
        <div className="flex h-screen bg-slate-50 text-slate-900">
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300`}>
            <div className="flex flex-col h-full">
              <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Layout size={20} /></div>
                <span className="font-extrabold text-lg tracking-tight">HybridTask</span>
                <button className="lg:hidden ml-auto" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
              </div>
              <nav className="flex-1 px-4 space-y-1">
                <NavItem to="/dashboard" icon={LayoutDashboard} label="dashboard" />
                <NavItem to="/kanban" icon={Kanban} label="kanban" />
                <NavItem to="/table" icon={List} label="table" />
                <NavItem to="/calendar" icon={Calendar} label="calendar" />
                <NavItem to="/notes" icon={StickyNote} label="notes" />
                <NavItem to="/settings" icon={Settings} label="settings" />
              </nav>
              <div className="p-4 border-t border-slate-100">
                <button onClick={() => DataService.logout()} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-bold">
                  <LogOut size={20} /> Sair
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
              <div className="flex items-center gap-4">
                <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}><Menu size={24}/></button>
                <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">Fluxo de Trabalho</h1>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => { setActiveTask({}); setIsTaskModalOpen(true); }} className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  <Plus size={20} /> Nova Tarefa
                </button>
                <Avatar url={user.avatar} name={user.name} size="md" onClick={() => setIsProfileModalOpen(true)} />
              </div>
            </header>

            <div className="flex-1 overflow-auto p-4 md:p-8">
              <Routes>
                <Route path="/dashboard" element={<Dashboard data={boardData} />} />
                <Route path="/kanban" element={<KanbanBoard data={boardData} onDragEnd={handleDragEnd} onEditTask={(t) => { setActiveTask(t); setIsTaskModalOpen(true); }} onDeleteTask={async (id) => { await DataService.deleteTask(id); fetchData(user); }} />} />
                <Route path="/table" element={<TableView data={boardData} onEditTask={(t) => { setActiveTask(t); setIsTaskModalOpen(true); }} onDeleteTask={async (id) => { await DataService.deleteTask(id); fetchData(user); }} />} />
                <Route path="/calendar" element={<CalendarView data={boardData} onEditTask={(t) => { setActiveTask(t); setIsTaskModalOpen(true); }} onAddTaskOnDate={(d) => { setActiveTask({ dueDate: d }); setIsTaskModalOpen(true); }} />} />
                <Route path="/notes" element={<NotesView data={boardData} onUpdate={() => fetchData(user)} />} />
                <Route path="/settings" element={
                  <SettingsView 
                    data={boardData} 
                    onAddColumn={async (t, c) => { await DataService.addColumn(t, c); fetchData(user); }}
                    onUpdateColumn={async (id, u) => { await DataService.updateColumn(id, u); fetchData(user); }}
                    onDeleteColumn={async (id) => { await DataService.deleteColumn(id); fetchData(user); }}
                    onAddPriority={async (t, c) => { await DataService.addPriority(t, c); fetchData(user); }}
                    onUpdatePriority={async (id, u) => { await DataService.updatePriority(id, u); fetchData(user); }}
                    onDeletePriority={async (id) => { await DataService.deletePriority(id); fetchData(user); }}
                    onAddAssignee={async (n, e) => { await DataService.addAssignee(n, e); fetchData(user); }}
                    onDeleteAssignee={async (id) => { await DataService.deleteAssignee(id); fetchData(user); }}
                    onRestoreDefaults={async () => { await DataService.seedUserData(user); fetchData(user); }}
                  />
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>

        <TaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          boardData={boardData}
          initialData={activeTask || undefined}
          onSubmit={async (t) => {
            if ((activeTask as any)?.id) await DataService.updateTask((activeTask as any).id, t);
            else await DataService.addTask(t);
            fetchData(user);
          }}
          onDelete={async (id) => { await DataService.deleteTask(id); fetchData(user); }}
        />
        
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
          user={user} 
          onUpdate={async (id, d) => { const updated = await DataService.updateCurrentUser(id, d); setUser(updated); }} 
        />
      </HashRouter>
    </LanguageProvider>
  );
};

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const { t } = useLanguage();
  return (
    <NavLink to={to} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
      <Icon size={20} />
      <span>{t(label as any)}</span>
    </NavLink>
  );
};

export default App;