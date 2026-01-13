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
                backgroundColor: snapshot.isDragging ? col?.color : isToday(new Date(task.dueDate)) ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', 
                borderLeft: `3px solid ${col?.color || '#555'}` 
            }} 
            className={`px-1.5 py-1 rounded text-[9px] font-bold truncate cursor-pointer hover:brightness-125 transition-all shadow-sm border border-slate-200/20 dark:border-slate-800/20 mb-1 flex items-center gap-1.5 ${snapshot.isDragging ? 'text-white z-[100] shadow-xl scale-105' : 'text-slate-700 dark:text-slate-200'}`}
          >
            <span className="truncate">{task.title}</span>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all theme-transition">
      <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-lg"><CalendarIcon size={14} /></div>
            <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
          </div>
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-500 transition-colors"><ChevronLeft size={14} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors">{t('todayView')}</button>
            <button onClick={() => navigateDate(1)} className="p-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-500 transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/50 p-1 rounded-xl shadow-inner">
          {(['month', 'week', 'day'] as const).map(mode => (
            <button 
              key={mode} 
              onClick={() => setViewMode(mode)} 
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {t(mode as any)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50/20 dark:bg-black custom-scrollbar">
        <DragDropContext onDragEnd={handleDragEnd}>
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 h-full min-h-[500px] min-w-[700px] border-l border-slate-200 dark:border-slate-800">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2.5 text-center text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-[#0a0a0a] border-r border-b border-slate-200 dark:border-slate-800">{day}</div>
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
                                className={`min-h-[100px] p-1.5 border-r border-b border-slate-200 dark:border-slate-800 transition-all group ${!item.currentMonth ? 'bg-slate-100/30 dark:bg-white/[0.01] opacity-20' : 'bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-white/[0.02]'} ${today ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : ''} ${snapshot.isDraggingOver ? 'ring-2 ring-inset ring-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-900/10' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg transition-all ${today ? 'bg-white text-black shadow-lg scale-110' : item.currentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-700'}`}>{item.day}</span>
                                <button onClick={() => onAddTaskOnDate(dateId)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all"><Plus size={14} /></button>
                              </div>
                              <div className="space-y-1">
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
              <div className="flex flex-col h-full min-w-[800px]">
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] sticky top-0 z-10 shadow-sm">
                  {weekDays.map((date, idx) => (
                    <div key={idx} className={`p-3 border-r border-slate-200 dark:border-slate-800 text-center transition-colors ${isToday(date) ? 'bg-zinc-100/40 dark:bg-zinc-800/20' : ''}`}>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                      <p className={`text-base font-black w-9 h-9 flex items-center justify-center mx-auto rounded-xl transition-all ${isToday(date) ? 'bg-white dark:bg-zinc-200 text-black shadow-sm' : 'text-slate-900 dark:text-white'}`}>{date.getDate()}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 flex-1 min-h-[500px]">
                  {weekDays.map((date, idx) => {
                    const dateTasks = getTasksForDate(date);
                    const dateId = formatLocalDate(date);
                    return (
                      <Droppable key={idx} droppableId={dateId}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-2 border-r border-slate-200 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors ${isToday(date) ? 'bg-zinc-50/30 dark:bg-zinc-900/10' : ''} ${snapshot.isDraggingOver ? 'bg-indigo-50/10 dark:bg-indigo-900/10 ring-2 ring-inset ring-indigo-500/10' : ''}`}
                          >
                            <div className="space-y-2">
                              {dateTasks.map((task, taskIdx) => (
                                <Draggable key={task.id} draggableId={task.id} index={taskIdx}>
                                  {(dragProvided, dragSnapshot) => (
                                    <div 
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      onClick={() => onEditTask(task)} 
                                      className={`bg-white dark:bg-[#121212] p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all ${dragSnapshot.isDragging ? 'z-[100] shadow-2xl ring-2 ring-indigo-500 scale-105' : ''}`}
                                    >
                                         <div className="w-full h-1 rounded-full mb-2" style={{ backgroundColor: data.columns[task.status]?.color || '#555' }} />
                                         <p className="text-[11px] font-black text-slate-900 dark:text-white leading-tight mb-2 line-clamp-3">{task.title}</p>
                                         <div className="flex items-center justify-between opacity-80 scale-90 origin-left">
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