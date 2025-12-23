import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  Layout, LayoutDashboard, Settings, Plus, LogOut, Globe, User as UserIcon, 
  Lock, Mail, Bell, Calendar, CheckCircle, Circle, AlertTriangle, Kanban, List, ArrowLeft, KeyRound, Link as LinkIcon, 
  ShieldAlert, Menu, X, RefreshCw, StickyNote, WifiOff, Clock, BarChart3,
  Layers, ChevronDown, Rocket, CheckCircle2, Zap, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2 as CheckIcon,
  Download
} from 'lucide-react';
import { DataService } from './services/dataService';
import { BoardData, Task, User, Priority } from './types';
import { KanbanBoard } from './views/KanbanBoard';
import { TableView } from './views/TableView';
import { Dashboard } from './views/Dashboard';
import { SettingsView } from './views/SettingsView';
import { NotesView } from './views/NotesView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { ConfirmationModal, Modal } from './components/Shared';
import { DropResult } from '@hello-pangea/dnd';
import { LanguageProvider, useLanguage } from './utils/i18n';
import { supabase } from './utils/supabaseClient';

// -- Landing Page Component --
const LandingPage = ({ onGoToLogin, onGoToSignup }: { onGoToLogin: () => void, onGoToSignup: () => void }) => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Layout className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">HybridTask</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
             <a href="#features" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
             <a href="#benefits" className="hover:text-indigo-600 transition-colors">Benefícios</a>
             <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGoToLogin}
              className="text-slate-600 font-medium hover:text-indigo-600 transition-colors px-4 py-2"
            >
              {t('signIn')}
            </button>
            <button 
              onClick={onGoToSignup}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              {t('signUp')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mb-6 animate-bounce">
            <Rocket size={14} /> NOVO: DASHBOARDS EM TEMPO REAL
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
            {t('landingHeroTitle')} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Totalmente Online e Grátis.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t('landingHeroSub')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onGoToSignup}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1"
            >
              {t('landingStartBtn')}
            </button>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <CheckCircle2 size={16} className="text-green-500" /> Sem cartão de crédito necessário
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Funcionalidades de um Gerenciador Profissional</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Tudo o que você precisa para gerenciar projetos, desde o planejamento até a análise final de resultados.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Kanban size={24} />}
              title={t('landingFeature1Title')}
              desc={t('landingFeature1Desc')}
            />
            <FeatureCard 
              icon={<BarChart3 size={24} />}
              title={t('landingFeature2Title')}
              desc={t('landingFeature2Desc')}
            />
            <FeatureCard 
              icon={<Layers size={24} />}
              title={t('landingFeature3Title')}
              desc={t('landingFeature3Desc')}
            />
            <FeatureCard 
              icon={<StickyNote size={24} />}
              title={t('landingFeature4Title')}
              desc={t('landingFeature4Desc')}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section (SEO Rich) */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">{t('landingBenefitsTitle')}</h2>
                <div className="space-y-8">
                    <BenefitItem 
                        icon={<Zap className="text-indigo-600" size={24} />}
                        title={t('landingBenefit1Title')}
                        desc={t('landingBenefit1Desc')}
                    />
                    <BenefitItem 
                        icon={<ShieldCheck className="text-indigo-600" size={24} />}
                        title={t('landingBenefit2Title')}
                        desc={t('landingBenefit2Desc')}
                    />
                    <BenefitItem 
                        icon={<TrendingUp className="text-indigo-600" size={24} />}
                        title={t('landingBenefit3Title')}
                        desc={t('landingBenefit3Desc')}
                    />
                </div>
            </div>
            {/* Visual Dashboard Mockup (Matching user's screenshot) */}
            <div className="lg:w-1/2 w-full bg-slate-100 rounded-[2rem] p-4 md:p-6 border border-slate-200 shadow-2xl relative overflow-hidden group">
                <div className="bg-white rounded-2xl shadow-lg h-full w-full overflow-hidden flex flex-col border border-slate-200/50">
                    {/* Fake Header */}
                    <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-4">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        </div>
                        <div className="h-5 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                    </div>
                    {/* Mock Dashboard Body */}
                    <div className="p-4 md:p-6 space-y-4 bg-slate-50/30 flex-1 overflow-hidden">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div><div className="h-2 w-12 bg-slate-100 mb-2"></div><div className="text-lg font-bold text-slate-800">33%</div></div>
                                <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center"><CheckIcon size={14} className="text-white" /></div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div><div className="h-2 w-12 bg-slate-100 mb-2"></div><div className="text-lg font-bold text-slate-800">1</div></div>
                                <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center"><AlertCircle size={14} className="text-white" /></div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div><div className="h-2 w-12 bg-slate-100 mb-2"></div><div className="text-lg font-bold text-slate-800">3</div></div>
                                <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center"><Clock size={14} className="text-white" /></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 h-48">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                                <div className="h-2 w-24 bg-slate-100 mb-4 self-start"></div>
                                <div className="w-28 h-28 rounded-full border-[10px] border-slate-100 relative flex items-center justify-center">
                                    <div className="absolute inset-0 border-[10px] border-green-500 rounded-full border-t-transparent border-l-transparent -rotate-45"></div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-end gap-1">
                                <div className="h-2 w-24 bg-slate-100 mb-8 self-start"></div>
                                <div className="flex items-end gap-2 h-full px-2">
                                    <div className="w-full bg-indigo-500 rounded-t-md h-[80%]"></div>
                                    <div className="w-full bg-slate-100 rounded-t-md h-[10%]"></div>
                                    <div className="w-full bg-slate-100 rounded-t-md h-[15%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (SEO Snippets) */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t('landingFaqTitle')}</h2>
            <div className="space-y-6">
                <FaqItem question={t('landingFaq1Q')} answer={t('landingFaq1A')} />
                <FaqItem question={t('landingFaq2Q')} answer={t('landingFaq2A')} />
                <FaqItem question={t('landingFaq3Q')} answer={t('landingFaq3A')} />
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
              <Layout className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-900">HybridTask</span>
          </div>
          <p className="text-slate-400 text-sm">© 2024 HybridTask Manager. Desenvolvido para máxima produtividade.</p>
          <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-600">Privacidade</a>
              <a href="#" className="hover:text-indigo-600">Termos</a>
              <a href="#" className="hover:text-indigo-600">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 group">
    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-indigo-200">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const BenefitItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-5">
    <div className="shrink-0 mt-1">{icon}</div>
    <div>
        <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <span className="font-bold text-slate-800">{question}</span>
                <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-6 pb-5 text-slate-500 animate-in slide-in-from-top-1 duration-300">
                    {answer}
                </div>
            )}
        </div>
    );
};

