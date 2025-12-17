import React, { useState } from 'react';
import { Task, BoardData } from '../types';
import { Modal } from './Shared';
import { Trash2, AlertCircle, Settings } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { Link } from 'react-router-dom';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
  initialData?: Task;
  boardData?: BoardData;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData, boardData }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  // Use first priority as default if data is not loaded yet
  const defaultPriority = boardData?.priorities[0]?.id || '';
  const [priority, setPriority] = useState<string>(initialData?.priority || defaultPriority);
  
  const [status, setStatus] = useState<string>(initialData?.status || (boardData?.columnOrder[0] || ''));
  const [assigneeId, setAssigneeId] = useState(initialData?.assigneeId || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');

  const [validationError, setValidationError] = useState('');

  // Check if board configuration is missing
  const isConfigMissing = !boardData || boardData.columnOrder.length === 0 || boardData.priorities.length === 0;

  React.useEffect(() => {
    if (isOpen) {
        setTitle(initialData?.title || '');
        setDescription(initialData?.description || '');
        setPriority(initialData?.priority || (boardData?.priorities[0]?.id || ''));
        setStatus(initialData?.status || (boardData?.columnOrder[0] || ''));
        setAssigneeId(initialData?.assigneeId || '');
        setDueDate(initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
        setValidationError('');
    }
  }, [isOpen, initialData, boardData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (isConfigMissing) {
        setValidationError("Você precisa criar Categorias e Prioridades nas Configurações antes de criar uma tarefa.");
        return;
    }

    if (!status || !priority) {
        setValidationError("Status e Prioridade são obrigatórios.");
        return;
    }

    // Date Validation
    if (dueDate) {
        // Fix for timezone issues: Parse the YYYY-MM-DD string into local date components
        // This ensures we are comparing Local Midnight vs Local Midnight
        const [year, month, day] = dueDate.split('-').map(Number);
        const selectedDate = new Date(year, month - 1, day);
        selectedDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        // We allow selecting today, so we check if strict less than today
        if (selectedDate.getTime() < today.getTime()) {
            setValidationError(t('dateInPastError'));
            return;
        }
    }

    onSubmit({
      title,
      description,
      priority,
      status,
      assigneeId,
      dueDate: new Date(dueDate).toISOString(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
        onDelete(initialData.id);
        onClose();
    }
  }

  const assignees = boardData?.assignees || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? t('edit') : t('newTask')}>
      {isConfigMissing ? (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Configuração Incompleta</h3>
            <p className="text-slate-500">
                Seu quadro está vazio. Para criar tarefas, você precisa primeiro definir as <b>Categorias</b> (ex: A Fazer, Concluído) e as <b>Prioridades</b>.
            </p>
            <div className="flex gap-3 mt-4">
                <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">
                    Cancelar
                </button>
                <Link 
                    to="/settings" 
                    onClick={onClose}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                    <Settings size={18} />
                    Ir para Configurações
                </Link>
            </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {validationError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2 border border-red-100">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{validationError}</span>
            </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('title')}</label>
          <input
            required
            type="text"
            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Redesign Homepage"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('status')}</label>
            <select
              required
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {boardData?.columnOrder.map((colId) => (
                <option key={colId} value={colId}>{boardData.columns[colId].title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('priority')}</label>
            <select
              required
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {boardData?.priorities.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('dueDate')}</label>
          <input
            required
            type="date"
            className={`w-full px-3 py-2 bg-white text-slate-900 border rounded-lg outline-none ${validationError ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-slate-200'}`}
            value={dueDate}
            onChange={(e) => {
                setDueDate(e.target.value);
                setValidationError('');
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('assignee')}</label>
          <select
            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">{t('unassigned')}</option>
            {assignees.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('description')}</label>
          <textarea
            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add detailed notes here..."
          />
        </div>

        <div className="pt-2 flex justify-between items-center">
          {initialData && (
              <button 
                type="button" 
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded"
              >
                  <Trash2 size={16} /> {t('delete')}
              </button>
          )}
          <div className="flex justify-end gap-2 ml-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200">
                {initialData ? t('save') : t('create')}
            </button>
          </div>
        </div>
      </form>
      )}
    </Modal>
  );
};