
import React, { useState } from 'react';
import { BoardData } from '../types';
import { Plus, Trash2, RefreshCw, Palette, Layers, Flag, Type, Check, Users, Mail, UserPlus } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const SettingsView: React.FC<any> = ({ 
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
  const [restoring, setRestoring] = useState(false);
  const [newCol, setNewCol] = useState({ title: '', color: '#4f46e5' });
  const [newPrio, setNewPrio] = useState({ title: '', color: '#fee2e2' });
  const [newAssignee, setNewAssignee] = useState({ name: '', email: '' });

  const sectionClass = "bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 shadow-sm overflow-hidden mb-6";
  const headerClass = "p-3 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between";
  const inputClass = "px-3 py-1.5 bg-white dark:bg-slate-800 dark:text-white rounded border dark:border-slate-700 outline-none text-[11px] font-bold shadow-inner w-full focus:ring-1 focus:ring-indigo-500 transition-all";

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Gestão de Colunas */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-2">
            <Layers size={14} />
            <h3 className="text-[10px] font-black uppercase dark:text-white">Colunas do Kanban</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.columnOrder.map((id: string) => {
              const col = data.columns[id];
              return (
                <div key={id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-black/40 rounded-xl border dark:border-slate-800 group shadow-sm">
                   <input type="color" value={col.color} onChange={e => onUpdateColumn(id, {color: e.target.value})} className="w-5 h-5 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" />
                   <input value={col.title} onChange={e => onUpdateColumn(id, {title: e.target.value})} className="bg-transparent text-[11px] font-bold outline-none dark:text-white flex-1" />
                   <button onClick={() => onDeleteColumn(id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 p-2 border-2 border-dashed dark:border-slate-800 rounded-xl">
             <input type="color" value={newCol.color} onChange={e => setNewCol({...newCol, color: e.target.value})} className="w-5 h-5 rounded-full overflow-hidden" />
             <input placeholder="Nova Coluna..." value={newCol.title} onChange={e => setNewCol({...newCol, title: e.target.value})} className="flex-1 bg-transparent text-[11px] font-bold outline-none dark:text-white" />
             <button onClick={() => { if(newCol.title) onAddColumn(newCol.title, newCol.color); setNewCol({title:'', color:'#4f46e5'}); }} className="p-1.5 bg-indigo-600 text-white rounded-lg"><Plus size={14} /></button>
          </div>
        </div>
      </section>

      {/* Gestão de Prioridades */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-2">
            <Flag size={14} />
            <h3 className="text-[10px] font-black uppercase dark:text-white">Prioridades</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.priorities.map((prio: any) => (
              <div key={prio.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-black/40 rounded-xl border dark:border-slate-800 group shadow-sm">
                 <input type="color" value={prio.color} onChange={e => onUpdatePriority(prio.id, {color: e.target.value})} className="w-5 h-5 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" />
                 <input value={prio.title} onChange={e => onUpdatePriority(prio.id, {title: e.target.value})} className="bg-transparent text-[11px] font-bold outline-none dark:text-white flex-1" />
                 <button onClick={() => onDeletePriority(prio.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 p-2 border-2 border-dashed dark:border-slate-800 rounded-xl">
             <input type="color" value={newPrio.color} onChange={e => setNewPrio({...newPrio, color: e.target.value})} className="w-5 h-5 rounded-full overflow-hidden" />
             <input placeholder="Nova Prioridade..." value={newPrio.title} onChange={e => setNewPrio({...newPrio, title: e.target.value})} className="flex-1 bg-transparent text-[11px] font-bold outline-none dark:text-white" />
             <button onClick={() => { if(newPrio.title) onAddPriority(newPrio.title, newPrio.color); setNewPrio({title:'', color:'#fee2e2'}); }} className="p-1.5 bg-indigo-600 text-white rounded-lg"><Plus size={14} /></button>
          </div>
        </div>
      </section>

      {/* Gestão de Responsáveis */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-2">
            <Users size={14} />
            <h3 className="text-[10px] font-black uppercase dark:text-white">Equipe (Responsáveis)</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.assignees.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-black/40 rounded-xl border dark:border-slate-800 group shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xs">
                    {a.name.charAt(0)}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold dark:text-white truncate">{a.name}</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-500 truncate">{a.email}</p>
                 </div>
                 <button onClick={() => onDeleteAssignee(a.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="p-3 border-2 border-dashed dark:border-slate-800 rounded-xl space-y-2">
             <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                <input placeholder="Nome do integrante..." value={newAssignee.name} onChange={e => setNewAssignee({...newAssignee, name: e.target.value})} className="flex-1 bg-transparent text-[11px] font-bold outline-none dark:text-white" />
             </div>
             <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <input placeholder="Email (opcional)..." value={newAssignee.email} onChange={e => setNewAssignee({...newAssignee, email: e.target.value})} className="flex-1 bg-transparent text-[11px] font-bold outline-none dark:text-white" />
                <button onClick={() => { if(newAssignee.name) onAddAssignee(newAssignee.name, newAssignee.email); setNewAssignee({name:'', email:''}); }} className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition-all"><UserPlus size={14} /></button>
             </div>
          </div>
        </div>
      </section>

      {/* Ações do Sistema */}
      <section className={sectionClass}>
        <div className={headerClass}>
          <div className="flex items-center gap-2">
            <RefreshCw size={14} />
            <h3 className="text-[10px] font-black uppercase dark:text-white">Ações do Sistema</h3>
          </div>
        </div>
        <div className="p-4">
           <button 
             onClick={async() => { setRestoring(true); await onRestoreDefaults(); setRestoring(false); }} 
             disabled={restoring}
             className="w-full sm:w-auto px-6 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
           >
             {restoring ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
             {restoring ? 'Restaurando...' : 'Restaurar Padrões de Fábrica'}
           </button>
           <p className="mt-3 text-[9px] font-medium text-slate-400 leading-relaxed">
             Aviso: Restaurar padrões apagará todas as suas tarefas, colunas e prioridades personalizadas permanentemente.
           </p>
        </div>
      </section>
    </div>
  );
};
