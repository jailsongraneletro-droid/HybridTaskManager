import React, { useState } from 'react';
import { BoardData } from '../types';
import { Plus, Trash2, AlertCircle, RefreshCw, Palette, Layers, Flag, Users, Type } from 'lucide-react';
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

  const sectionClass = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden";
  const headerClass = "p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50";
  const inputClass = "w-full px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{t('projectSettings')}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('customizeBoard')}</p>
      </div>

      {/* Font Size Management */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><Type size={20} /></div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px]">Tamanho da Fonte</h3>
          </div>
        </div>
        <div className="p-6">
           <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">Ajuste o tamanho do texto para melhor leitura em todo o aplicativo.</p>
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
              {(['sm', 'md', 'lg'] as const).map(size => (
                <button 
                  key={size} 
                  onClick={() => onFontSizeChange(size)} 
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${fontSize === size ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {size === 'sm' ? 'Pequeno' : size === 'md' ? 'Médio' : 'Grande'}
                </button>
              ))}
           </div>
        </div>
      </section>

      {/* Category/Column Management */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><Layers size={20} /></div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px]">{t('boardCategories')}</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('manageWorkflow')}</span>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {data.columnOrder.map(colId => {
               const col = data.columns[colId];
               return (
                 <div key={colId} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 group transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
                    <input 
                      type="color" 
                      value={col.color}
                      onChange={(e) => onUpdateColumn(colId, { color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <input 
                      type="text" 
                      value={col.title}
                      onChange={(e) => onUpdateColumn(colId, { title: e.target.value })}
                      className="bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none border-b border-transparent focus:border-indigo-500 w-full text-xs"
                    />
                    <button 
                      onClick={() => onDeleteColumn(colId)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
               );
             })}
          </div>

          <form onSubmit={handleAddColumnSubmit} className="mt-4 p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-end gap-4">
             <div className="flex-1 w-full">
               <label className="block text-[9px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-1.5 ml-1">{t('newCategoryName')}</label>
               <input 
                 type="text" 
                 value={newColTitle}
                 onChange={(e) => setNewColTitle(e.target.value)}
                 className={inputClass}
                 required
               />
             </div>
             <div className="w-full sm:w-auto">
               <label className="block text-[9px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-1.5 ml-1">{t('colorTag')}</label>
               <div className="flex items-center gap-2 h-[46px] px-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                 <input 
                   type="color" 
                   value={newColColor}
                   onChange={(e) => setNewColColor(e.target.value)}
                   className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                 />
               </div>
             </div>
             <button type="submit" className="h-[46px] w-full sm:w-auto px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 text-[10px] uppercase tracking-widest">
               <Plus size={18} />
               {t('addColumn')}
             </button>
          </form>
        </div>
      </section>

      {/* Priority Management */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><Flag size={20} /></div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px]">{t('managePriorities')}</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {data.priorities.map(prio => (
                <div key={prio.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 group hover:border-amber-200 dark:hover:border-amber-900 transition-all">
                    <input 
                      type="color" 
                      value={prio.color}
                      onChange={(e) => onUpdatePriority(prio.id, { color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <input 
                        type="text" 
                        value={prio.title}
                        onChange={(e) => onUpdatePriority(prio.id, { title: e.target.value })}
                        className="bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none border-b border-transparent focus:border-amber-500 w-full text-xs"
                    />
                    <button onClick={() => onDeletePriority(prio.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                </div>
             ))}
           </div>

           <form onSubmit={handleAddPrioritySubmit} className="mt-4 p-5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 flex flex-col sm:flex-row items-end gap-4">
             <div className="flex-1 w-full">
               <label className="block text-[9px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest mb-1.5 ml-1">{t('newPriorityName')}</label>
               <input 
                 type="text" 
                 value={newPrioTitle}
                 onChange={(e) => setNewPrioTitle(e.target.value)}
                 className={inputClass}
                 required
               />
             </div>
             <div className="w-full sm:w-auto">
               <label className="block text-[9px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest mb-1.5 ml-1">{t('colorTag')}</label>
               <div className="flex items-center gap-2 h-[46px] px-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                 <input 
                   type="color" 
                   value={newPrioColor}
                   onChange={(e) => setNewPrioColor(e.target.value)}
                   className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                 />
               </div>
             </div>
             <button type="submit" className="h-[46px] w-full sm:w-auto px-6 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-[10px] uppercase tracking-widest shadow-xl shadow-amber-100 dark:shadow-none">
               <Plus size={18} />
               {t('addPriority')}
             </button>
          </form>
        </div>
      </section>

      {/* Assignee Management */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Users size={20} /></div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px]">Gerenciar Responsáveis</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
           {assigneeError && (
               <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs font-bold border border-red-100 dark:border-red-900/40 animate-in shake">
                   <AlertCircle size={16} />
                   {assigneeError}
               </div>
           )}

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {data.assignees.map(a => (
                <div key={a.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all hover:border-emerald-200 dark:hover:border-emerald-900">
                    <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" />
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-800 dark:text-slate-100 text-xs truncate">{a.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold truncate">{a.email}</p>
                    </div>
                    <button onClick={() => onDeleteAssignee(a.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                </div>
             ))}
           </div>

           <form onSubmit={handleAddAssigneeSubmit} className="mt-4 p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex flex-col sm:flex-row items-end gap-4">
             <div className="flex-1 w-full">
               <label className="block text-[9px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest mb-1.5 ml-1">{t('name')}</label>
               <input 
                 type="text" 
                 value={newAssigneeName}
                 onChange={(e) => setNewAssigneeName(e.target.value)}
                 className={inputClass}
                 placeholder="Ex: João Silva"
                 required
               />
             </div>
             <div className="flex-1 w-full">
               <label className="block text-[9px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest mb-1.5 ml-1">{t('email')}</label>
               <input 
                 type="email" 
                 value={newAssigneeEmail}
                 onChange={(e) => {
                     setNewAssigneeEmail(e.target.value);
                     setAssigneeError('');
                 }}
                 className={inputClass}
                 placeholder="Opcional"
               />
             </div>
             <button type="submit" className="h-[46px] w-full sm:w-auto px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-100 dark:shadow-none">
               <Plus size={18} />
               Adicionar
             </button>
          </form>
        </div>
      </section>

      {/* Restore Defaults */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl"><RefreshCw size={20} /></div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-[10px]">{t('troubleshooting')}</h3>
          </div>
        </div>
        <div className="p-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">{t('restoreDefaultsDesc')}</p>
            
            <button 
                onClick={handleRestore}
                disabled={isRestoring}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-black rounded-xl flex items-center gap-3 transition-all disabled:opacity-50 text-[10px] uppercase tracking-widest"
            >
                <RefreshCw size={18} className={isRestoring ? 'animate-spin' : ''} />
                {isRestoring ? t('restoring') : t('restoreDefaults')}
            </button>

            {restoreSuccess && (
                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-3 border border-emerald-100 dark:border-emerald-900/40 animate-in fade-in">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    {restoreSuccess}
                </div>
            )}
        </div>
      </section>

    </div>
  );
};