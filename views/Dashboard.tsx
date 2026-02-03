
import React, { useMemo } from 'react';
import { BoardData, Task } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle, AlertTriangle, Activity, Layers, BarChart3, Users, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface DashboardProps {
  data: BoardData;
  onEditTask: (task: Task) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onEditTask }) => {
  const { t } = useLanguage();
  
  if (!data || !data.columnOrder || data.columnOrder.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Aguardando dados...</p>
      </div>
    );
  }

  const tasks = Object.values(data.tasks) as Task[];
  const doneId = data.columnOrder.find(id => {
    const title = data.columns[id]?.title?.toLowerCase() || '';
    return /conclu|done/.test(title);
  }) || data.columnOrder[data.columnOrder.length - 1] || 'Done';
  
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === doneId).length,
    overdue: tasks.filter(t => t.status !== doneId && t.dueDate && new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0)).length,
    upcoming: tasks.filter(t => t.status !== doneId && t.dueDate && new Date(t.dueDate).getTime() >= new Date().setHours(0,0,0,0) && new Date(t.dueDate).getTime() <= new Date().getTime() + (3 * 24 * 60 * 60 * 1000)).length
  };

  const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const statusData = data.columnOrder.map(id => ({ 
    name: data.columns[id]?.title || id, 
    value: tasks.filter(t => t.status === id).length, 
    color: data.columns[id]?.color || '#6366f1' 
  }));
  
  const assigneeWorkload = useMemo(() => {
    return data.assignees.map(a => ({
      name: a.name.split(' ')[0],
      tasks: tasks.filter(t => t.assigneeId === a.id).length,
      done: tasks.filter(t => t.assigneeId === a.id && t.status === doneId).length
    })).filter(a => a.tasks > 0);
  }, [tasks, data.assignees, doneId]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tasks]);

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white dark:bg-[#1a1d21] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#2a2f36] shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${color} text-white shadow-md ring-1 ring-white/10`}><Icon size={16} /></div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1.5">{value}</h3>
        <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5 uppercase tracking-tight">{subtext}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{t('projectOverview')}</p>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">Visão geral do projeto</h2>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-500 dark:text-slate-500">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#24282d] border border-slate-200 dark:border-[#2a2f36]">{stats.total} tarefas</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#24282d] border border-slate-200 dark:border-[#2a2f36]">{stats.done} concluídas</span>
        </div>
      </div>
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <StatCard title="Conclusão" value={`${rate}%`} icon={CheckCircle} color="bg-emerald-500" subtext={`${stats.done} concluidas`} />
        <StatCard title="Atrasadas" value={stats.overdue} icon={AlertTriangle} color="bg-rose-500" subtext="Requer atenção" />
        <StatCard title="Próximas" value={stats.upcoming} icon={Clock} color="bg-amber-500" subtext="Vencem em 3 dias" />
        <StatCard title="Carga Total" value={stats.total} icon={Activity} color="bg-indigo-600" subtext="Total no fluxo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Distribuição por Status */}
        <div className="lg:col-span-1 bg-white dark:bg-[#1a1d21] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#2a2f36] shadow-sm">
          <h3 className="text-[10px] font-bold uppercase mb-6 text-slate-800 dark:text-white flex items-center gap-2"><Layers size={14} /> Distribuição de Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={50} outerRadius={70} dataKey="value" animationDuration={800} stroke="none">
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#1a1d21', border: '1px solid #2a2f36', fontSize: '10px', borderRadius: '8px', color: '#e9eef5'}} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {statusData.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}} />
                <span className="text-[9px] font-semibold text-slate-500 uppercase">{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Carga por Responsável */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1d21] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#2a2f36] shadow-sm">
          <h3 className="text-[10px] font-bold uppercase mb-6 text-slate-800 dark:text-white flex items-center gap-2"><Users size={14} /> Carga por Responsável</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeWorkload} layout="vertical" margin={{ left: -10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fontSize: 9, fill: '#aeb7c2', fontWeight: 600}} axisLine={false} tickLine={false} width={70} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                  contentStyle={{backgroundColor: '#1a1d21', border: '1px solid #2a2f36', fontSize: '10px', borderRadius: '8px', color: '#e9eef5'}} 
                />
                <Bar dataKey="tasks" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={12} name="Total" />
                <Bar dataKey="done" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} name="Concluídas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="bg-white dark:bg-[#1a1d21] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#2a2f36] shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold uppercase text-slate-800 dark:text-white flex items-center gap-2"><Clock size={14} /> Atividades Recentes</h3>
         </div>
         <div className="space-y-3">
            {recentTasks.length > 0 ? recentTasks.map(task => (
               <div 
                  key={task.id} 
                  onClick={() => onEditTask(task)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/70 dark:hover:bg-[#24282d] border border-transparent hover:border-slate-100 dark:hover:border-[#2a2f36] transition-all group cursor-pointer"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: data.columns[task.status]?.color}} />
                     <div>
                        <p className="text-[11px] font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{task.title}</p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{data.columns[task.status]?.title || task.status} • {new Date(task.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="hidden sm:block">
                        <span className="text-[9px] font-semibold text-slate-300 dark:text-slate-700 uppercase">{data.priorities.find(p => p.id === task.priority)?.title}</span>
                     </div>
                     <ArrowRight size={12} className="text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            )) : (
              <div className="text-center py-10 opacity-30">
                 <p className="text-[10px] font-semibold uppercase tracking-widest">Nenhuma atividade registrada</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
