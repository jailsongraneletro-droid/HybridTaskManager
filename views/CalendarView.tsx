import React, { useState, useMemo } from 'react';
import { BoardData, Task } from '../types';
import { useLanguage } from '../utils/i18n';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Avatar } from '../components/Shared';

interface CalendarViewProps {
  data: BoardData;
  onEditTask: (task: Task) => void;
  onAddTaskOnDate: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ data, onEditTask, onAddTaskOnDate }) => {
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

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekDays = (startDate: Date) => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return d;
    });
  };

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    
    const days = [];
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }
    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => getWeekDays(getStartOfWeek(currentDate)), [currentDate]);

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + direction);
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() + (direction * 7));
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const getTasksForDate = (date: Date) => {
    return allTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
  };

  const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const col = data.columns[task.status];
    return (
      <div 
        onClick={() => onEditTask(task)}
        style={{ backgroundColor: `${col?.color}15`, borderLeft: `3px solid ${col?.color}` }}
        className="px-2 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 truncate cursor-pointer hover:brightness-95 transition-all shadow-sm border border-slate-200/50 mb-1 group flex items-center gap-2"
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: col?.color }}></span>
        <span className="truncate flex-1">{task.title}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarIcon size={22} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 min-w-[180px]">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-slate-50 border-r border-slate-100 transition-colors text-slate-500"><ChevronLeft size={18} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-xs font-bold hover:bg-slate-50 transition-colors text-slate-600">{t('todayView')}</button>
            <button onClick={() => navigateDate(1)} className="p-2 hover:bg-slate-50 border-l border-slate-100 transition-colors text-slate-500"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setViewMode('month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t('month')}
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t('week')}
          </button>
          <button 
            onClick={() => setViewMode('day')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t('day')}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 h-full min-h-[600px] border-l border-slate-100">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border-r border-b border-slate-100">
                {day}
              </div>
            ))}
            {monthData.map((item, idx) => {
              const dateTasks = getTasksForDate(item.date);
              return (
                <div 
                  key={idx} 
                  className={`min-h-[120px] p-2 border-r border-b border-slate-100 transition-all relative group ${!item.currentMonth ? 'bg-slate-50/40 opacity-60' : 'bg-white hover:bg-slate-50/50'} ${isToday(item.date) ? 'bg-indigo-50/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all ${isToday(item.date) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : item.currentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                      {item.day}
                    </span>
                    <button 
                      onClick={() => onAddTaskOnDate(formatLocalDate(item.date))}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    {dateTasks.slice(0, 4).map(task => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                    {dateTasks.length > 4 && (
                      <div className="text-[10px] font-black text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full w-fit">
                        + {dateTasks.length - 4} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="flex flex-col h-full min-w-[800px]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
              {weekDays.map((date, idx) => (
                <div key={idx} className={`p-4 border-r border-slate-200 text-center ${isToday(date) ? 'bg-indigo-50/30' : ''}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </p>
                  <p className={`text-xl font-black rounded-2xl w-12 h-12 flex items-center justify-center mx-auto transition-all ${isToday(date) ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110' : 'text-slate-700 hover:bg-slate-100'}`}>
                    {date.getDate()}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1 min-h-[500px] bg-slate-50/30">
              {weekDays.map((date, idx) => {
                const dateTasks = getTasksForDate(date);
                return (
                  <div key={idx} className={`p-4 border-r border-slate-100 min-h-full transition-colors relative group hover:bg-slate-100/20 ${isToday(date) ? 'bg-indigo-50/10' : ''}`}>
                    <div className="flex justify-center mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => onAddTaskOnDate(formatLocalDate(date))}
                        className="p-2 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-100 hover:scale-110 active:scale-95 transition-all"
                       >
                         <Plus size={18} />
                       </button>
                    </div>
                    <div className="space-y-3">
                      {dateTasks.map(task => (
                        <div 
                            key={task.id} 
                            onClick={() => onEditTask(task)}
                            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 cursor-pointer transition-all animate-in zoom-in-95"
                        >
                             <div className="w-full h-1.5 rounded-full mb-3" style={{ backgroundColor: data.columns[task.status]?.color }} />
                             <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight mb-3">{task.title}</p>
                             <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{data.priorities.find(p => p.id === task.priority)?.title}</span>
                                <Avatar size="sm" name={data.assignees.find(a => a.id === task.assigneeId)?.name || '?'} />
                             </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="p-8 h-full">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="w-24 h-24 bg-indigo-600 rounded-[1.5rem] flex flex-col items-center justify-center text-white shadow-2xl shadow-indigo-100 animate-in slide-in-from-left-4">
                  <span className="text-xs font-bold uppercase tracking-widest mb-1">{currentDate.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                  <span className="text-4xl font-black">{currentDate.getDate()}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">{currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                  <p className="text-slate-500 font-bold mt-1 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    {getTasksForDate(currentDate).length} {t('activeTasks')} para hoje
                  </p>
                </div>
                <button 
                  onClick={() => onAddTaskOnDate(formatLocalDate(currentDate))}
                  className="ml-auto w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                  <Plus size={28} />
                </button>
              </div>

              <div className="space-y-4">
                {getTasksForDate(currentDate).length === 0 ? (
                  <div className="text-center p-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-300 flex flex-col items-center">
                    <CalendarIcon size={64} className="mb-4 opacity-10" />
                    <p className="text-lg font-bold text-slate-400">Tudo limpo por aqui!</p>
                    <p className="text-sm">Que tal planejar algo novo para hoje?</p>
                  </div>
                ) : (
                  getTasksForDate(currentDate).map(task => {
                    const col = data.columns[task.status];
                    return (
                      <div 
                        key={task.id} 
                        onClick={() => onEditTask(task)}
                        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-50 hover:-translate-y-1 transition-all cursor-pointer group flex items-center gap-6 animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: col?.color }} />
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors text-lg">{task.title}</h4>
                          <p className="text-sm text-slate-400 line-clamp-1 italic">{task.description || 'Sem descrição detalhada'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-xl border" style={{ color: col?.color, borderColor: `${col?.color}30`, backgroundColor: `${col?.color}05` }}>
                            {col?.title}
                           </span>
                           <Avatar size="md" name={data.assignees.find(a => a.id === task.assigneeId)?.name || '?'} />
                        </div>
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