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
                backgroundColor: snapshot.isDragging ? col?.color : `${col?.color}15`, 
                borderLeft: `3px solid ${col?.color}` 
            }} 
            className={`px-2 py-1 rounded-md text-[10px] font-bold truncate cursor-pointer hover:brightness-95 transition-all shadow-sm border border-slate-200/50 dark:border-slate-700/50 mb-0.5 flex items-center gap-1.5 ${snapshot.isDragging ? 'text-white z-[100]' : 'text-slate-700 dark:text-slate-200'}`}
          >
            <span className={`w-1 h-1 rounded-full shrink-0 ${snapshot.isDragging ? 'bg-white' : ''}`} style={{ backgroundColor: snapshot.isDragging ? undefined : col?.color }}></span>
            <span className="truncate">{task.title}</span>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><CalendarIcon size={20} /></div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
          </div>
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">{t('todayView')}</button>
            <button onClick={() => navigateDate(1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
          {(['month', 'week', 'day'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{t(mode as any)}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50/30 dark:bg-slate-950/30">
        <DragDropContext onDragEnd={handleDragEnd}>
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 h-full min-h-[600px] border-l border-slate-100 dark:border-slate-800">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-3 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest bg-white dark:bg-slate-900 border-r border-b border-slate-100 dark:border-slate-800">{day}</div>
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
                                className={`min-h-[120px] p-2 border-r border-b border-slate-100 dark:border-slate-800 transition-all group ${!item.currentMonth ? 'bg-slate-50/40 dark:bg-slate-950/20 opacity-40' : 'bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'} ${today ? 'bg-indigo-50/10 dark:bg-indigo-900/10' : ''} ${snapshot.isDraggingOver ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/30' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg ${today ? 'bg-indigo-600 text-white shadow-lg' : item.currentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-700'}`}>{item.day}</span>
                                <button onClick={() => onAddTaskOnDate(dateId)} className="opacity-0 group-hover:opacity-100 p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-all"><Plus size={12} /></button>
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
              <div className="flex flex-col h-full min-w-[800px]">
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                  {weekDays.map((date, idx) => (
                    <div key={idx} className={`p-4 border-r border-slate-200 dark:border-slate-800 text-center ${isToday(date) ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                      <p className={`text-xl font-black w-10 h-10 flex items-center justify-center mx-auto rounded-xl ${isToday(date) ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300'}`}>{date.getDate()}</p>
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
                            className={`p-3 border-r border-slate-100 dark:border-slate-800 group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${isToday(date) ? 'bg-indigo-50/5' : ''} ${snapshot.isDraggingOver ? 'bg-indigo-50/30 dark:bg-indigo-900/30 ring-1 ring-inset ring-indigo-500' : ''}`}
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
                                      className={`bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-pointer transition-all ${dragSnapshot.isDragging ? 'z-[100] shadow-2xl ring-2 ring-indigo-500' : ''}`}
                                    >
                                         <div className="w-full h-1 rounded-full mb-2" style={{ backgroundColor: data.columns[task.status]?.color }} />
                                         <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2">{task.title}</p>
                                         <div className="flex items-center justify-between"><span className="text-[8px] font-black text-slate-400 uppercase">{data.priorities.find(p => p.id === task.priority)?.title}</span><Avatar size="sm" name={data.assignees.find(a => a.id === task.assigneeId)?.name || '?'} /></div>
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

        {viewMode === 'day' && (
          <div className="p-8 h-full bg-slate-50/50 dark:bg-slate-950/50">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest mb-0.5">{currentDate.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                  <span className="text-3xl font-black">{currentDate.getDate()}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                  <p className="text-slate-500 font-bold text-sm mt-1">{getTasksForDate(currentDate).length} {t('activeTasks')} para hoje</p>
                </div>
                <button onClick={() => onAddTaskOnDate(formatLocalDate(currentDate))} className="ml-auto w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg active:scale-95 glow-effect"><Plus size={24} /></button>
              </div>
              <div className="space-y-3">
                {getTasksForDate(currentDate).length === 0 ? (
                  <div className="text-center p-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-300"><p className="text-sm font-bold opacity-50 uppercase tracking-widest">Nada planejado para hoje</p></div>
                ) : (
                  getTasksForDate(currentDate).map(task => {
                    const col = data.columns[task.status];
                    return (
                      <div key={task.id} onClick={() => onEditTask(task)} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex items-center gap-4">
                        <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: col?.color }} />
                        <div className="flex-1"><h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{task.title}</h4><p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{task.description}</p></div>
                        <Avatar size="md" name={data.assignees.find(a => a.id === task.assigneeId)?.name || '?'} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};