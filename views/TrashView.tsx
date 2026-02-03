import React, { useEffect, useMemo, useState } from 'react';
import { Task } from '../types';
import { DataService } from '../services/dataService';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

interface TrashViewProps {
  onUpdate: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({ onUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrash = async () => {
    setLoading(true);
    setError(null);
    const user = await DataService.getCurrentUser();
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      const items = await DataService.fetchTrashTasks(user.id);
      setTasks(items);
    } catch (e) {
      setError('Não foi possível carregar a lixeira.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (taskId: string) => {
    await DataService.restoreTask(taskId);
    await loadTrash();
    onUpdate();
  };

  const handleDeleteForever = async (taskId: string) => {
    const confirmed = window.confirm('Excluir permanentemente esta tarefa?');
    if (!confirmed) return;
    await DataService.deleteTaskPermanently(taskId);
    await loadTrash();
  };

  const handleEmptyTrash = async () => {
    const confirmed = window.confirm('Esvaziar a lixeira? Esta ação é permanente.');
    if (!confirmed) return;
    const user = await DataService.getCurrentUser();
    if (!user) return;
    await DataService.emptyTrash(user.id);
    await loadTrash();
  };

  const withMeta = useMemo(() => {
    return tasks.map(task => {
      const deletedAt = task.deletedAt ? new Date(task.deletedAt) : null;
      const days = deletedAt ? Math.floor((Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const daysLeft = Math.max(0, 30 - days);
      return { task, deletedAt, daysLeft };
    });
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest dark:text-white">Lixeira</h2>
          <p className="text-[10px] text-slate-400">Itens ficam por até 30 dias e são removidos automaticamente.</p>
        </div>
        <button
          onClick={handleEmptyTrash}
          className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1"
        >
          <Trash2 size={12} /> Esvaziar
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center text-[10px] text-slate-400">Carregando lixeira...</div>
      ) : error ? (
        <div className="p-6 text-center text-[10px] text-red-500 border border-red-200 dark:border-red-900/50 rounded-2xl">
          {error}
        </div>
      ) : withMeta.length === 0 ? (
        <div className="p-10 text-center text-slate-400 text-[10px] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          Lixeira vazia
        </div>
      ) : (
        <div className="space-y-2">
          {withMeta.map(({ task, deletedAt, daysLeft }) => (
            <div key={task.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1d21] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate">{task.title}</p>
                <div className="text-[9px] text-slate-400 flex items-center gap-2 mt-1">
                  <span>Excluída em: {deletedAt ? deletedAt.toLocaleDateString('pt-BR') : '-'}</span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500"><AlertTriangle size={10} /> {daysLeft} dias restantes</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRestore(task.id)}
                  className="px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Restaurar
                </button>
                <button
                  onClick={() => handleDeleteForever(task.id)}
                  className="px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};