
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BoardData, Task } from '../types';
import { PriorityBadge, TaskAge, Avatar } from '../components/Shared';
// Added Layers to imports
import { Calendar, Trash2, GripHorizontal, Plus, Layers } from 'lucide-react';

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
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, priorityData, assigneeData, onClick, onDelete }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white dark:bg-zinc-900 p-5 rounded-[1.5rem] border border-slate-200 dark:border-white/[0.05] shadow-sm mb-4 group hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-2xl transition-all relative ring-1 ring-black/[0.03] dark:ring-white/[0.01] ${
            snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl ring-4 ring-indigo-500/20 z-[100]' : ''
          }`}
          style={provided.draggableProps.style}
        >
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onDelete}
              className="p-1.5 text-slate-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="flex justify-between items-start mb-3 pr-8">
            <PriorityBadge priority={priorityData} />
            <GripHorizontal size={14} className="text-slate-100 dark:text-zinc-800" />
          </div>
          
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 line-clamp-3 leading-snug text-[14px] tracking-tight">
            {task.title}
          </h4>
          
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-600 mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
             <div className="flex items-center gap-2 text-[11px] font-bold">
                <Calendar size={13} className="text-slate-300 dark:text-zinc-700" />
                <span className="dark:text-zinc-400 tabular-nums">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
             </div>
             <div className="flex items-center gap-2.5">
                <TaskAge createdAt={task.createdAt} />
                {assigneeData && <Avatar name={assigneeData.name} url={assigneeData.avatar} size="sm" />}
             </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ data, onDragEnd, onEditTask, onDeleteTask }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full overflow-x-auto gap-8 pb-10 custom-scrollbar items-start">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

          return (
            <div key={column.id} className="min-w-[320px] max-w-[320px] flex flex-col h-full rounded-[2.5rem] bg-slate-100/40 dark:bg-black/60 border border-slate-200/50 dark:border-white/[0.05] shadow-inner overflow-hidden flex-shrink-0">
              <div 
                className="p-5 flex items-center justify-between border-t-[6px] bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl sticky top-0 z-10 shadow-sm"
                style={{ borderColor: column.color }}
              >
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] whitespace-nowrap">
                  {column.title}
                  <span className="bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black shadow-sm tabular-nums">
                    {tasks.length}
                  </span>
                </h3>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-4 transition-all overflow-y-auto custom-scrollbar ${snapshot.isDraggingOver ? 'bg-indigo-50/10 dark:bg-indigo-500/[0.02]' : ''}`}
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
                      />
                    ))}
                    {provided.placeholder}
                    {tasks.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 select-none grayscale pointer-events-none">
                         <Layers size={48} className="text-slate-400 dark:text-zinc-600 mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-center">{column.title} vazio</p>
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
