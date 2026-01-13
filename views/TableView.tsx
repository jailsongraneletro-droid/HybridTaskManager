import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BoardData, Task } from '../types';
import { PriorityBadge, StatusBadge, Avatar, TaskAge } from '../components/Shared';
import { ArrowUpDown, Search, Trash2, Edit, GripVertical, Settings2, Eye, EyeOff, Layers, Check, ChevronDown, ChevronRight } from 'lucide-react';
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
  { id: 'title', labelKey: 'title', width: 'minmax(200px, 3fr)' },
  { id: 'status', labelKey: 'status', width: 'minmax(120px, 1fr)' },
  { id: 'priority', labelKey: 'priority', width: 'minmax(120px, 1fr)' },
  { id: 'assigneeId', labelKey: 'assignee', width: 'minmax(140px, 1.2fr)' },
  { id: 'dueDate', labelKey: 'dueDate', width: 'minmax(110px, 1fr)' },
  { id: 'taskAge', labelKey: 'taskAge', width: 'minmax(110px, 1fr)' },
  { id: 'actions', labelKey: 'actions', width: '80px' }
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
      className="grid hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group items-center border-b border-slate-100 dark:border-white/[0.05] last:border-0"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {visibleColumns.map(colId => (
        <div key={colId} className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 truncate">
          {colId === 'title' && (
              <span 
                className="font-semibold text-slate-800 dark:text-slate-100 cursor-pointer hover:text-indigo-600 transition-colors"
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
                  <Avatar url={assignee.avatar} name={assignee.name} size="sm" />
                  <span className="truncate text-slate-700 dark:text-slate-300">{assignee.name}</span>
              </div>
            ) : <span className="text-slate-400 dark:text-slate-700 italic text-[10px]">{t('unassigned')}</span>
          )}
          
          {colId === 'dueDate' && <span className="dark:text-slate-300 tabular-nums">{new Date(task.dueDate).toLocaleDateString()}</span>}
          
          {colId === 'taskAge' && <TaskAge createdAt={task.createdAt} />}
          
          {colId === 'actions' && (
            <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEditTask(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-all"><Edit size={14} /></button>
              <button onClick={() => onDeleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"><Trash2 size={14} /></button>
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
  const [hiddenColumns, setHiddenColumns] = useState<ColumnId[]>(['taskAge']);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const groupMenuRef = useRef<HTMLDivElement>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target as Node)) setIsGroupMenuOpen(false);
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) setIsColumnMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allTasks = Object.values(data.tasks) as Task[];

  const sortedAndFilteredTasks = useMemo(() => {
    let tasks = [...allTasks];
    if (filter) tasks = tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()));
    if (sortConfig) {
      tasks.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA === undefined || valB === undefined) return 0;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(columnOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setColumnOrder(items as ColumnId[]);
  };

  const toggleColumn = (id: ColumnId) => {
    setHiddenColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-slate-200 dark:border-white/[0.05] overflow-hidden flex flex-col h-full relative theme-transition">
      <div className="p-3 border-b border-slate-200 dark:border-white/[0.05] flex items-center justify-between bg-slate-50/50 dark:bg-black/40">
         <div className="flex items-center gap-3">
           <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
           </div>
           
           <div className="relative" ref={groupMenuRef}>
             <button onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)} className={`p-2 border rounded-xl transition-all ${isGroupMenuOpen ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'text-slate-500 hover:text-indigo-600 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:shadow-md'}`}>
                <Layers size={14} />
             </button>
             {isGroupMenuOpen && (
               <div className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-[100] p-1.5 animate-in zoom-in-95 duration-150 ring-1 ring-black/5">
                  <p className="px-3 py-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-white/[0.05] mb-1.5">{t('groupBy')}</p>
                  {(['none', 'status', 'priority', 'assigneeId'] as GroupByOption[]).map(option => (
                    <button key={option} onClick={() => { setGroupBy(option); setIsGroupMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${groupBy === option ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                       {t(`groupBy${option.charAt(0).toUpperCase() + option.slice(1)}` as any)}
                       {groupBy === option && <Check size={14} />}
                    </button>
                  ))}
               </div>
             )}
           </div>

           <div className="relative" ref={columnMenuRef}>
             <button onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)} className={`p-2 border rounded-xl transition-all ${isColumnMenuOpen ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'text-slate-500 hover:text-indigo-600 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:shadow-md'}`}>
                <Settings2 size={14} />
             </button>
             {isColumnMenuOpen && (
               <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-[100] p-1.5 animate-in zoom-in-95 duration-150 ring-1 ring-black/5">
                  <p className="px-3 py-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-white/[0.05] mb-1.5">{t('manageColumns')}</p>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar p-1">
                    {ALL_COLUMNS.map(col => (
                      <button key={col.id} onClick={() => toggleColumn(col.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${!hiddenColumns.includes(col.id) ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through decoration-slate-400/50'} hover:bg-slate-50 dark:hover:bg-zinc-800/50`}>
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${!hiddenColumns.includes(col.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-transparent border-slate-200 dark:border-zinc-700'}`}>
                           {!hiddenColumns.includes(col.id) && <Check size={12} />}
                        </div>
                        {t(col.labelKey as any)}
                      </button>
                    ))}
                  </div>
               </div>
             )}
           </div>
         </div>
         <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-wider hidden sm:block">{sortedAndFilteredTasks.length} {t('tasksFound')}</span>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar dark:bg-black">
        <div className="min-w-[900px]">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns" direction="horizontal">
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-white/[0.05] sticky top-0 z-10 shadow-sm backdrop-blur-md" 
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {visibleColumns.map((colId, index) => {
                    const colDef = ALL_COLUMNS.find(c => c.id === colId)!;
                    return (
                      <Draggable key={colId} draggableId={colId} index={index}>
                        {(dragProvided) => (
                          <div 
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className="px-4 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-all group cursor-grab active:cursor-grabbing"
                            onClick={() => {
                              if (colId !== 'actions' && colId !== 'taskAge') {
                                setSortConfig(prev => ({
                                  key: colId as keyof Task,
                                  direction: prev?.key === colId && prev.direction === 'asc' ? 'desc' : 'asc'
                                }));
                              }
                            }}
                          >
                             <GripVertical size={11} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                             <span className="flex-1 truncate">{t(colDef.labelKey as any)}</span>
                             {colId !== 'actions' && colId !== 'taskAge' && (
                               <ArrowUpDown size={11} className={sortConfig?.key === colId ? 'text-indigo-600 opacity-100' : 'opacity-20'} />
                             )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="pb-8">
             {Object.entries(groupedTasks).map(([groupKey, tasks]) => {
                const isCollapsed = collapsedGroups.has(groupKey);
                return (
                  <div key={groupKey} className="border-b border-slate-100 dark:border-white/[0.02] last:border-0">
                     {groupBy !== 'none' && (
                         <div 
                           onClick={() => toggleGroupCollapse(groupKey)}
                           className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-colors cursor-pointer sticky top-[44px] z-[5] backdrop-blur-md"
                         >
                            <div className="text-slate-400 dark:text-zinc-600 transition-transform duration-200" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(0deg)' }}>
                               {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                            </div>
                            <h4 className="font-black text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                               {getGroupTitle(groupKey)}
                               <span className="bg-slate-200/60 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded-full text-[9px] font-black">
                                 {(tasks as Task[]).length}
                               </span>
                            </h4>
                         </div>
                     )}
                     {!isCollapsed && (
                       <div className="divide-y divide-slate-100 dark:divide-white/[0.03] animate-in fade-in slide-in-from-top-1 duration-200">
                           {(tasks as Task[]).map(task => (
                             <TaskRow 
                               key={task.id} 
                               task={task} 
                               visibleColumns={visibleColumns} 
                               gridTemplate={gridTemplate} 
                               data={data} 
                               onEditTask={onEditTask} 
                               onDeleteTask={onDeleteTask} 
                               t={t} 
                             />
                           ))}
                       </div>
                     )}
                  </div>
                );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};