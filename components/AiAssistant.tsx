
import React, { useState } from 'react';
import { Sparkles, X, Wand2, Loader2, CheckCircle2, ChevronRight, LayoutList } from 'lucide-react';
import { AIService } from '../services/aiService';
import { BoardData, Task } from '../types';
import { DataService } from '../services/dataService';
import { useLanguage } from '../utils/i18n';

interface AiAssistantProps {
  boardData: BoardData;
  onTasksGenerated: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ boardData, onTasksGenerated }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Partial<Task>[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const tasks = await AIService.generateTasks(prompt, boardData);
      setGeneratedTasks(tasks);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      for (const task of generatedTasks) {
        await DataService.addTask({
          ...task,
          createdAt: new Date().toISOString()
        });
      }
      setGeneratedTasks([]);
      setPrompt('');
      setIsOpen(false);
      onTasksGenerated();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-white dark:border-slate-900"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
      </button>

      {/* Side Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-950 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Wand2 size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black dark:text-white uppercase tracking-tight">IA Arquiteta</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Transforme ideias em planos</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {generatedTasks.length === 0 ? (
                <div className="space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
                      Descreva seu objetivo ou projeto. Nossa IA criará uma estrutura de tarefas otimizada para você.
                    </p>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Planejar uma reforma na cozinha ou Lançar um novo site em 2 semanas..."
                    className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all dark:text-white resize-none"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {isGenerating ? (
                      <><Loader2 size={16} className="animate-spin" /> Arquitetando...</>
                    ) : (
                      <><Sparkles size={16} /> Gerar Plano de Ação</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <LayoutList size={14} /> Sugestão de Tarefas ({generatedTasks.length})
                    </h3>
                    <button onClick={() => setGeneratedTasks([])} className="text-[10px] font-bold text-indigo-600 hover:underline">Reiniciar</button>
                  </div>
                  <div className="space-y-2">
                    {generatedTasks.map((task, i) => (
                      <div key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                        <h4 className="text-[11px] font-bold text-slate-800 dark:text-white mb-1">{task.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{task.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                           <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-black uppercase text-slate-500">
                             {boardData.priorities.find(p => p.id === task.priority)?.title || 'Normal'}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {isDeploying ? (
                      <><Loader2 size={16} className="animate-spin" /> Implantando...</>
                    ) : (
                      <><CheckCircle2 size={16} /> Aplicar ao meu Quadro</>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-800">
               <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase text-center tracking-tighter">
                 Powered by Google Gemini Flash • Inteligência Artificial de Alta Performance
               </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
