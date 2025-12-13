import React, { useState, useMemo } from 'react';
import { BoardData, Task } from '../types';
import { PriorityBadge, StatusBadge, Avatar, TaskAge } from '../components/Shared';
import { ArrowUpDown, Search, Trash2, Edit, GripVertical, Settings2, Eye, EyeOff } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useLanguage } from '../utils/i18n';

interface TableViewProps {
  data: BoardData;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

type ColumnId = keyof Task | 'taskAge' | 'actions';

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

export const TableView: React.FC<TableViewProps> = ({ data, onEditTask, onDeleteTask }) => {
  const { t } = useLanguage();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Task; direction: 'asc' | 'desc' } | null>(null);
  const [filter, setFilter] = useState('');
  
  // Column Management State
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(ALL_COLUMNS.map(c => c.id));
  const [hiddenColumns, setHiddenColumns] = useState<ColumnId[]>([]);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  const allTasks = Object.values(data.tasks) as Task[];

  const sortedAndFilteredTasks = useMemo(() => {
    let tasks = [...allTasks];

    if (filter) {
      tasks = tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()));
    }

    if (sortConfig) {
      tasks.sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return tasks;
  }, [allTasks, filter, sortConfig]);

  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = Array.from(columnOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setColumnOrder(newOrder);
  };

  const toggleColumnVisibility = (colId: ColumnId) => {
    setHiddenColumns(prev => 
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const visibleColumns = columnOrder.filter(id => !hiddenColumns.includes(id));
  
  const getGridTemplate = () => {
    const defs = visibleColumns.map(id => ALL_COLUMNS.find(c => c.id === id)?.width || '1fr');
    return defs.join(' ');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
         <div className="flex items-center gap-4">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                className="w-full pl-9 pr-4 py-2 text-sm bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
           </div>
           <div className="relative">
             <button 
               onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
               className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800"
             >
               <Settings2 size={16} />
               {t('columns')}
             </button>

             {isColumnMenuOpen && (
               <>
                 <div className="fixed inset-0 z-20" onClick={() => setIsColumnMenuOpen(false)}></div>
                 <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                   <h4 className="text-xs font-semibold text-slate-400 uppercase px-3 py-2">{t('manageColumns')}</h4>
                   <div className="space-y-1">
                     {ALL_COLUMNS.map(col => (
                       <button
                         key={col.id}
                         onClick={() => toggleColumnVisibility(col.id)}
                         className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                       >
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
         <span className="text-sm text-slate-500">{sortedAndFilteredTasks.length} {t('tasksFound')}</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="table-headers" direction="horizontal">
              {(provided) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid bg-slate-50 border-b border-slate-200 sticky top-0 z-10"
                  style={{ gridTemplateColumns: getGridTemplate() }}
                >
                  {visibleColumns.map((colId, index) => {
                    const colDef = ALL_COLUMNS.find(c => c.id === colId)!;
                    return (
                      <Draggable key={colId} draggableId={colId} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 group ${snapshot.isDragging ? 'bg-indigo-50 opacity-90 shadow-lg' : ''}`}
                            style={provided.draggableProps.style}
                          >
                            <div {...provided.dragHandleProps} className="cursor-grab hover:text-indigo-600">
                              <GripVertical size={14} />
                            </div>
                            <div 
                              className="flex items-center gap-1 cursor-pointer hover:text-slate-800"
                              onClick={() => {
                                if(colId !== 'actions' && colId !== 'taskAge') handleSort(colId as keyof Task);
                              }}
                            >
                              {t(colDef.labelKey as any)}
                              {colId !== 'actions' && colId !== 'taskAge' && <ArrowUpDown size={12} />}
                            </div>
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

          <div className="divide-y divide-slate-100">
            {sortedAndFilteredTasks.map((task) => {
              const assignee = data.assignees.find(a => a.id === task.assigneeId);
              const statusColumn = data.columns[task.status];
              const priorityData = data.priorities.find(p => p.id === task.priority);
              
              return (
                <div 
                  key={task.id}
                  className="grid hover:bg-slate-50/80 transition-colors group items-center"
                  style={{ gridTemplateColumns: getGridTemplate() }}
                >
                  {visibleColumns.map(colId => (
                    <div key={colId} className="px-4 py-3 text-sm text-slate-600 truncate">
                      {colId === 'title' && (
                         <span 
                           className="font-medium text-slate-800 cursor-pointer hover:text-indigo-600"
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
                        ) : <span className="text-slate-400 italic">{t('unassigned')}</span>
                      )}
                      
                      {colId === 'dueDate' && new Date(task.dueDate).toLocaleDateString()}
                      
                      {colId === 'taskAge' && <TaskAge createdAt={task.createdAt} />}
                      
                      {colId === 'actions' && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onEditTask(task)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title={t('edit')}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
};