// -- Login / Signup / Direct Reset Flow --
type AuthMode = 'login' | 'signup' | 'direct_reset';

const Login = ({ onLogin, onBackToHome, initialMode = 'login' }: { onLogin: (user: User) => void, onBackToHome: () => void, initialMode?: AuthMode }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  
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
        if (!email || !password) throw new Error(t('fillAllFields'));
        if (password.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");
        await DataService.adminForcePasswordReset(email, password);
        setSuccessMsg("Senha alterada com sucesso! Você pode fazer login agora.");
        setTimeout(() => {
            setMode('login');
            setPassword('');
        }, 2000);
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.message === 'CONFIRM_EMAIL') {
          setSuccessMsg(t('checkEmail'));
          setMode('login'); 
          setPassword('');
      } else {
          setError(err.message || t('loginError'));
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t('landingBackToHome')}
        </button>

        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
             <Layout className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? t('signIn') : (mode === 'signup' ? t('signUp') : 'Redefinir Senha')}
          </h1>
          <p className="text-slate-500 mt-2">
            {mode === 'login' ? t('welcomeBack') : t('enterDetails')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
               <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                 placeholder={t('name')}
                 required={mode === 'signup'}
               />
            </div>
          )}

          <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="email" 
               value={email}
               onChange={e => setEmail(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
               className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
               placeholder={mode === 'direct_reset' ? 'Nova Senha' : t('password')}
               required
             />
          </div>

          {mode === 'login' && (
             <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => toggleMode('direct_reset')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
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
            <div className="text-red-600 bg-red-50 text-sm flex items-start gap-2 p-3 rounded-lg border border-red-100">
              <WifiOff size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-100 mt-2 disabled:opacity-70 active:scale-[0.98]"
          >
            {loading 
              ? <RefreshCw className="animate-spin" size={20} />
              : (mode === 'login' ? t('signIn') : (mode === 'signup' ? t('signUp') : 'Atualizar Senha'))
            }
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
            <button 
              onClick={() => toggleMode(mode === 'login' ? 'signup' : 'login')} 
              className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline"
            >
              {mode === 'login' ? t('signUp') : t('signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// -- Main App Content --
const MainApp = ({ user, onLogout, onUpdateUser }: { user: User, onLogout: () => void, onUpdateUser: (u: User) => void }) => {
  const { t } = useLanguage();
  const [data, setData] = useState<BoardData | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appError, setAppError] = useState<string>('');
  const [isRetryLoading, setIsRetryLoading] = useState(false);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deleteIntent, setDeleteIntent] = useState<{ type: 'task' | 'column' | 'priority' | 'assignee', id: string } | null>(null);

  const IDLE_LIMIT = 30 * 60 * 1000;
  const WARNING_DURATION = 60;
  const [isIdleWarningOpen, setIsIdleWarningOpen] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(WARNING_DURATION);
  const idleTimerRef = useRef<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const resetIdleTimer = () => {
    if (isIdleWarningOpen) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdleWarningOpen(true);
      setIdleCountdown(WARNING_DURATION);
    }, IDLE_LIMIT);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handler = () => resetIdleTimer();
    events.forEach(event => window.addEventListener(event, handler));
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(event => window.removeEventListener(event, handler));
    };
  }, [isIdleWarningOpen]);

  useEffect(() => {
    let interval: any;
    if (isIdleWarningOpen) {
      interval = setInterval(() => {
        setIdleCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isIdleWarningOpen, onLogout]);

  const loadData = async () => {
    setAppError('');
    setIsRetryLoading(true);
    try {
      const boardData = await DataService.getBoardData();
      setData(boardData);
    } catch (e: any) {
      setAppError(e.message || "Failed to connect to database.");
    } finally {
      setIsRetryLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) loadData();
  }, [user.id]);

  const notifications = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tasks = (Object.values(data.tasks) as Task[]).filter(task => {
        const isDone = task.status.toLowerCase().includes('done') || task.status === 'Done';
        return !isDone; 
    });
    return tasks.map(task => {
        if (!task.dueDate) return null;
        const dueDay = new Date(new Date(task.dueDate).getFullYear(), new Date(task.dueDate).getMonth(), new Date(task.dueDate).getDate());
        const diffDays = Math.ceil((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return { task, type: 'overdue', days: Math.abs(diffDays) };
        if (diffDays === 0) return { task, type: 'today', days: 0 };
        if (diffDays <= 3) return { task, type: 'soon', days: diffDays };
        return null;
    }).filter(n => n !== null).sort((a, b) => {
        const priorityOrder = { today: 0, overdue: 1, soon: 2 };
        return (priorityOrder[a!.type] - priorityOrder[b!.type]);
    }) as any[];
  }, [data]);

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
      DataService.updateTaskPosition(draggableId, col.id, destination.index);
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
      DataService.updateTaskPosition(draggableId, finish.id, destination.index);
    }
    setData(newData);
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    try {
      if (editingTask) {
        const newData = await DataService.updateTask({ ...editingTask, ...task } as Task);
        setData(newData);
      } else {
        const newData = await DataService.addTask({
          id: '', status: data?.columnOrder[0] || 'To Do', createdAt: new Date().toISOString(), tags: [], ...(task as any)
        });
        setData(newData);
      }
      setEditingTask(undefined);
    } catch (e: any) { setAppError("Error saving task: " + e.message); }
  };

  const executeDelete = async () => {
    if (!deleteIntent) return;
    try {
        let newData = null;
        if (deleteIntent.type === 'task') newData = await DataService.deleteTask(deleteIntent.id);
        else if (deleteIntent.type === 'column') newData = await DataService.deleteColumn(deleteIntent.id);
        else if (deleteIntent.type === 'priority') newData = await DataService.deletePriority(deleteIntent.id);
        else if (deleteIntent.type === 'assignee') newData = await DataService.deleteAssignee(deleteIntent.id);
        if (newData) setData(newData);
    } catch (e: any) { setAppError("Error deleting: " + e.message); } finally { setDeleteIntent(null); }
  };

  // Close mobile menu on navigate
  const location = useLocation();
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (appError && !data) {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-100 p-4 text-center">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Erro de Conexão</h2>
                <p className="text-slate-500 mb-6">{appError}</p>
                <button onClick={loadData} disabled={isRetryLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto">
                    <RefreshCw size={18} className={isRetryLoading ? "animate-spin" : ""} /> Tentar Novamente
                </button>
            </div>
        </div>
    );
  }

  if (!data) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-64 shadow-2xl md:shadow-none`}>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                <Layout className="text-white w-5 h-5" />
              </div>
              {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-bold text-white tracking-tight">HybridTask</span>}
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 px-3 space-y-1 mt-6">
            <NavLink to="/" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              <LayoutDashboard size={18} /> {(!isSidebarCollapsed || isMobileMenuOpen) && <span>{t('dashboard')}</span>}
            </NavLink>
            <NavLink to="/board" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              <Kanban size={18} /> {(!isSidebarCollapsed || isMobileMenuOpen) && <span>{t('kanban')}</span>}
            </NavLink>
            <NavLink to="/table" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              <List size={18} /> {(!isSidebarCollapsed || isMobileMenuOpen) && <span>{t('table')}</span>}
            </NavLink>
            <NavLink to="/notes" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              <StickyNote size={18} /> {(!isSidebarCollapsed || isMobileMenuOpen) && <span>{t('notes')}</span>}
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              <Settings size={18} /> {(!isSidebarCollapsed || isMobileMenuOpen) && <span>{t('settings')}</span>}
            </NavLink>
            {/* PWA Install Button (Mobile/Desktop Prompt) */}
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-400 hover:bg-slate-800 w-full text-left transition-colors border border-emerald-500/20 mt-4"
              >
                <Download size={18} /> {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="font-semibold text-sm">Instalar App</span>}
              </button>
            )}
          </nav>
          <div className="p-4 border-t border-slate-800">
             <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 w-full text-left">
                {user.avatar ? <img src={user.avatar} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-bold">{user.name.charAt(0)}</div>}
                {(!isSidebarCollapsed || isMobileMenuOpen) && <div className="truncate"><p className="text-sm font-medium text-white">{user.name}</p></div>}
             </button>
             <button onClick={onLogout} className="flex items-center gap-3 px-2 py-2 mt-2 rounded-lg text-red-400 hover:bg-slate-800 w-full">
               <LogOut size={20} /> {(!isSidebarCollapsed || isMobileMenuOpen) && <span>{t('logout')}</span>}
             </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
             <div className="flex items-center gap-3">
                 <button 
                  onClick={() => setIsMobileMenuOpen(true)} 
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Menu size={24} />
                </button>
                 <h2 className="text-lg md:text-xl font-semibold truncate">{t('projectOverview')}</h2>
             </div>
             <div className="flex items-center gap-2 md:gap-4">
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 relative hover:bg-slate-100 rounded-full">
                    <Bell size={20} /> {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                <button onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }} className="bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm hover:bg-indigo-700 active:scale-95 transition-all">
                  <Plus size={18} /> <span className="hidden sm:inline">{t('newTask')}</span>
                </button>
             </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard data={data} />} />
              <Route path="/board" element={<KanbanBoard data={data} onDragEnd={handleDragEnd} onEditTask={setEditingTask} onDeleteTask={id => setDeleteIntent({type:'task',id})} />} />
              <Route path="/table" element={<TableView data={data} onEditTask={setEditingTask} onDeleteTask={id => setDeleteIntent({type:'task',id})} />} />
              <Route path="/notes" element={<NotesView data={data} onUpdate={loadData} />} />
              <Route path="/settings" element={<SettingsView data={data} onAddColumn={DataService.addColumn} onUpdateColumn={DataService.updateColumn} onDeleteColumn={id => setDeleteIntent({type:'column',id})} onAddPriority={DataService.addPriority} onUpdatePriority={DataService.updatePriority} onDeletePriority={id => setDeleteIntent({type:'priority',id})} onAddAssignee={DataService.addAssignee} onDeleteAssignee={id => setDeleteIntent({type:'assignee',id})} onRestoreDefaults={loadData} />} />
            </Routes>
          </div>
        </main>
      <TaskModal isOpen={isTaskModalOpen || !!editingTask} onClose={() => {setIsTaskModalOpen(false); setEditingTask(undefined);}} onSubmit={handleSaveTask} initialData={editingTask} boardData={data} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} onUpdate={async (id, d) => onUpdateUser(await DataService.updateCurrentUser(id, d))} />
      <ConfirmationModal isOpen={!!deleteIntent} onClose={() => setDeleteIntent(null)} onConfirm={executeDelete} title="Confirmar" message="Deseja excluir?" />
    </div>
  );
};

// -- App Entry Point --
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');

  useEffect(() => {
    DataService.getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50">Iniciando...</div>;

  if (user) return (
    <HashRouter>
      <LanguageProvider>
        <MainApp user={user} onLogout={() => setUser(null)} onUpdateUser={setUser} />
      </LanguageProvider>
    </HashRouter>
  );

  return (
    <LanguageProvider>
      {authView === 'landing' ? (
        <LandingPage 
          onGoToLogin={() => setAuthView('login')} 
          onGoToSignup={() => setAuthView('signup')} 
        />
      ) : (
        <Login 
          initialMode={authView === 'signup' ? 'signup' : 'login'}
          onLogin={setUser} 
          onBackToHome={() => setAuthView('landing')} 
        />
      )}
    </LanguageProvider>
  );
};

export default App;