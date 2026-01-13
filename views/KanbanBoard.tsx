import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { BoardData, Task } from '../types';
import { PriorityBadge, TaskAge, Avatar } from '../components/Shared';
import { Calendar, Trash2, GripHorizontal } from 'lucide-react';

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
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-3 group hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xl transition-all relative ring-1 ring-black/[0.03] dark:ring-white/[0.02] ${
            snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-indigo-500 z-[100]' : ''
          }`}
          style={provided.draggableProps.style}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
              title="Excluir Tarefa"
            >
              <Trash2 size={13} />
            </button>
          </div>

          <div className="flex justify-between items-start mb-2 pr-6">
            <PriorityBadge priority={priorityData} />
            <GripHorizontal size={12} className="text-slate-200 dark:text-slate-800" />
          </div>
          
          <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 line-clamp-2 leading-snug text-[13px] tracking-tight">
            {task.title}
          </h4>
          
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-600 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
             <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <Calendar size={11} className="text-slate-300 dark:text-slate-700" />
                <span className="dark:text-slate-400">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
             </div>
             <div className="flex items-center gap-2">
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
      <div className="flex h-full overflow-x-auto gap-6 pb-6 custom-scrollbar">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

          return (
            <div key={column.id} className="min-w-[300px] max-w-[300px] flex flex-col h-full rounded-[2rem] bg-slate-100/30 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/40 shadow-inner overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between border-t-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md"
                style={{ borderColor: column.color }}
              >
                <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-3 text-xs uppercase tracking-[0.15em]">
                  {column.title}
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm">
                    {tasks.length}
                  </span>
                </h3>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3.5 transition-all overflow-y-auto custom-scrollbar ${snapshot.isDraggingOver ? 'bg-indigo-50/10 dark:bg-indigo-900/5' : ''}`}
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