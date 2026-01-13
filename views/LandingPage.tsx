
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Kanban, BarChart3, StickyNote, Shield, Zap, 
  ChevronRight, LayoutDashboard, List, Calendar, ArrowRight, Github
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const FeatureCard = ({ icon: Icon, title, desc }: any) => (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-black uppercase tracking-tight mb-2 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap className="text-white fill-current" size={16} />
            </div>
            <span className="font-black text-sm uppercase tracking-tighter dark:text-white">HybridTask</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">
              {t('landingLoginBtn')}
            </button>
            <button onClick={() => navigate('/login')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
              {t('landingStartBtn')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-6">
            {t('landingHeroTitle')}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            {t('landingHeroSub')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group">
              {t('landingStartBtn')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-4 border-white dark:border-black" />
              ))}
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border-4 border-white dark:border-black">+2k</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-slate-50/50 dark:bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Kanban} title={t('landingFeature1Title')} desc={t('landingFeature1Desc')} />
            <FeatureCard icon={BarChart3} title={t('landingFeature2Title')} desc={t('landingFeature2Desc')} />
            <FeatureCard icon={List} title={t('landingFeature3Title')} desc={t('landingFeature3Desc')} />
            <FeatureCard icon={StickyNote} title={t('landingFeature4Title')} desc={t('landingFeature4Desc')} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Zap size={16} />
            <span className="font-black text-xs uppercase tracking-tighter">HybridTask v2.5</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2024 HybridTask • Sua produtividade, simplificada.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Github size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
};
