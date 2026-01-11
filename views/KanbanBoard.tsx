import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BoardData, Task } from '../types';
import { PriorityBadge, TaskAge, Avatar } from '../components/Shared';
import { Calendar, Trash2 } from 'lucide-react';

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
          className={`bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-2 group hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all relative ${
            snapshot.isDragging ? 'rotate-1 scale-102 shadow-lg ring-1 ring-indigo-400 z-50' : ''
          }`}
          style={provided.draggableProps.style}
        >
          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onDelete}
              className="p-1 text-slate-400 hover:text-red-500 rounded"
              title="Excluir Tarefa"
            >
              <Trash2 size={12} />
            </button>
          </div>

          <div className="flex justify-between items-start mb-1.5 pr-4">
            <PriorityBadge priority={priorityData} />
          </div>
          
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1.5 line-clamp-2 leading-tight text-xs">
            {task.title}
          </h4>
          
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mt-2.5 pt-2 border-t border-slate-50 dark:border-slate-700/50">
             <div className="flex items-center gap-1 text-[10px]">
                <Calendar size={10} />
                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
             </div>
             <div className="flex items-center gap-1.5">
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
      <div className="flex h-full overflow-x-auto gap-4 pb-4">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

          return (
            <div key={column.id} className="min-w-[260px] max-w-[260px] flex flex-col h-full rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
              <div 
                className="p-3 flex items-center justify-between border-t-2 rounded-t-2xl bg-white/50 dark:bg-slate-900/50"
                style={{ borderColor: column.color }}
              >
                <h3 className="font-black text-slate-700 dark:text-slate-200 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                  {column.title}
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full text-[9px] font-black">
                    {tasks.length}
                  </span>
                </h3>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 transition-colors overflow-y-auto custom-scrollbar ${snapshot.isDraggingOver ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}
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