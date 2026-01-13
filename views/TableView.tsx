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
  defaultWidth: number;
}

const ALL_COLUMNS: ColumnDef[] = [
  { id: 'title', labelKey: 'title', defaultWidth: 250 },
  { id: 'status', labelKey: 'status', defaultWidth: 120 },
  { id: 'priority', labelKey: 'priority', defaultWidth: 120 },
  { id: 'assigneeId', labelKey: 'assignee', defaultWidth: 150 },
  { id: 'dueDate', labelKey: 'dueDate', defaultWidth: 100 },
  { id: 'taskAge', labelKey: 'taskAge', defaultWidth: 100 },
  { id: 'actions', labelKey: 'actions', defaultWidth: 60 }
];

interface TaskRowProps {
  task: Task;
  visibleColumns: ColumnId[];
  columnWidths: Record<string, number>;
  data: BoardData;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  t: (key: any) => string;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, visibleColumns, columnWidths, data, onEditTask, onDeleteTask, t }) => {
  const assignee = data.assignees.find(a => a.id === task.assigneeId);
  const statusColumn = data.columns[task.status];
  const priorityData = data.priorities.find(p => p.id === task.priority);

  return (
    <div className="flex hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group items-center border-b border-slate-100 dark:border-white/[0.05] last:border-0 min-w-fit">
      {visibleColumns.map(colId => (
        <div 
          key={colId} 
          className="px-3 py-1.5 text-[11px] text-slate-600 dark:text-slate-400 truncate flex-shrink-0"
          style={{ width: columnWidths[colId] || 100 }}
        >
          {colId === 'title' && (
              <span 
                className="font-semibold text-slate-800 dark:text-white cursor-pointer hover:text-indigo-600 transition-colors truncate block"
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
              <div className="flex items-center gap-1.5 truncate">
                  <Avatar url={assignee.avatar} name={assignee.name} size="sm" />
                  <span className="truncate text-slate-700 dark:text-slate-400 font-semibold">{assignee.name}</span>
              </div>
            ) : <span className="text-slate-300 dark:text-slate-700 italic text-[9px]">{t('unassigned')}</span>
          )}
          
          {colId === 'dueDate' && <span className="dark:text-slate-400 tabular-nums font-semibold">{new Date(task.dueDate).toLocaleDateString()}</span>}
          
          {colId === 'taskAge' && <TaskAge createdAt={task.createdAt} />}
          
          {colId === 'actions' && (
            <div className="flex items-center justify-end gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEditTask(task)} className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-all"><Edit size={12} /></button>
              <button onClick={() => onDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-600 rounded transition-all"><Trash2 size={12} /></button>
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
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('hybridtask-column-widths');
    if (saved) return JSON.parse(saved);
    return ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.id]: col.defaultWidth }), {});
  });

  const resizerRef = useRef<{ id: string; startX: number; startWidth: number } | null>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('hybridtask-column-widths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(event.target as Node)) setIsGroupMenuOpen(false);
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) setIsColumnMenuOpen(false);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizerRef.current) return;
      const { id, startX, startWidth } = resizerRef.current;
      const diff = e.clientX - startX;
      setColumnWidths(prev => ({ ...prev, [id]: Math.max(50, startWidth + diff) }));
    };
    const handleMouseUp = () => {
      resizerRef.current = null;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
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

  const startResizing = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizerRef.current = { id, startX: e.clientX, startWidth: columnWidths[id] };
    document.body.style.cursor = 'col-resize';
  };

  return (
    <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full relative theme-transition">
      <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-black/40 backdrop-blur-md">
         <div className="flex items-center gap-2">
           <div className="relative w-40 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                className="w-full pl-9 pr-3 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-white font-semibold"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
           </div>
           
           <div className="relative" ref={groupMenuRef}>
             <button onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)} className={`p-1.5 border rounded-lg transition-all ${isGroupMenuOpen ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                <Layers size={14} />
             </button>
             {isGroupMenuOpen && (
               <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[100] p-1.5 animate-in zoom-in-95 duration-150 ring-1 ring-black/5">
                  <p className="px-2 py-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b dark:border-slate-800 mb-1.5">{t('groupBy')}</p>
                  {(['none', 'status', 'priority', 'assigneeId'] as GroupByOption[]).map(option => (
                    <button key={option} onClick={() => { setGroupBy(option); setIsGroupMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${groupBy === option ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]'}`}>
                       {t(`groupBy${option.charAt(0).toUpperCase() + option.slice(1)}` as any)}
                       {groupBy === option && <Check size={12} />}
                    </button>
                  ))}
               </div>
             )}
           </div>

           <div className="relative" ref={columnMenuRef}>
             <button onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)} className={`p-1.5 border rounded-lg transition-all ${isColumnMenuOpen ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                <Settings2 size={14} />
             </button>
             {isColumnMenuOpen && (
               <div className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[100] p-1.5 animate-in zoom-in-95 duration-150 ring-1 ring-black/5">
                  <p className="px-2 py-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b dark:border-slate-800 mb-1.5">{t('manageColumns')}</p>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                    {ALL_COLUMNS.map(col => (
                      <button key={col.id} onClick={() => toggleColumn(col.id)} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${!hiddenColumns.includes(col.id) ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through decoration-slate-400/50'} hover:bg-slate-50 dark:hover:bg-white/[0.05]`}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${!hiddenColumns.includes(col.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-transparent border-slate-200 dark:border-slate-800'}`}>
                           {!hiddenColumns.includes(col.id) && <Check size={10} />}
                        </div>
                        {t(col.labelKey as any)}
                      </button>
                    ))}
                  </div>
               </div>
             )}
           </div>
         </div>
         <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest hidden sm:block">{sortedAndFilteredTasks.length} {t('tasksFound')}</span>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar dark:bg-black mobile-scroll-x">
        <div className="w-fit min-w-full">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns" direction="horizontal">
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex bg-slate-100/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm backdrop-blur-xl" 
                >
                  {visibleColumns.map((colId, index) => {
                    const colDef = ALL_COLUMNS.find(c => c.id === colId)!;
                    return (
                      <Draggable key={colId} draggableId={colId} index={index}>
                        {(dragProvided) => (
                          <div 
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className="px-3 py-2 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all group flex-shrink-0 relative select-none"
                            style={{ 
                              ...dragProvided.draggableProps.style,
                              width: columnWidths[colId] || 100 
                            }}
                          >
                             <div {...dragProvided.dragHandleProps} className="flex items-center gap-1 cursor-grab active:cursor-grabbing flex-1 truncate">
                                <GripVertical size={10} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                                <span className="flex-1 truncate" onClick={() => {
                                  if (colId !== 'actions' && colId !== 'taskAge') {
                                    setSortConfig(prev => ({
                                      key: colId as keyof Task,
                                      direction: prev?.key === colId && prev.direction === 'asc' ? 'desc' : 'asc'
                                    }));
                                  }
                                }}>{t(colDef.labelKey as any)}</span>
                                {colId !== 'actions' && colId !== 'taskAge' && (
                                  <ArrowUpDown size={10} className={sortConfig?.key === colId ? 'text-indigo-600 opacity-100' : 'opacity-20 group-hover:opacity-50'} />
                                )}
                             </div>
                             {/* Column Resizer Handle */}
                             <div 
                               className="col-resizer" 
                               onMouseDown={(e) => startResizing(colId, e)}
                             />
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

          <div className="pb-4">
             {Object.entries(groupedTasks).map(([groupKey, tasks]) => {
                const isCollapsed = collapsedGroups.has(groupKey);
                return (
                  <div key={groupKey} className="border-b border-slate-100 dark:border-white/[0.02] last:border-0">
                     {groupBy !== 'none' && (
                         <div 
                           onClick={() => toggleGroupCollapse(groupKey)}
                           className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer sticky top-[33px] z-[5] backdrop-blur-md"
                         >
                            <div className="text-slate-400 dark:text-zinc-600">
                               {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                            </div>
                            <h4 className="font-bold text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                               {getGroupTitle(groupKey)}
                               <span className="bg-slate-200/60 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded text-[9px] font-bold">
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
                               columnWidths={columnWidths}
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