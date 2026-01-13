import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BoardData, Task } from '../types';
import { PriorityBadge, TaskAge, Avatar } from '../components/Shared';
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
          className={`bg-white dark:bg-[#0a0a0a] p-2.5 rounded-xl border border-slate-200 dark:border-[#1a1a1a] shadow-sm mb-2 group hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all relative ${
            snapshot.isDragging ? 'rotate-1 scale-102 shadow-xl ring-1 ring-indigo-500/50 z-[100]' : ''
          }`}
          style={provided.draggableProps.style}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onDelete}
              className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              <Trash2 size={12} />
            </button>
          </div>

          <div className="flex justify-between items-start mb-1.5 pr-4">
            <PriorityBadge priority={priorityData} />
            <GripHorizontal size={10} className="text-slate-100 dark:text-slate-800 opacity-50" />
          </div>
          
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 leading-tight text-[11px] tracking-tight">
            {task.title}
          </h4>
          
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-600 mt-3 pt-2 border-t border-slate-100 dark:border-[#1a1a1a]">
             <div className="flex items-center gap-1 text-[9px] font-bold">
                <Calendar size={10} className="text-slate-300 dark:text-slate-700" />
                <span className="dark:text-slate-500 tabular-nums">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
             </div>
             <div className="flex items-center gap-1.5 scale-90 origin-right">
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
      <div className="flex h-full overflow-x-auto gap-4 pb-6 custom-scrollbar items-start">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

          return (
            <div key={column.id} className="min-w-[250px] max-w-[250px] flex flex-col h-full rounded-2xl bg-slate-100/40 dark:bg-black border border-slate-200/50 dark:border-[#1a1a1a] shadow-inner overflow-hidden flex-shrink-0">
              <div 
                className="p-3 flex items-center justify-between border-t-2 bg-white/60 dark:bg-[#0a0a0a]/40 backdrop-blur-xl sticky top-0 z-10 shadow-sm"
                style={{ borderColor: column.color }}
              >
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-[9px] uppercase tracking-[0.1em] whitespace-nowrap">
                  {column.title}
                  <span className="bg-slate-200/80 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-black shadow-sm tabular-nums">
                    {tasks.length}
                  </span>
                </h3>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 transition-all overflow-y-auto custom-scrollbar ${snapshot.isDraggingOver ? 'bg-indigo-50/10 dark:bg-white/[0.02]' : ''}`}
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
                      <div className="h-full flex flex-col items-center justify-center py-10 opacity-10 select-none grayscale pointer-events-none">
                         <Layers size={32} className="text-slate-400 dark:text-slate-600 mb-2" />
                         <p className="text-[8px] font-black uppercase tracking-widest text-center">{column.title} vazio</p>
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