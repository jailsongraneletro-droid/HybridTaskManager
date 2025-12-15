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
          className={`bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-3 group hover:border-indigo-300 hover:shadow-md transition-all relative ${
            snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-indigo-400 z-50' : ''
          }`}
          style={provided.draggableProps.style}
        >
          {/* Action Menu (Visible on Hover) */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onDelete}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
              title="Delete Task"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="flex justify-between items-start mb-2 pr-6">
            <PriorityBadge priority={priorityData} />
          </div>
          
          <h4 className="font-medium text-slate-800 mb-2 line-clamp-2 leading-tight">
            {task.title}
          </h4>
          
          <div className="flex items-center justify-between text-slate-400 mt-3 pt-2 border-t border-slate-50">
             <div className="flex items-center gap-1 text-xs">
                <Calendar size={12} />
                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
             </div>
             <div className="flex items-center gap-2">
                <TaskAge createdAt={task.createdAt} />
                {assigneeData && <Avatar name={assigneeData.name} url={assigneeData.avatar} />}
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
      <div className="flex h-full overflow-x-auto gap-4 md:gap-6 pb-4 px-1 md:px-0">
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

          return (
            <div key={column.id} className="min-w-[300px] flex flex-col h-full rounded-xl bg-slate-50/50 border border-slate-200/60">
              <div 
                className="p-4 flex items-center justify-between border-t-4 rounded-t-xl"
                style={{ borderColor: column.color }}
              >
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  {column.title}
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                    {tasks.length}
                  </span>
                </h3>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''}`}
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