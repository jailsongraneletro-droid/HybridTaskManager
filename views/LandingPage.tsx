import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Kanban, BarChart3, StickyNote, Shield, Zap, 
  ChevronRight, LayoutDashboard, List, Calendar, ArrowRight, Github,
  BookOpen, HelpCircle, FileText, CheckCircle, Smartphone, Globe
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
      <h3 className="text-sm font-bold uppercase tracking-tight mb-2 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );

  const BlogCard = ({ title, category, date, image }: any) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 group cursor-pointer hover:shadow-xl transition-all">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="p-5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 mb-2 block">{category}</span>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-tight">{title}</h4>
        <p className="text-[10px] text-slate-400 font-semibold uppercase">{date}</p>
      </div>
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
            <span className="font-bold text-sm uppercase tracking-tighter dark:text-white">HybridTask</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">Funcionalidades</a>
            <a href="#manual" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">Manual</a>
            <a href="#blog" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">Blog</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">
              {t('landingLoginBtn')}
            </button>
            <button onClick={() => navigate('/login')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
              {t('landingStartBtn')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-6">
            {t('landingHeroTitle')}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            {t('landingHeroSub')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group">
              {t('landingStartBtn')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-slate-50/50 dark:bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{t('landingBenefitsTitle')}</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Kanban} title={t('landingFeature1Title')} desc={t('landingFeature1Desc')} />
            <FeatureCard icon={BarChart3} title={t('landingFeature2Title')} desc={t('landingFeature2Desc')} />
            <FeatureCard icon={List} title={t('landingFeature3Title')} desc={t('landingFeature3Desc')} />
            <FeatureCard icon={StickyNote} title={t('landingFeature4Title')} desc={t('landingFeature4Desc')} />
          </div>
        </div>
      </section>

      {/* User Manual Section */}
      <section id="manual" className="py-20 px-6 bg-white dark:bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-4 block">{t('help')}</span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter mb-6">{t('userManualTitle')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">{t('userManualSub')}</p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <h4 className="text-xs font-bold uppercase dark:text-white mb-1">{t('step1Title')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t('step1Desc')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <h4 className="text-xs font-bold uppercase dark:text-white mb-1">{t('step2Title')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t('step2Desc')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <h4 className="text-xs font-bold uppercase dark:text-white mb-1">{t('step3Title')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t('step3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-600/10 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-2">
                   <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000" alt="Interface" className="rounded-2xl w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Previews for SEO */}
      <section id="blog" className="py-20 px-6 bg-slate-50/50 dark:bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Insights do Blog</h2>
            <button className="text-[10px] font-bold uppercase text-indigo-600 flex items-center gap-2 hover:gap-3 transition-all">Ver tudo <ChevronRight size={14}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BlogCard 
              image="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=400"
              category="Produtividade" 
              title="5 Dicas de Gestão de Tempo para Equipes Remotas em 2024"
              date="22 de Maio, 2024"
            />
            <BlogCard 
              image="https://images.unsplash.com/photo-1454165833767-027ffea7025c?auto=format&fit=crop&q=80&w=400"
              category="Metodologia" 
              title="Por que o Kanban é a melhor escolha para Projetos Criativos"
              date="18 de Maio, 2024"
            />
            <BlogCard 
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400"
              category="Tecnologia" 
              title="O Papel da IA no Planejamento de Sprints Modernos"
              date="15 de Maio, 2024"
            />
          </div>
        </div>
      </section>

      {/* Tech Specifications for SEO */}
      <section className="py-12 px-6 border-t dark:border-slate-800 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-indigo-600" />
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Mobile First Design</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-indigo-600" />
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Segurança de Dados</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe size={20} className="text-indigo-600" />
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Sincronização Cloud</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-indigo-600" />
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Performance Ultra</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Zap size={16} />
            <span className="font-bold text-xs uppercase tracking-tighter">HybridTask v2.6</span>
          </div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
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