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

      {/* Hero Section */}
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

      {/* Visual Showcase: O Melhor do Sistema */}
      <section id="ferramentas" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100"><Kanban size={28} /></div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight">Quadro Kanban: <br/>O Coração do Fluxo Ágil</h2>
              <p className="text-lg text-slate-500 font-medium">Visualize cada etapa do seu processo. Com o arraste-e-solte fluido, você move tarefas de "A Fazer" para "Concluído" com satisfação garantida.</p>
              <ul className="space-y-3">
                {['Colunas Personalizáveis', 'Filtros por Prioridade', 'Gestão de Responsáveis'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <CheckCircle2 size={20} className="text-indigo-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 rotate-1 hover:rotate-0 transition-transform duration-500">
               <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-3">
                     <div className="h-4 w-20 bg-slate-100 rounded-full mb-4"></div>
                     <div className="h-24 bg-indigo-50 rounded-2xl border-l-4 border-indigo-500 shadow-sm p-3">
                        <div className="h-2 w-full bg-indigo-200 rounded-full mb-2"></div>
                        <div className="h-2 w-1/2 bg-indigo-200 rounded-full"></div>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="h-4 w-20 bg-slate-100 rounded-full mb-4"></div>
                     <div className="h-24 bg-amber-50 rounded-2xl border-l-4 border-amber-500 shadow-sm p-3 opacity-50"></div>
                  </div>
                  <div className="space-y-3">
                     <div className="h-4 w-20 bg-slate-100 rounded-full mb-4"></div>
                     <div className="h-24 bg-green-50 rounded-2xl border-l-4 border-green-500 shadow-sm p-3"></div>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 -rotate-1 hover:rotate-0 transition-transform duration-500">
               <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 bg-indigo-600 rounded-xl"></div>
                  <div className="h-10 w-full bg-slate-50 rounded-xl"></div>
               </div>
               <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-50">
                       <div className="h-3 w-1/2 bg-slate-100 rounded-full"></div>
                       <div className="h-6 w-16 bg-indigo-100 rounded-full ml-auto"></div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="w-14 h-14 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-100"><List size={28} /></div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight">Tabelas Dinâmicas: <br/>Poder Analítico Sem Limites</h2>
              <p className="text-lg text-slate-500 font-medium">Para gestores que precisam de dados. Filtre centenas de tarefas, agrupe por responsável ou prioridade e tome decisões baseadas em fatos.</p>
              <ul className="space-y-3">
                {['Agrupamento Inteligente', 'Ordenação por Datas', 'Exportação e Filtros'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                    <CheckCircle2 size={20} className="text-violet-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Manual de Uso: Guia Completo */}
      <section id="manual" className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-slate-900 mb-6">Como usar o HybridTask?</h2>
            <p className="text-slate-500 font-bold text-lg">Um manual rápido para você se tornar um mestre da produtividade.</p>
          </div>

          <div className="space-y-12">
            {/* Passo 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-xl shadow-slate-200">1</div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-800">O Início: Cadastro e Workspace</h3>
                <p className="text-slate-500 leading-relaxed font-medium">Ao criar sua conta, o sistema prepara automaticamente um quadro com as colunas essenciais: **A Fazer, Em Andamento e Concluído**. Você não precisa configurar nada para começar.</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                   <Monitor size={20} className="text-indigo-600" />
                   <span className="text-sm font-bold text-slate-600 italic">Dica: Acesse as Configurações para renomear colunas ou adicionar novas cores ao seu projeto.</span>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-xl shadow-slate-200">2</div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-800">Criação de Tarefas Inteligentes</h3>
                <p className="text-slate-500 leading-relaxed font-medium">Clique no botão <span className="text-indigo-600 font-bold px-2 py-0.5 bg-indigo-50 rounded">+ Nova Tarefa</span> no topo. Defina o título, a data de entrega (deadline) e a prioridade. O sistema irá te alertar visualmente conforme o prazo se aproxima.</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <p className="text-xs font-black text-slate-400 uppercase mb-2">Visualizar</p>
                      <p className="text-sm font-bold text-slate-700">As tarefas aparecem em todas as telas simultaneamente.</p>
                   </div>
                   <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <p className="text-xs font-black text-slate-400 uppercase mb-2">Anotar</p>
                      <p className="text-sm font-bold text-slate-700">Use a descrição para detalhar requisitos e passos.</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-xl shadow-slate-200">3</div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-800">Navegando entre as Visões</h3>
                <p className="text-slate-500 leading-relaxed font-medium">No menu lateral, você tem 4 ferramentas principais:</p>
                <div className="space-y-3">
                   <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><LayoutDashboard size={18} /></div>
                      <div>
                         <p className="font-bold text-slate-800">Painel (Dashboard)</p>
                         <p className="text-sm text-slate-500">Gráficos de desempenho e taxas de conclusão.</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors"><Calendar size={18} /></div>
                      <div>
                         <p className="font-bold text-slate-800">Calendário</p>
                         <p className="text-sm text-slate-500">Arraste para mudar datas ou visualize por semana.</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors"><StickyNote size={18} /></div>
                      <div>
                         <p className="font-bold text-slate-800">Bloco de Notas</p>
                         <p className="text-sm text-slate-500">Registre atas de reunião e ideias sem perder o foco.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-indigo-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter">Pronto para organizar sua vida?</h2>
            <button onClick={onGoToSignup} className="px-12 py-6 bg-white text-indigo-600 rounded-[2rem] font-black text-2xl hover:bg-slate-50 transition-all shadow-2xl hover:scale-105 active:scale-95">
                Começar Gratuitamente
            </button>
            <p className="mt-8 opacity-60 font-bold uppercase tracking-widest text-xs">Junte-se à revolução da produtividade ágil</p>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Layout className="text-white w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg text-slate-900">HybridTask</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2024 HybridTask Manager. Feito para quem faz acontecer.</p>
          <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Termos</a>
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
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
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
      if (err.message === 'CONFIRM_EMAIL') {
          setSuccessMsg(t('checkEmail'));
          setMode('login'); 
      } else {
          setError(err.message || t('loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md">
        <button onClick={onBackToHome} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Voltar ao Início
        </button>

        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-indigo-100">
              <Layout className="text-white" />
           </div>
           <h2 className="text-2xl font-black text-slate-900">{mode === 'login' ? 'Entrar na Conta' : 'Criar Nova Conta'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
               <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Seu Nome" required />
            </div>
          )}
          <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Seu E-mail" required />
          </div>
          <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Sua Senha" required />
          </div>

          {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm font-bold bg-green-50 p-3 rounded-lg border border-green-100">{successMsg}</p>}

          <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50">
            {loading ? <RefreshCw className="animate-spin mx-auto" size={20} /> : (mode === 'login' ? 'Acessar Sistema' : 'Criar Agora')}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-500 text-sm font-medium">
          {mode === 'login' ? 'Não tem conta?' : 'Já é cadastrado?'}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-indigo-600 font-bold hover:underline">
             {mode === 'login' ? 'Cadastre-se' : 'Faça Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// -- Main App Content --
const MainApp = ({ user, onLogout, onUpdateUser }: { user: User, onLogout: () => void, onUpdateUser: (u: User) => void }) => {
  const { t } = useLanguage();
  const [data, setData] = useState<BoardData | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [deleteIntent, setDeleteIntent] = useState<{ type: string, id: string } | null>(null);

  const loadData = async () => {
    try {
      const boardData = await DataService.getBoardData();
      setData(boardData);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !data) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // Local Update
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
    
    // DB Update
    await DataService.updateTaskPosition(draggableId, destination.droppableId, destination.index);
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    if (editingTask) {
        const updated = await DataService.updateTask({ ...editingTask, ...task } as Task);
        setData(updated);
    } else {
        const added = await DataService.addTask({ ...task } as Task);
        setData(added);
    }
    setEditingTask(undefined);
    setIsTaskModalOpen(false);
  };

  const executeDelete = async () => {
    if (!deleteIntent) return;
    if (deleteIntent.type === 'task') {
        const res = await DataService.deleteTask(deleteIntent.id);
        setData(res);
    }
    setDeleteIntent(null);
  };

  if (!data) return <div className="h-screen flex items-center justify-center bg-white"><RefreshCw className="animate-spin text-indigo-600" size={48} /></div>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} h-full border-r border-slate-800`}>
         <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"><Layout className="text-white w-5 h-5" /></div>
               {!isSidebarCollapsed && <span className="font-black text-white tracking-tighter text-lg">HybridTask</span>}
            </div>
         </div>
         <nav className="flex-1 px-4 space-y-1 mt-6">
            <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <LayoutDashboard size={20} /> {!isSidebarCollapsed && <span className="font-bold">Dashboard</span>}
            </NavLink>
            <NavLink to="/kanban" className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <Kanban size={20} /> {!isSidebarCollapsed && <span className="font-bold">Quadro</span>}
            </NavLink>
            <NavLink to="/table" className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <List size={20} /> {!isSidebarCollapsed && <span className="font-bold">Tabela</span>}
            </NavLink>
            <NavLink to="/calendar" className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <Calendar size={20} /> {!isSidebarCollapsed && <span className="font-bold">Calendário</span>}
            </NavLink>
            <NavLink to="/notes" className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <StickyNote size={20} /> {!isSidebarCollapsed && <span className="font-bold">Notas</span>}
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <Settings size={20} /> {!isSidebarCollapsed && <span className="font-bold">Ajustes</span>}
            </NavLink>
         </nav>
         <div className="p-4 border-t border-slate-800 space-y-2">
            <button onClick={() => setIsProfileModalOpen(true)} className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 w-full text-left transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
               <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center font-black text-white text-xs">{user.name.charAt(0)}</div>
               {!isSidebarCollapsed && <span className="font-bold text-sm truncate">{user.name}</span>}
            </button>
            <button onClick={onLogout} className={`flex items-center gap-3 p-2 rounded-xl text-red-400 hover:bg-slate-800 w-full transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
               <LogOut size={20} /> {!isSidebarCollapsed && <span className="font-bold text-sm">Sair</span>}
            </button>
         </div>
      </aside>

      <main className="flex-1 flex flex-col h-full">
         <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <h2 className="text-xl font-black text-slate-800">Workspace</h2>
            <button onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
               <Plus size={18} /> Nova Tarefa
            </button>
         </header>
         <div className="flex-1 overflow-auto p-8">
            <Routes>
               <Route path="/dashboard" element={<Dashboard data={data} />} />
               <Route path="/kanban" element={<KanbanBoard data={data} onDragEnd={handleDragEnd} onEditTask={setEditingTask} onDeleteTask={id => setDeleteIntent({type:'task', id})} />} />
               <Route path="/table" element={<TableView data={data} onEditTask={setEditingTask} onDeleteTask={id => setDeleteIntent({type:'task', id})} />} />
               <Route path="/calendar" element={<CalendarView data={data} onEditTask={setEditingTask} onAddTaskOnDate={(d) => setIsTaskModalOpen(true)} />} />
               <Route path="/notes" element={<NotesView data={data} onUpdate={loadData} />} />
               <Route path="/settings" element={<SettingsView data={data} onAddColumn={DataService.addColumn} onUpdateColumn={DataService.updateColumn} onDeleteColumn={DataService.deleteColumn} onAddPriority={DataService.addPriority} onUpdatePriority={DataService.updatePriority} onDeletePriority={DataService.deletePriority} onAddAssignee={DataService.addAssignee} onDeleteAssignee={DataService.deleteAssignee} onRestoreDefaults={loadData} />} />
               <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
         </div>
      </main>

      <TaskModal isOpen={isTaskModalOpen || !!editingTask} onClose={() => { setIsTaskModalOpen(false); setEditingTask(undefined); }} onSubmit={handleSaveTask} initialData={editingTask} boardData={data} />
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

  useEffect(() => {
    DataService.getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

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
      {authView === 'landing' ? (
        <LandingPage onGoToLogin={() => setAuthView('login')} onGoToSignup={() => setAuthView('signup')} />
      ) : (
        <AuthView initialMode={authView === 'signup' ? 'signup' : 'login'} onLogin={setUser} onBackToHome={() => setAuthView('landing')} />
      )}
    </LanguageProvider>
  );
};

export default App;
