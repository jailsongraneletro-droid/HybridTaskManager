import React, { useState } from 'react';
import { Task, BoardData } from '../types';
import { Modal } from './Shared';
import { Trash2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
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

    if (isConfigMissing) {
        setValidationError("Configurações incompletas.");
        return;
    }

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

    onSubmit({
      title,
      description,
      priority,
      status,
      assigneeId,
      dueDate: finalDueDate,
    });
    onClose();
  };

  const handleDelete = () => {
    if (initialData && (initialData as any).id && onDelete) {
        onDelete((initialData as any).id);
        onClose();
    }
  }

  // Corrigido bg e text para modo dark
  const inputClasses = "w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm placeholder-slate-400 dark:placeholder-slate-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={(initialData as any)?.id ? t('edit') : t('newTask')}>
      {isConfigMissing ? (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertCircle size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">Configuração Incompleta</h3>
            <p className="text-slate-500 dark:text-slate-400">Você precisa de pelo menos uma categoria e uma prioridade configuradas.</p>
            <Link to="/settings" onClick={onClose} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40">Ir para Configurações</Link>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        {validationError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={18} className="shrink-0" /> <span className="font-bold">{validationError}</span>
            </div>
        )}

        <div>
          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('title')}</label>
          <input
            required
            type="text"
            className={inputClasses}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Finalizar relatório de vendas"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('status')}</label>
            <select required className={inputClasses} value={status} onChange={(e) => setStatus(e.target.value)}>
              {boardData?.columnOrder.map((colId) => (
                <option key={colId} value={colId} className="dark:bg-slate-800">{boardData.columns[colId].title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('priority')}</label>
            <select required className={inputClasses} value={priority} onChange={(e) => setPriority(e.target.value)}>
              {boardData?.priorities.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-slate-800">{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('dueDate')}</label>
          <div className="relative group rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm bg-white dark:bg-slate-800">
            <input
              required
              type="date"
              className="w-full pl-4 pr-12 py-3 bg-transparent text-slate-900 dark:text-slate-100 outline-none cursor-pointer relative z-10"
              style={{ colorScheme: 'dark' }}
              value={dueDate}
              onChange={(e) => {
                  setDueDate(e.target.value);
                  setValidationError('');
              }}
            />
            <div className="absolute right-0 top-0 bottom-0 px-4 flex items-center bg-slate-50 dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 text-slate-400 group-focus-within:text-indigo-600 transition-all z-0">
                <CalendarIcon size={18} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('assignee')}</label>
          <select className={inputClasses} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="" className="dark:bg-slate-800">{t('unassigned')}</option>
            {boardData?.assignees.map(user => (
              <option key={user.id} value={user.id} className="dark:bg-slate-800">{user.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">{t('description')}</label>
          <textarea className={`${inputClasses} min-h-[120px] resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes adicionais da tarefa..." />
        </div>

        <div className="pt-6 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
          {(initialData as any)?.id && (
              <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-black flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2.5 rounded-xl transition-all">
                <Trash2 size={18} /> {t('delete')}
              </button>
          )}
          <div className="flex justify-end gap-4 ml-auto">
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">{t('cancel')}</button>
            <button type="submit" className="px-8 py-3 text-sm font-black bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 active:scale-95 transition-all glow-effect">
                {(initialData as any)?.id ? t('save') : t('create')}
            </button>
          </div>
        </div>
      </form>
      )}
    </Modal>
  );
};