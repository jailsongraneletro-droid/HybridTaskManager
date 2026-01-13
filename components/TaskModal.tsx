import React, { useState } from 'react';
import { Task, BoardData } from '../types';
import { Modal } from './Shared';
import { Trash2, AlertCircle, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { Link } from 'react-router-dom';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
  initialData?: Task | Partial<Task>;
  boardData?: BoardData;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData, boardData }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const isConfigMissing = !boardData || boardData.columnOrder.length === 0 || boardData.priorities.length === 0;

  React.useEffect(() => {
    if (isOpen) {
        setTitle(initialData?.title || '');
        setDescription(initialData?.description || '');
        setPriority(initialData?.priority || (boardData?.priorities[0]?.id || ''));
        setStatus(initialData?.status || (boardData?.columnOrder[0] || ''));
        setAssigneeId(initialData?.assigneeId || '');
        
        if (initialData?.dueDate) {
          const rawDate = initialData.dueDate;
          if (rawDate.includes('T')) {
            const dateObj = new Date(rawDate);
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            setDueDate(`${y}-${m}-${d}`);
          } else {
            setDueDate(rawDate);
          }
        } else {
          setDueDate('');
        }
        setValidationError('');
    }
  }, [isOpen, initialData, boardData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    if (isConfigMissing) return;

    if (dueDate) {
        const [year, month, day] = dueDate.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        if (selectedDate.getTime() < today.getTime() && !(initialData as any)?.id) {
            setValidationError(t('dateInPastError'));
            return;
        }
    }

    const finalDueDate = dueDate ? new Date(dueDate + 'T12:00:00').toISOString() : new Date().toISOString();
    onSubmit({ title, description, priority, status, assigneeId, dueDate: finalDueDate });
    onClose();
  };

  const inputClasses = "w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-xs placeholder-slate-400";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={(initialData as any)?.id ? t('edit') : t('newTask')}>
      {isConfigMissing ? (
        <div className="p-6 text-center space-y-4">
            <h3 className="text-base font-black dark:text-white">Configuração Incompleta</h3>
            <Link to="/settings" onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold inline-block">Configurar Quadro</Link>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] p-3 rounded-xl border border-red-100 flex items-center gap-2">
                <AlertCircle size={14} /> <span className="font-bold">{validationError}</span>
            </div>
        )}

        <div>
          <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('title')}</label>
          <input required type="text" className={inputClasses} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da tarefa" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('status')}</label>
            <select required className={inputClasses} value={status} onChange={(e) => setStatus(e.target.value)}>
              {boardData?.columnOrder.map((colId) => (
                <option key={colId} value={colId}>{boardData.columns[colId].title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('priority')}</label>
            <select required className={inputClasses} value={priority} onChange={(e) => setPriority(e.target.value)}>
              {boardData?.priorities.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div>
            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('assignee')}</label>
            <div className="relative">
                <select className={`${inputClasses} pl-8`} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">{t('unassigned')}</option>
                {boardData?.assignees.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                ))}
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><UserIcon size={14} /></div>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('dueDate')}</label>
            <div className="relative group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <input required type="date" className="w-full pl-3 pr-10 py-2 bg-transparent text-slate-900 dark:text-slate-100 outline-none text-xs relative z-10" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-0"><CalendarIcon size={14} /></div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('description')}</label>
          <textarea className={`${inputClasses} min-h-[80px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800/50">
          {(initialData as any)?.id ? (
            <button type="button" onClick={() => onDelete?.((initialData as any).id)} className="text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl hover:bg-red-50 transition-all flex items-center gap-1.5"><Trash2 size={12} /> {t('delete')}</button>
          ) : <div></div>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-xl transition-all">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg active:scale-95 transition-all glow-effect">
                {(initialData as any)?.id ? t('save') : t('create')}
            </button>
          </div>
        </div>
      </form>
      )}
    </Modal>
  );
};