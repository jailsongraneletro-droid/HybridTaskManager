import React, { useState } from 'react';
import { BoardData } from '../types';
import { Plus, Trash2, AlertCircle, RefreshCw, Palette, Layers, Flag, Users, Type, Check } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface SettingsViewProps {
  data: BoardData;
  fontSize: string;
  onFontSizeChange: (size: string) => void;
  onAddColumn: (title: string, color: string) => void;
  onUpdateColumn: (id: string, updates: any) => void;
  onDeleteColumn: (id: string) => void;
  onAddPriority: (title: string, color: string) => void;
  onUpdatePriority: (id: string, updates: any) => void;
  onDeletePriority: (id: string) => void;
  onAddAssignee: (name: string, email: string) => void;
  onDeleteAssignee: (id: string) => void;
  onRestoreDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  data, 
  fontSize,
  onFontSizeChange,
  onAddColumn, 
  onUpdateColumn, 
  onDeleteColumn,
  onAddPriority,
  onUpdatePriority,
  onDeletePriority,
  onAddAssignee,
  onDeleteAssignee,
  onRestoreDefaults
}) => {
  const { t } = useLanguage();
  
  // Columns State
  const [newColTitle, setNewColTitle] = useState('');
  const [newColColor, setNewColColor] = useState('#6366f1');

  // Priority State
  const [newPrioTitle, setNewPrioTitle] = useState('');
  const [newPrioColor, setNewPrioColor] = useState('#dbeafe');

  // Assignee State
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [newAssigneeEmail, setNewAssigneeEmail] = useState('');
  const [assigneeError, setAssigneeError] = useState('');
  
  // Restore State
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState('');

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColTitle.trim()) {
      onAddColumn(newColTitle, newColColor);
      setNewColTitle('');
    }
  };

  const handleAddPrioritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrioTitle.trim()) {
        onAddPriority(newPrioTitle, newPrioColor);
        setNewPrioTitle('');
    }
  };

  const handleAddAssigneeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssigneeError('');

    if (newAssigneeName.trim()) {
      if (newAssigneeEmail) {
          const exists = data.assignees.some(a => a.email === newAssigneeEmail);
          if (exists) {
              setAssigneeError('Este e-mail já está cadastrado.');
              return;
          }
      }

      onAddAssignee(newAssigneeName, newAssigneeEmail);
      setNewAssigneeName('');
      setNewAssigneeEmail('');
    }
  };

  const handleRestore = async () => {
      setIsRestoring(true);
      setRestoreSuccess('');
      try {
          await onRestoreDefaults();
          setRestoreSuccess(t('restoreSuccess'));
      } catch (e) {
          console.error(e);
      } finally {
          setIsRestoring(false);
      }
  };

  const sectionClass = "bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ring-1 ring-black/[0.02] dark:ring-white/[0.02]";
  const headerClass = "p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40";
  const inputClass = "w-full px-5 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium shadow-inner";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{t('projectSettings')}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-base mt-1">{t('customizeBoard')}</p>
      </div>

      {/* Font Size Management */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[1.2rem] shadow-sm"><Type size={22} /></div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-[11px]">Tamanho da Interface</h3>
          </div>
        </div>
        <div className="p-8">
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">Personalize a escala visual do aplicativo para o seu conforto.</p>
           <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-[1.5rem] w-fit shadow-inner">
              {(['sm', 'md', 'lg'] as const).map(size => (
                <button 
                  key={size} 
                  onClick={() => onFontSizeChange(size)} 
                  className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${fontSize === size ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xl' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {fontSize === size && <Check size={14} />}
                  {size === 'sm' ? 'Pequeno' : size === 'md' ? 'Médio' : 'Grande'}
                </button>
              ))}
           </div>
        </div>
      </section>

      {/* Category/Column Management */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-[1.2rem] shadow-sm"><Layers size={22} /></div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-[11px]">{t('boardCategories')}</h3>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {data.columnOrder.map(colId => {
               const col = data.columns[colId];
               return (
                 <div key={colId} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 group transition-all hover:border-indigo-300 dark:hover:border-indigo-900 hover:shadow-md">
                    <div className="relative">
                        <input 
                          type="color" 
                          value={col.color}
                          onChange={(e) => onUpdateColumn(colId, { color: e.target.value })}
                          className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent shrink-0 shadow-sm"
                        />
                    </div>
                    <input 
                      type="text" 
                      value={col.title}
                      onChange={(e) => onUpdateColumn(colId, { title: e.target.value })}
                      className="bg-transparent font-bold text-slate-800 dark:text-white outline-none border-b border-transparent focus:border-indigo-500 w-full text-sm py-1"
                    />
                    <button 
                      onClick={() => onDeleteColumn(colId)}
                      className="p-2.5 text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
               );
             })}
          </div>

          <form onSubmit={handleAddColumnSubmit} className="mt-8 p-6 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 flex flex-col sm:flex-row items-end gap-5">
             <div className="flex-1 w-full">
               <label className="block text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-2 ml-1">{t('newCategoryName')}</label>
               <input 
                 type="text" 
                 value={newColTitle}
                 onChange={(e) => setNewColTitle(e.target.value)}
                 className={inputClass}
                 required
               />
             </div>
             <div className="w-full sm:w-auto">
               <label className="block text-[10px] font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-2 ml-1">{t('colorTag')}</label>
               <div className="flex items-center gap-2 h-[52px] px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                 <input 
                   type="color" 
                   value={newColColor}
                   onChange={(e) => setNewColColor(e.target.value)}
                   className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                 />
               </div>
             </div>
             <button type="submit" className="h-[52px] w-full sm:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 text-[11px] uppercase tracking-widest glow-effect">
               <Plus size={20} />
               {t('addColumn')}
             </button>
          </form>
        </div>
      </section>

      {/* Priority Management */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-[1.2rem] shadow-sm"><Flag size={22} /></div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-[11px]">{t('managePriorities')}</h3>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {data.priorities.map(prio => (
                <div key={prio.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-amber-300 dark:hover:border-amber-900 hover:shadow-md transition-all">
                    <input 
                      type="color" 
                      value={prio.color}
                      onChange={(e) => onUpdatePriority(prio.id, { color: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border-none bg-transparent shrink-0 shadow-sm"
                    />
                    <input 
                        type="text" 
                        value={prio.title}
                        onChange={(e) => onUpdatePriority(prio.id, { title: e.target.value })}
                        className="bg-transparent font-bold text-slate-800 dark:text-white outline-none border-b border-transparent focus:border-amber-500 w-full text-sm py-1"
                    />
                    <button onClick={() => onDeletePriority(prio.id)} className="p-2.5 text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shrink-0">
                      <Trash2 size={18} />
                    </button>
                </div>
             ))}
           </div>

           <form onSubmit={handleAddPrioritySubmit} className="mt-8 p-6 bg-amber-50/30 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 flex flex-col sm:flex-row items-end gap-5">
             <div className="flex-1 w-full">
               <label className="block text-[10px] font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest mb-2 ml-1">{t('newPriorityName')}</label>
               <input 
                 type="text" 
                 value={newPrioTitle}
                 onChange={(e) => setNewPrioTitle(e.target.value)}
                 className={inputClass}
                 required
               />
             </div>
             <div className="w-full sm:w-auto">
               <label className="block text-[10px] font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest mb-2 ml-1">{t('colorTag')}</label>
               <div className="flex items-center gap-2 h-[52px] px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                 <input 
                   type="color" 
                   value={newPrioColor}
                   onChange={(e) => setNewPrioColor(e.target.value)}
                   className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                 />
               </div>
             </div>
             <button type="submit" className="h-[52px] w-full sm:w-auto px-8 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[11px] uppercase tracking-widest shadow-2xl shadow-amber-100 dark:shadow-none">
               <Plus size={20} />
               {t('addPriority')}
             </button>
          </form>
        </div>
      </section>

      {/* Restore Defaults */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-[1.2rem] shadow-sm"><RefreshCw size={22} /></div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] text-[11px]">{t('troubleshooting')}</h3>
          </div>
        </div>
        <div className="p-8">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">{t('restoreDefaultsDesc')}</p>
            
            <button 
                onClick={handleRestore}
                disabled={isRestoring}
                className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-black rounded-2xl flex items-center gap-3 transition-all disabled:opacity-50 text-[11px] uppercase tracking-widest shadow-sm"
            >
                <RefreshCw size={20} className={isRestoring ? 'animate-spin' : ''} />
                {isRestoring ? t('restoring') : t('restoreDefaults')}
            </button>

            {restoreSuccess && (
                <div className="mt-6 p-5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-2xl text-sm font-bold flex items-center gap-4 border border-emerald-100 dark:border-emerald-900/20 animate-in fade-in slide-in-from-top-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
                    {restoreSuccess}
                </div>
            )}
        </div>
      </section>

    </div>
  );
};