
import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BoardData, Task } from '../types';
import { PriorityBadge, TaskAge, Avatar } from '../components/Shared';
import { Calendar, Trash2, GripHorizontal, Plus, Layers, Filter, ArrowUpDown, Search, X } from 'lucide-react';

interface KanbanBoardProps {
  data: BoardData;
  onDragEnd: (result: DropResult) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

interface TaskCardProps {
  task: Task;
  index: number;
  priorityData: any;
  assigneeData: any;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isReorderable: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, priorityData, assigneeData, onClick, onDelete, isReorderable }) => {
  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={!isReorderable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white dark:bg-[#24282d] p-3 rounded-2xl border border-slate-200/80 dark:border-[#2a2f36] shadow-sm mb-3 group hover:border-indigo-400 dark:hover:border-slate-500 hover:shadow-lg hover:-translate-y-0.5 transition-all relative ${
            snapshot.isDragging ? 'rotate-1 scale-102 shadow-xl ring-1 ring-indigo-500/50 z-[100]' : ''
          } ${isReorderable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
          style={provided.draggableProps.style}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onDelete}
              className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              <Trash2 size={12} />
            </button>
          </div>

          <div className="flex justify-between items-start mb-2 pr-4">
            <PriorityBadge priority={priorityData} />
            {isReorderable && <GripHorizontal size={10} className="text-slate-200 dark:text-slate-800 opacity-50" />}
          </div>
          
          <h4 className="font-semibold text-slate-800 dark:text-white mb-2 line-clamp-2 leading-tight text-[11px] tracking-tight">
            {task.title}
          </h4>
          
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-[#2a2a2a]">
             <div className="relative group/tooltip flex items-center gap-1 text-[9px] font-semibold">
                <Calendar size={10} className="text-slate-300 dark:text-slate-600" />
                <span className="tabular-nums">{new Date(task.dueDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric'})}</span>
                
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block bg-slate-800 dark:bg-slate-700 text-white text-[8px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-[110] pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
                </div>
             </div>

             <div className="flex items-center gap-1.5 scale-90 origin-right">
                <TaskAge createdAt={task.createdAt} />
                {assigneeData && (
                  <div className="relative group/tooltip">
                    <Avatar name={assigneeData.name} url={assigneeData.avatar} size="sm" />
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:block bg-slate-800 dark:bg-slate-700 text-white text-[8px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-[110] pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      Responsável: {assigneeData.name}
                      <div className="absolute top-full right-2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ data, onDragEnd, onEditTask, onDeleteTask }) => {
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [columnSorting, setColumnSorting] = useState<Record<string, 'title' | 'dueDate' | 'priority' | 'none'>>({});
  const [activeSettings, setActiveSettings] = useState<string | null>(null);

  const getSortedFilteredTasks = (columnId: string, taskIds: string[]) => {
    // Começamos com a lista original para respeitar a ordem manual por padrão
    let tasks = taskIds.map(taskId => data.tasks[taskId]);
    
    // Aplica Filtro de pesquisa
    const query = columnFilters[columnId]?.toLowerCase() || '';
    if (query) {
      tasks = tasks.filter(t => t.title.toLowerCase().includes(query));
    }

    // Aplica Ordenação automática se solicitada
    const sortMode = columnSorting[columnId] || 'none';
    if (sortMode !== 'none') {
      tasks = [...tasks].sort((a, b) => {
        if (sortMode === 'title') return a.title.localeCompare(b.title);
        if (sortMode === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (sortMode === 'priority') {
          const prioA = data.priorities.findIndex(p => p.id === a.priority);
          const prioB = data.priorities.findIndex(p => p.id === b.priority);
          return prioA - prioB;
        }
        return 0;
      });
    }

    return tasks;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full overflow-x-auto gap-4 sm:gap-5 pb-6 custom-scrollbar items-start mobile-scroll-x">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = getSortedFilteredTasks(columnId, column.taskIds);
          const isSettingOpen = activeSettings === columnId;
          const isReorderable = !columnFilters[columnId] && (columnSorting[columnId] === 'none' || !columnSorting[columnId]);

          return (
            <div key={column.id} className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px] flex flex-col h-full rounded-2xl bg-white/70 dark:bg-[#1a1d21] border border-slate-200/80 dark:border-[#2a2f36] shadow-sm overflow-hidden flex-shrink-0 transition-all">
              <div 
                className="p-3.5 flex flex-col border-t-2 bg-white/80 dark:bg-[#1a1d21] backdrop-blur-xl sticky top-0 z-10 shadow-sm"
                style={{ borderColor: column.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] whitespace-nowrap">
                    {column.title}
                    <span className="bg-slate-200/80 dark:bg-[#24282d] text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded text-[8px] font-bold shadow-sm tabular-nums">
                      {tasks.length}
                    </span>
                  </h3>
                  <div className="flex items-center gap-1">
                     <button 
                       onClick={() => setActiveSettings(isSettingOpen ? null : columnId)}
                       className={`p-1.5 rounded-lg transition-all ${isSettingOpen ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`}
                     >
                       <Filter size={14} />
                     </button>
                  </div>
                </div>

                {/* Painel de Filtro e Ordenação - Agora abre como uma sub-seção fixa no topo da coluna */}
                {isSettingOpen && (
                  <div className="space-y-3 p-2.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200 mb-2">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                        <input 
                          type="text"
                          placeholder="Pesquisar..."
                          value={columnFilters[columnId] || ''}
                          onChange={(e) => setColumnFilters({...columnFilters, [columnId]: e.target.value})}
                          className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                        />
                        {columnFilters[columnId] && (
                           <button onClick={() => setColumnFilters({...columnFilters, [columnId]: ''})} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                             <X size={12} />
                           </button>
                        )}
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest ml-1">Ordenar por:</span>
                        <div className="flex flex-wrap gap-1">
                           {[
                             { id: 'none', label: 'Manual' },
                             { id: 'title', label: 'A-Z' },
                             { id: 'dueDate', label: 'Data' },
                             { id: 'priority', label: 'Urgência' }
                           ].map(mode => (
                             <button 
                               key={mode.id} 
                               onClick={() => {
                                 if (mode.id === 'none') {
                                   setColumnSorting(prev => {
                                     const next = { ...prev } as any;
                                     delete next[columnId];
                                     return next;
                                   });
                                   setColumnFilters(prev => ({ ...prev, [columnId]: '' }));
                                   return;
                                 }
                                 setColumnSorting({ ...columnSorting, [columnId]: mode.id as any });
                               }}
                               className={`flex-1 px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-tighter border transition-all ${columnSorting[columnId] === mode.id || (mode.id === 'none' && !columnSorting[columnId]) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'}`}
                             >
                               {mode.label}
                             </button>
                           ))}
                        </div>
                     </div>
                    {!isReorderable && (
                      <p className="text-[7px] font-medium text-amber-600 dark:text-amber-500 text-center uppercase tracking-tighter">Arranjo manual pausado durante filtro/ordem</p>
                    )}
                  </div>
                )}
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 transition-all overflow-y-auto custom-scrollbar ${snapshot.isDraggingOver ? 'bg-indigo-50/10 dark:bg-white/[0.03]' : ''}`}
                  >
                    {tasks.map((task, index) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        index={index} 
                        priorityData={data.priorities.find(p => p.id === task.priority)}
                        assigneeData={data.assignees.find(a => a.id === task.assigneeId)}
                        onClick={() => onEditTask(task)} 
                        onDelete={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                        isReorderable={isReorderable}
                      />
                    ))}
                    {provided.placeholder}
                    {tasks.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center py-10 opacity-10 select-none pointer-events-none">
                         <Layers size={40} className="text-slate-400 dark:text-slate-300 mb-2" />
                         <p className="text-[9px] font-bold uppercase tracking-widest text-center">{column.title} vazio</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
