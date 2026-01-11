import React from 'react';
import { BoardData, Task } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle, AlertTriangle, TrendingUp, Activity, Layers, BarChart3 } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface DashboardProps {
  data: BoardData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const tasks = Object.values(data.tasks) as Task[];
  
  const doneColumnId = data.columnOrder.find(id => {
      const colTitle = data.columns[id].title.toLowerCase().trim();
      return ['done', 'concluído', 'concluido', 'finalizado', 'complete', 'completed'].includes(colTitle);
  }) || (data.columnOrder.length > 0 ? data.columnOrder[data.columnOrder.length - 1] : 'Done');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === doneColumnId).length;
  const overdueTasks = tasks.filter(t => {
      if (t.status === doneColumnId) return false;
      if (!t.dueDate) return false;
      const today = new Date().setHours(0,0,0,0);
      return new Date(t.dueDate).getTime() < today;
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusData = data.columnOrder.map(colId => {
      const col = data.columns[colId];
      return { name: col.title, value: tasks.filter(t => t.status === colId).length, color: col.color };
  });

  const priorityData = data.priorities.map(prio => ({
      name: prio.title, count: tasks.filter(t => t.priority === prio.id).length
  }));

  const StatCard = ({ title, value, icon: Icon, color, subtext, trend }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${color} shadow-md text-white group-hover:scale-105 transition-transform`}><Icon size={18} /></div>
        {trend && <div className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1"><TrendingUp size={10} /> {trend}</div>}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{value}</h3>
        {subtext && <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t('completionRate')} value={`${completionRate}%`} icon={CheckCircle} color="bg-gradient-to-br from-green-400 to-emerald-600" subtext={`${completedTasks} de ${totalTasks} finalizadas`} trend="+5%" />
        <StatCard title={t('overdueTasks')} value={overdueTasks} icon={AlertTriangle} color="bg-gradient-to-br from-rose-400 to-red-600" subtext={t('pastDue')} />
        <StatCard title={t('totalWorkload')} value={totalTasks} icon={Activity} color="bg-gradient-to-br from-indigo-400 to-violet-600" subtext={t('activeTasks')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[350px]">
          <div className="flex items-center gap-2 mb-6"><div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg"><Layers size={16} /></div><h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">{t('taskStatusDist')}</h3></div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" animationDuration={1000}>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', background: '#ffffff', color: '#1e293b', fontSize: '10px' }} />
                <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ paddingTop: '10px', fontWeight: 'bold', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[350px]">
          <div className="flex items-center gap-2 mb-6"><div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"><BarChart3 size={16} /></div><h3 className="text-base font-black text-slate-800 dark:text-white tracking-tight">{t('tasksByPriority')}</h3></div>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 500 }} />
                <Tooltip cursor={{fill: 'rgba(99, 102, 241, 0.05)', radius: 8}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', background: '#ffffff', fontSize: '10px' }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={36} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};