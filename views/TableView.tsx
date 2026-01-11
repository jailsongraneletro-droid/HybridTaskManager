import React, { useState, useMemo } from 'react';
import { BoardData, Task } from '../types';
import { PriorityBadge, StatusBadge, Avatar, TaskAge } from '../components/Shared';
import { ArrowUpDown, Search, Trash2, Edit, GripVertical, Settings2, Eye, EyeOff, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useLanguage } from '../utils/i18n';

interface TableViewProps {
  data: BoardData;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

type ColumnId = keyof Task | 'taskAge' | 'actions';
type GroupByOption = 'none' | 'status' | 'priority' | 'assigneeId';

interface ColumnDef {
  id: ColumnId;
  labelKey: string;
  width: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { id: 'title', labelKey: 'title', width: '2fr' },
  { id: 'status', labelKey: 'status', width: '1fr' },
  { id: 'priority', labelKey: 'priority', width: '1fr' },
  { id: 'assigneeId', labelKey: 'assignee', width: '1.2fr' },
  { id: 'dueDate', labelKey: 'dueDate', width: '1fr' },
  { id: 'taskAge', labelKey: 'taskAge', width: '1fr' },
  { id: 'actions', labelKey: 'actions', width: '100px' }
];

interface TaskRowProps {
  task: Task;
  visibleColumns: ColumnId[];
  gridTemplate: string;
  data: BoardData;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  t: (key: any) => string;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, visibleColumns, gridTemplate, data, onEditTask, onDeleteTask, t }) => {
  const assignee = data.assignees.find(a => a.id === task.assigneeId);
  const statusColumn = data.columns[task.status];
  const priorityData = data.priorities.find(p => p.id === task.priority);

  return (
    <div 
      className="grid hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group items-center border-b border-slate-100 dark:border-slate-800 last:border-0"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {visibleColumns.map(colId => (
        <div key={colId} className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 truncate">
          {colId === 'title' && (
              <span 
                className="font-bold text-slate-800 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                onClick={() => onEditTask(task)}
              >
                {task.title}
              </span>
          )}
          
          {colId === 'status' && (
            <StatusBadge status={statusColumn?.title || task.status} color={statusColumn?.color} />
          )}
          
          {colId === 'priority' && (
            <PriorityBadge priority={priorityData} />
          )}
          
          {colId === 'assigneeId' && (
            assignee ? (
              <div className="flex items-center gap-2">
                  <Avatar url={assignee.avatar} name={assignee.name} />
                  <span className="truncate">{assignee.name}</span>
              </div>
            ) : <span className="text-slate-400 dark:text-slate-600 italic">{t('unassigned')}</span>
          )}
          
          {colId === 'dueDate' && new Date(task.dueDate).toLocaleDateString()}
          
          {colId === 'taskAge' && <TaskAge createdAt={task.createdAt} />}
          
          {colId === 'actions' && (
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEditTask(task)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                title={t('edit')}
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                title={t('delete')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const TableView: React.FC<TableViewProps> = ({ data, onEditTask, onDeleteTask }) => {
  const { t } = useLanguage();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>(null);
  const [filter, setFilter] = useState('');
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(ALL_COLUMNS.map(c => c.id));
  const [hiddenColumns, setHiddenColumns] = useState<ColumnId[]>([]);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const allTasks = Object.values(data.tasks) as Task[];

  const sortedAndFilteredTasks = useMemo(() => {
    let tasks = [...allTasks];
    if (filter) tasks = tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()));
    if (sortConfig) {
      tasks.sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key]! > b[sortConfig.key]!) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return tasks;
  }, [allTasks, filter, sortConfig]);

  const groupedTasks = useMemo((): Record<string, Task[]> => {
    if (groupBy === 'none') return { 'all': sortedAndFilteredTasks };
    return sortedAndFilteredTasks.reduce((groups, task) => {
        let keyVal = task[groupBy as keyof Task];
        const key = (typeof keyVal === 'string' ? keyVal : undefined) || 'unassigned';
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
        return groups;
    }, {} as Record<string, Task[]>);
  }, [sortedAndFilteredTasks, groupBy]);

  const getGroupTitle = (key: string) => {
      if (key === 'unassigned') return t('unassigned');
      if (groupBy === 'status') return data.columns[key]?.title || key;
      if (groupBy === 'priority') return data.priorities.find(p => p.id === key)?.title || key;
      if (groupBy === 'assigneeId') return data.assignees.find(a => a.id === key)?.name || t('unassigned');
      return key;
  };

  const visibleColumns = columnOrder.filter(id => !hiddenColumns.includes(id));
  const gridTemplate = visibleColumns.map(id => ALL_COLUMNS.find(c => c.id === id)?.width || '1fr').join(' ');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full relative">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
         <div className="flex items-center gap-4">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
           </div>
           
           <div className="relative">
             <button 
               onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
               className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg text-sm transition-colors ${groupBy !== 'none' ? 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
               <Layers size={16} />
               <span>{t('groupBy')}</span>
               <ChevronDown size={14} className="opacity-50" />
             </button>
             {isGroupMenuOpen && (
               <>
                 <div className="fixed inset-0 z-20" onClick={() => setIsGroupMenuOpen(false)}></div>
                 <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <button onClick={() => { setGroupBy('none'); setIsGroupMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${groupBy === 'none' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{t('groupByNone')}</button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                    <button onClick={() => { setGroupBy('status'); setIsGroupMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${groupBy === 'status' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{t('groupByStatus')}</button>
                    <button onClick={() => { setGroupBy('priority'); setIsGroupMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${groupBy === 'priority' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{t('groupByPriority')}</button>
                    <button onClick={() => { setGroupBy('assigneeId'); setIsGroupMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${groupBy === 'assigneeId' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{t('groupByAssignee')}</button>
                 </div>
               </>
             )}
           </div>

           <div className="relative">
             <button onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"><Settings2 size={16} />{t('columns')}</button>
             {isColumnMenuOpen && (
               <>
                 <div className="fixed inset-0 z-20" onClick={() => setIsColumnMenuOpen(false)}></div>
                 <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                   <h4 className="text-xs font-semibold text-slate-400 uppercase px-3 py-2">{t('manageColumns')}</h4>
                   <div className="space-y-1">
                     {ALL_COLUMNS.map(col => (
                       <button key={col.id} onClick={() => setHiddenColumns(prev => prev.includes(col.id) ? prev.filter(id => id !== col.id) : [...prev, col.id])} className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                         <span>{t(col.labelKey as any)}</span>
                         {hiddenColumns.includes(col.id) ? <EyeOff size={14} className="text-slate-400"/> : <Eye size={14} className="text-indigo-500"/>}
                       </button>
                     ))}
                   </div>
                 </div>
               </>
             )}
           </div>
         </div>
         <span className="text-sm text-slate-500 dark:text-slate-500">{sortedAndFilteredTasks.length} {t('tasksFound')}</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <div className="grid bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10" style={{ gridTemplateColumns: gridTemplate }}>
            {visibleColumns.map((colId) => {
              const colDef = ALL_COLUMNS.find(c => c.id === colId)!;
              return (
                <div key={colId} className="px-4 py-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   {t(colDef.labelKey as any)}
                   {colId !== 'actions' && colId !== 'taskAge' && <ArrowUpDown size={12} className="opacity-30" />}
                </div>
              );
            })}
          </div>

          <div className="pb-4">
             {Object.entries(groupedTasks).map(([groupKey, tasks]) => (
                <div key={groupKey}>
                   {groupBy !== 'none' && (
                       <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                          <h4 className="font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             {getGroupTitle(groupKey)}
                             <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-black">{tasks.length}</span>
                          </h4>
                       </div>
                   )}
                   <div className="divide-y divide-slate-100 dark:divide-slate-800">
                       {tasks.map(task => <TaskRow key={task.id} task={task} visibleColumns={visibleColumns} gridTemplate={gridTemplate} data={data} onEditTask={onEditTask} onDeleteTask={onDeleteTask} t={t} />)}
                   </div>
                </div>
             ))}
             {sortedAndFilteredTasks.length === 0 && <div className="p-12 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs">Nenhuma tarefa encontrada</div>}
          </div>
        </div>
      </div>
    </div>
  );
};