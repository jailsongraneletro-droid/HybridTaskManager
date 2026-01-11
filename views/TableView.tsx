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
  { id: 'actions', labelKey: 'actions', width: '90px' }
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
      className="grid hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group items-center border-b border-slate-100 dark:border-slate-800/60 last:border-0"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {visibleColumns.map(colId => (
        <div key={colId} className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 truncate">
          {colId === 'title' && (
              <span 
                className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-indigo-600 transition-colors"
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
              <div className="flex items-center gap-1.5">
                  <Avatar url={assignee.avatar} name={assignee.name} size="sm" />
                  <span className="truncate">{assignee.name}</span>
              </div>
            ) : <span className="text-slate-400 italic text-[10px]">{t('unassigned')}</span>
          )}
          
          {colId === 'dueDate' && new Date(task.dueDate).toLocaleDateString()}
          
          {colId === 'taskAge' && <TaskAge createdAt={task.createdAt} />}
          
          {colId === 'actions' && (
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEditTask(task)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit size={14} /></button>
              <button onClick={() => onDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full relative">
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
         <div className="flex items-center gap-3">
           <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
           </div>
           <button onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)} className="p-2 text-slate-500 hover:text-indigo-600 border rounded-lg bg-white dark:bg-slate-800"><Layers size={14} /></button>
           <button onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)} className="p-2 text-slate-500 hover:text-indigo-600 border rounded-lg bg-white dark:bg-slate-800"><Settings2 size={14} /></button>
         </div>
         <span className="text-[10px] font-bold text-slate-400">{sortedAndFilteredTasks.length} {t('tasksFound')}</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <div className="grid bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10" style={{ gridTemplateColumns: gridTemplate }}>
            {visibleColumns.map((colId) => {
              const colDef = ALL_COLUMNS.find(c => c.id === colId)!;
              return (
                <div key={colId} className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   {t(colDef.labelKey as any)}
                   {colId !== 'actions' && colId !== 'taskAge' && <ArrowUpDown size={10} className="opacity-30" />}
                </div>
              );
            })}
          </div>

          <div className="pb-4">
             {Object.entries(groupedTasks).map(([groupKey, tasks]) => (
                <div key={groupKey}>
                   {groupBy !== 'none' && (
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="font-black text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                             {getGroupTitle(groupKey)}
                             <span className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-[8px] font-black">{tasks.length}</span>
                          </h4>
                       </div>
                   )}
                   <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                       {tasks.map(task => <TaskRow key={task.id} task={task} visibleColumns={visibleColumns} gridTemplate={gridTemplate} data={data} onEditTask={onEditTask} onDeleteTask={onDeleteTask} t={t} />)}
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};