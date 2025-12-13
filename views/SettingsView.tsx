import React, { useState } from 'react';
import { BoardData } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface SettingsViewProps {
  data: BoardData;
  onAddColumn: (title: string, color: string) => void;
  onUpdateColumn: (id: string, updates: any) => void;
  onDeleteColumn: (id: string) => void;
  onAddPriority: (title: string, color: string) => void;
  onUpdatePriority: (id: string, updates: any) => void;
  onDeletePriority: (id: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  data, 
  onAddColumn, 
  onUpdateColumn, 
  onDeleteColumn,
  onAddPriority,
  onUpdatePriority,
  onDeletePriority
}) => {
  const { t } = useLanguage();
  
  // Columns State
  const [newColTitle, setNewColTitle] = useState('');
  const [newColColor, setNewColColor] = useState('#6366f1');

  // Priority State
  const [newPrioTitle, setNewPrioTitle] = useState('');
  const [newPrioColor, setNewPrioColor] = useState('#dbeafe');
  
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
          
          {/* List existing columns */}
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
                      title="Change Color"
                    />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={col.title}
                        onChange={(e) => onUpdateColumn(colId, { title: e.target.value })}
                        className="bg-transparent font-medium text-slate-700 outline-none border-b border-transparent focus:border-indigo-500 w-full"
                      />
                      <p className="text-xs text-slate-400 mt-1">{col.taskIds.length} tasks</p>
                    </div>
                    <button 
                      onClick={() => onDeleteColumn(colId)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('deleteCategory')}
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
               );
             })}
          </div>

          {/* Add New Column */}
          <form onSubmit={handleAddColumnSubmit} className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-end gap-4">
             <div className="flex-1">
               <label className="block text-xs font-semibold text-indigo-900 mb-1">{t('newCategoryName')}</label>
               <input 
                 type="text" 
                 value={newColTitle}
                 onChange={(e) => setNewColTitle(e.target.value)}
                 className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="e.g. In Review, Testing, Backlog"
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
             <button 
               type="submit"
               className="h-[42px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm shadow-indigo-200"
             >
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
          <span className="text-xs text-slate-400">{t('managePrioritiesDesc')}</span>
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
                      title="Change Color"
                    />
                    <div className="flex-1">
                        <input 
                          type="text" 
                          value={prio.title}
                          onChange={(e) => onUpdatePriority(prio.id, { title: e.target.value })}
                          className="bg-transparent font-medium text-slate-700 outline-none border-b border-transparent focus:border-indigo-500 w-full"
                        />
                    </div>
                    <button 
                      onClick={() => onDeletePriority(prio.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('deletePriority')}
                    >
                      <Trash2 size={18} />
                    </button>
                </div>
             ))}
           </div>

           {/* Add New Priority */}
           <form onSubmit={handleAddPrioritySubmit} className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-end gap-4">
             <div className="flex-1">
               <label className="block text-xs font-semibold text-indigo-900 mb-1">{t('newPriorityName')}</label>
               <input 
                 type="text" 
                 value={newPrioTitle}
                 onChange={(e) => setNewPrioTitle(e.target.value)}
                 className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="e.g. Critical, Optional"
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
             <button 
               type="submit"
               className="h-[42px] px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm shadow-indigo-200"
             >
               <Plus size={18} />
               {t('addPriority')}
             </button>
          </form>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-lg text-slate-800 mb-4">{t('permissions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg">
             <strong className="block text-slate-800 mb-1">Read / View</strong>
             Access Dashboard, Board, and Table views. All team members can view all tasks.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
             <strong className="block text-slate-800 mb-1">Create</strong>
             Add new tasks using the "+" button in the top bar or "New Task" in columns.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
             <strong className="block text-slate-800 mb-1">Edit</strong>
             Click on any task card or row to open the edit modal. You can modify descriptions, assignees, and dates.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
             <strong className="block text-slate-800 mb-1">Delete</strong>
             Use the trash icon in the edit modal or list view. Deleting a category deletes all tasks within it.
          </div>
        </div>
      </section>

    </div>
  );
};