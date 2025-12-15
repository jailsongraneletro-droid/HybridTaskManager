import React, { useState } from 'react';
import { BoardData, Assignee } from '../types';
import { Plus, Trash2, User, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface SettingsViewProps {
  data: BoardData;
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
      // Basic duplicate check
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{t('projectSettings')}</h2>
        <p className="text-slate-500">{t('customizeBoard')}</p>
      </div>

      {/* Category/Column Management */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-800">{t('boardCategories')}</h3>
          <span className="text-xs text-slate-400">{t('manageWorkflow')}</span>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
             {data.columnOrder.map(colId => {
               const col = data.columns[colId];
               return (
                 <div key={colId} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 group">
                    <input 
                      type="color" 
                      value={col.color}
                      onChange={(e) => onUpdateColumn(colId, { color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                    />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={col.title}
                        onChange={(e) => onUpdateColumn(colId, { title: e.target.value })}
                        className="bg-transparent font-medium text-slate-700 outline-none border-b border-transparent focus:border-indigo-500 w-full"
                      />
                    </div>
                    <button 
                      onClick={() => onDeleteColumn(colId)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
               );
             })}
          </div>

          <form onSubmit={handleAddColumnSubmit} className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-end gap-4">
             <div className="flex-1">
               <label className="block text-xs font-semibold text-indigo-900 mb-1">{t('newCategoryName')}</label>
               <input 
                 type="text" 
                 value={newColTitle}
                 onChange={(e) => setNewColTitle(e.target.value)}
                 className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                 required
               />
             </div>
             <div>
               <label className="block text-xs font-semibold text-indigo-900 mb-1">{t('colorTag')}</label>
               <div className="flex items-center gap-2 h-[42px] px-3 bg-white rounded-lg border border-indigo-200">
                 <input 
                   type="color" 
                   value={newColColor}
                   onChange={(e) => setNewColColor(e.target.value)}
                   className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                 />
               </div>
             </div>
             <button type="submit" className="h-[42px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm shadow-indigo-200">
               <Plus size={18} />
               {t('addColumn')}
             </button>
          </form>
        </div>
      </section>

      {/* Priority Management */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-800">{t('managePriorities')}</h3>
        </div>
        
        <div className="p-6 space-y-6">
           <div className="space-y-3">
             {data.priorities.map(prio => (
                <div key={prio.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <input 
                      type="color" 
                      value={prio.color}
                      onChange={(e) => onUpdatePriority(prio.id, { color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                    />
                    <div className="flex-1">
                        <input 
                          type="text" 
                          value={prio.title}
                          onChange={(e) => onUpdatePriority(prio.id, { title: e.target.value })}
                          className="bg-transparent font-medium text-slate-700 outline-none border-b border-transparent focus:border-indigo-500 w-full"
                        />
                    </div>
                    <button onClick={() => onDeletePriority(prio.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                </div>
             ))}
           </div>

           <form onSubmit={handleAddPrioritySubmit} className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-end gap-4">
             <div className="flex-1">
               <label className="block text-xs font-semibold text-indigo-900 mb-1">{t('newPriorityName')}</label>
               <input 
                 type="text" 
                 value={newPrioTitle}
                 onChange={(e) => setNewPrioTitle(e.target.value)}
                 className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                 required
               />
             </div>
             <div>
               <label className="block text-xs font-semibold text-indigo-900 mb-1">{t('colorTag')}</label>
               <div className="flex items-center gap-2 h-[42px] px-3 bg-white rounded-lg border border-indigo-200">
                 <input 
                   type="color" 
                   value={newPrioColor}
                   onChange={(e) => setNewPrioColor(e.target.value)}
                   className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                 />
               </div>
             </div>
             <button type="submit" className="h-[42px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm shadow-indigo-200">
               <Plus size={18} />
               {t('addPriority')}
             </button>
          </form>
        </div>
      </section>

      {/* Assignee Management (NEW) */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-800">Gerenciar Responsáveis</h3>
          <span className="text-xs text-slate-400">Adicione pessoas ao seu quadro</span>
        </div>
        
        <div className="p-6 space-y-6">
           {assigneeError && (
               <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                   <AlertCircle size={16} />
                   {assigneeError}
               </div>
           )}

           <div className="space-y-3">
             {data.assignees.map(a => (
                <div key={a.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full border border-slate-200" />
                    <div className="flex-1">
                        <p className="font-medium text-slate-800">{a.name}</p>
                        <p className="text-xs text-slate-500">{a.email}</p>
                    </div>
                    <button onClick={() => onDeleteAssignee(a.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                </div>
             ))}
           </div>

           <form onSubmit={handleAddAssigneeSubmit} className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-end gap-4">
             <div className="flex-1">
               <label className="block text-xs font-semibold text-indigo-900 mb-1">{t('name')}</label>
               <input 
                 type="text" 
                 value={newAssigneeName}
                 onChange={(e) => setNewAssigneeName(e.target.value)}
                 className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="Ex: João Silva"
                 required
               />
             </div>
             <div className="flex-1">
               <label className="block text-xs font-semibold text-indigo-900 mb-1">{t('email')}</label>
               <input 
                 type="email" 
                 value={newAssigneeEmail}
                 onChange={(e) => {
                     setNewAssigneeEmail(e.target.value);
                     setAssigneeError('');
                 }}
                 className={`w-full px-3 py-2 bg-white text-slate-900 rounded-lg border outline-none ${assigneeError ? 'border-red-300 focus:ring-red-200' : 'border-indigo-200 focus:ring-indigo-500 focus:ring-2'}`}
                 placeholder="Opcional"
               />
             </div>
             <button type="submit" className="h-[42px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm shadow-indigo-200">
               <Plus size={18} />
               Adicionar
             </button>
          </form>
        </div>
      </section>

      {/* Restore Defaults (Troubleshooting) */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-800">{t('troubleshooting')}</h3>
        </div>
        <div className="p-6">
            <p className="text-sm text-slate-500 mb-4">{t('restoreDefaultsDesc')}</p>
            
            <button 
                onClick={handleRestore}
                disabled={isRestoring}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
                <RefreshCw size={18} className={isRestoring ? 'animate-spin' : ''} />
                {isRestoring ? t('restoring') : t('restoreDefaults')}
            </button>

            {restoreSuccess && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2 border border-green-100 animate-in fade-in">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    {restoreSuccess}
                </div>
            )}
        </div>
      </section>

    </div>
  );
};