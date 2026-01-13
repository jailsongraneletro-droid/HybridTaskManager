import React, { useState, useMemo } from 'react';
import { BoardData, Task } from '../types';
import { useLanguage } from '../utils/i18n';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { Avatar } from '../components/Shared';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DataService } from '../services/dataService';

interface CalendarViewProps {
  data: BoardData;
  onEditTask: (task: Task) => void;
  onAddTaskOnDate: (date: string) => void;
  onUpdate?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ data, onEditTask, onAddTaskOnDate, onUpdate }) => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const allTasks = useMemo(() => Object.values(data.tasks) as Task[], [data.tasks]);
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const formatLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const days = [];
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = startOffset - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    for (let i = 1; i <= totalDays; i++) days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    return days;
  }, [currentDate]);

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };
  const weekDays = useMemo(() => {
    const startDate = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + direction);
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() + (direction * 7));
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const getTasksForDate = (date: Date) => {
    return allTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.getDate() === date.getDate() && taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear();
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newDateStr = result.destination.droppableId;
    
    try {
        await DataService.updateTask(taskId, { dueDate: new Date(newDateStr + 'T12:00:00').toISOString() });
        if (onUpdate) onUpdate();
    } catch (e) {
        console.error("Erro ao mover tarefa no calendário:", e);
    }
  };

  const DraggableTask: React.FC<{ task: Task, index: number }> = ({ task, index }) => {
    const col = data.columns[task.status];
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => onEditTask(task)} 
            style={{ 
                ...provided.draggableProps.style,
                backgroundColor: snapshot.isDragging ? col?.color : isToday(new Date(task.dueDate)) ? `${col?.color}20` : `${col?.color}10`, 
                borderLeft: `2px solid ${col?.color}` 
            }} 
            className={`px-1 py-0.5 rounded text-[8px] font-bold truncate cursor-pointer hover:brightness-110 transition-all shadow-sm border border-slate-200/40 dark:border-slate-800/40 mb-0.5 flex items-center gap-1 ${snapshot.isDragging ? 'text-white z-[100] shadow-md scale-105' : 'text-slate-700 dark:text-slate-300'}`}
          >
            <span className={`w-0.5 h-0.5 rounded-full shrink-0 ${snapshot.isDragging ? 'bg-white' : ''}`} style={{ backgroundColor: snapshot.isDragging ? undefined : col?.color }}></span>
            <span className="truncate">{task.title}</span>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all theme-transition">
      <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm"><CalendarIcon size={14} /></div>
            <h2 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
          </div>
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
            <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors"><ChevronLeft size={12} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-2 py-1 text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">{t('todayView')}</button>
            <button onClick={() => navigateDate(1)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors"><ChevronRight size={12} /></button>
          </div>
        </div>
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/50 p-0.5 rounded-lg shadow-inner">
          {(['month', 'week', 'day'] as const).map(mode => (
            <button 
              key={mode} 
              onClick={() => setViewMode(mode)} 
              className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {t(mode as any)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50/30 dark:bg-slate-950">
        <DragDropContext onDragEnd={handleDragEnd}>
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 h-full min-h-[400px] border-l border-slate-100 dark:border-slate-800">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest bg-white dark:bg-slate-900 border-r border-b border-slate-100 dark:border-slate-800">{day}</div>
                ))}
                {monthData.map((item, idx) => {
                  const dateTasks = getTasksForDate(item.date);
                  const dateId = formatLocalDate(item.date);
                  const today = isToday(item.date);
                  return (
                    <Droppable key={idx} droppableId={dateId}>
                        {(provided, snapshot) => (
                            <div 
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`min-h-[80px] p-1 border-r border-b border-slate-100 dark:border-slate-800 transition-all group ${!item.currentMonth ? 'bg-slate-50/40 dark:bg-white/[0.01] opacity-30' : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]'} ${today ? 'bg-indigo-50/10 dark:bg-indigo-900/10' : ''} ${snapshot.isDraggingOver ? 'ring-1 ring-inset ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-900/20' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[9px] font-black w-5 h-5 flex items-center justify-center rounded transition-all ${today ? 'bg-indigo-600 text-white shadow scale-105' : item.currentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-700'}`}>{item.day}</span>
                                <button onClick={() => onAddTaskOnDate(dateId)} className="opacity-0 group-hover:opacity-100 p-0.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded transition-all"><Plus size={10} /></button>
                              </div>
                              <div className="space-y-0.5">
                                {dateTasks.map((task, taskIdx) => <DraggableTask key={task.id} task={task} index={taskIdx} />)}
                              </div>
                              {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                  );
                })}
              </div>
            )}

            {viewMode === 'week' && (
              <div className="flex flex-col h-full min-w-[600px]">
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
                  {weekDays.map((date, idx) => (
                    <div key={idx} className={`p-2 border-r border-slate-200 dark:border-slate-800 text-center transition-colors ${isToday(date) ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}>
                      <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                      <p className={`text-sm font-black w-7 h-7 flex items-center justify-center mx-auto rounded transition-all ${isToday(date) ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-800 dark:text-slate-100'}`}>{date.getDate()}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 flex-1 min-h-[400px]">
                  {weekDays.map((date, idx) => {
                    const dateTasks = getTasksForDate(date);
                    const dateId = formatLocalDate(date);
                    return (
                      <Droppable key={idx} droppableId={dateId}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-1.5 border-r border-slate-100 dark:border-slate-800 group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors ${isToday(date) ? 'bg-indigo-50/5' : ''} ${snapshot.isDraggingOver ? 'bg-indigo-50/30 dark:bg-indigo-900/30 ring-1 ring-inset ring-indigo-500/10' : ''}`}
                          >
                            <div className="space-y-1.5">
                              {dateTasks.map((task, taskIdx) => (
                                <Draggable key={task.id} draggableId={task.id} index={taskIdx}>
                                  {(dragProvided, dragSnapshot) => (
                                    <div 
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      onClick={() => onEditTask(task)} 
                                      className={`bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all ${dragSnapshot.isDragging ? 'z-[100] shadow-xl ring-1 ring-indigo-500 scale-105' : ''}`}
                                    >
                                         <div className="w-full h-0.5 rounded-full mb-1" style={{ backgroundColor: data.columns[task.status]?.color }} />
                                         <p className="text-[10px] font-bold text-slate-800 dark:text-white leading-tight mb-1 line-clamp-2">{task.title}</p>
                                         <div className="flex items-center justify-between pt-0.5 opacity-80 scale-90 origin-left">
                                            <Avatar size="sm" name={data.assignees.find(a => a.id === task.assigneeId)?.name || '?'} />
                                         </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              </div>
            )}
        </DragDropContext>
      </div>
    </div>
  );
};
