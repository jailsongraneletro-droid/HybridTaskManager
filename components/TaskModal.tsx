import React, { useState } from 'react';
import { Task, BoardData } from '../types';
import { Modal } from './Shared';
import { Trash2, AlertCircle, Settings, Calendar as CalendarIcon } from 'lucide-react';
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
          // Se for uma data ISO (contém 'T')
          if (rawDate.includes('T')) {
            const dateObj = new Date(rawDate);
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const d = String(dateObj.getDate()).padStart(2, '0');
            setDueDate(`${y}-${m}-${d}`);
          } else {
            // Se já for YYYY-MM-DD
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
        
        // Só valida data no passado se for uma NOVA tarefa
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

  const inputClasses = "w-full px-3 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm placeholder-slate-400";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={(initialData as any)?.id ? t('edit') : t('newTask')}>
      {isConfigMissing ? (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Configuração Incompleta</h3>
            <div className="flex gap-3 mt-4">
                <Link to="/settings" onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">Configurações</Link>
            </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} className="shrink-0" /> <span>{validationError}</span>
            </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('title')}</label>
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('status')}</label>
            <select required className={inputClasses} value={status} onChange={(e) => setStatus(e.target.value)}>
              {boardData?.columnOrder.map((colId) => (
                <option key={colId} value={colId}>{boardData.columns[colId].title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('priority')}</label>
            <select required className={inputClasses} value={priority} onChange={(e) => setPriority(e.target.value)}>
              {boardData?.priorities.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('dueDate')}</label>
          <div className="relative group overflow-hidden rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
            <input
              required
              type="date"
              className="w-full pl-3 pr-12 py-2.5 bg-white text-slate-900 outline-none cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
              style={{ colorScheme: 'light' }}
              value={dueDate}
              onChange={(e) => {
                  setDueDate(e.target.value);
                  setValidationError('');
              }}
            />
            <div className="absolute right-0 top-0 bottom-0 px-3 flex items-center bg-slate-50 border-l border-slate-100 text-slate-400 group-focus-within:text-indigo-600 group-focus-within:bg-indigo-50 transition-all pointer-events-none">
                <CalendarIcon size={18} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('assignee')}</label>
          <select className={inputClasses} value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">{t('unassigned')}</option>
            {boardData?.assignees.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('description')}</label>
          <textarea className={`${inputClasses} min-h-[100px] resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes adicionais da tarefa..." />
        </div>

        <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-2">
          {(initialData as any)?.id && (
              <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-bold flex items-center gap-1.5 hover:bg-red-50 px-3 py-2 rounded-xl transition-all">
                <Trash2 size={16} /> {t('delete')}
              </button>
          )}
          <div className="flex justify-end gap-3 ml-auto">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                {(initialData as any)?.id ? t('save') : t('create')}
            </button>
          </div>
        </div>
      </form>
      )}
    </Modal>
  );
};