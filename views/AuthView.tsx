
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, User as UserIcon, ArrowRight, Loader2, 
  AlertCircle, ChevronLeft, Zap, Sparkles 
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { useLanguage } from '../utils/i18n';

export const AuthView: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await DataService.login(formData.email, formData.password);
      } else {
        await DataService.signup(formData.name, formData.email, formData.password);
      }
      // Redireciona e força a recarga para inicializar o estado global corretamente
      window.location.href = '/#/dashboard';
      window.location.reload();
    } catch (err: any) {
      setError(err.message === 'CONFIRM_EMAIL' ? t('checkEmail') : t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-black overflow-hidden animate-in fade-in duration-500">
      {/* Esquerda: Formulário */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 relative z-10">
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">
          <ChevronLeft size={16} /> {t('landingBackToHome')}
        </button>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white shadow-xl mb-6">
              <Zap size={24} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {isLogin ? t('enterDetails') : t('enterDetails')}
            </p>
          </div>

          {error && (
            <div className={`p-4 rounded-2xl border mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${error === t('checkEmail') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('name')}</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white dark:focus:bg-black rounded-2xl outline-none transition-all text-sm font-bold dark:text-white"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('email')}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white dark:focus:bg-black rounded-2xl outline-none transition-all text-sm font-bold dark:text-white"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('password')}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-600/20 focus:bg-white dark:focus:bg-black rounded-2xl outline-none transition-all text-sm font-bold dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>{isLogin ? t('signIn') : t('signUp')} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
              <span className="text-indigo-600 font-black uppercase tracking-tighter">
                {isLogin ? t('signUp') : t('signIn')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Direita: Visual Branding */}
      <div className="hidden lg:flex flex-1 bg-indigo-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-700 opacity-90"></div>
        
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-black/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative z-10 text-center max-w-lg">
          <div className="inline-flex p-4 bg-white/20 backdrop-blur-xl rounded-3xl mb-8 border border-white/20 shadow-2xl">
            <Sparkles className="text-white" size={40} />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-6 drop-shadow-lg">
            A Próxima Geração de Gestão Ágil.
          </h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed">
            Uma plataforma unificada para transformar seus processos complexos em fluxos de trabalho fluidos e inteligentes.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-4">
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg transition-transform hover:scale-105">
                <div className="text-3xl font-black text-white mb-1">98%</div>
                <div className="text-[10px] font-black uppercase text-white/60 tracking-widest">Satisfação</div>
             </div>
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg transition-transform hover:scale-105">
                <div className="text-3xl font-black text-white mb-1">+50k</div>
                <div className="text-[10px] font-black uppercase text-white/60 tracking-widest">Tarefas</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
