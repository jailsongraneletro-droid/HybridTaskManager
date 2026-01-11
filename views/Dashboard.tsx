
import React from 'react';
import { BoardData, Task, TaskStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
// Added BarChart3 to imports
import { CheckCircle, AlertTriangle, Clock, TrendingUp, Activity, Layers, BarChart3 } from 'lucide-react';
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
      const due = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      const dueDateObj = new Date(due);
      dueDateObj.setHours(0,0,0,0); 
      return dueDateObj.getTime() < today.getTime();
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusData = data.columnOrder.map(colId => {
      const col = data.columns[colId];
      return {
          name: col.title,
          value: tasks.filter(t => t.status === colId).length,
          color: col.color
      };
  });

  const priorityData = data.priorities.map(prio => ({
      name: prio.title,
      count: tasks.filter(t => t.priority === prio.id).length
  }));

  const StatCard = ({ title, value, icon: Icon, color, subtext, trend }: any) => (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-inner text-white group-hover:scale-110 transition-transform`}>
          <Icon size={28} />
        </div>
        {trend && (
           <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
             <TrendingUp size={12} /> {trend}
           </div>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h3>
        {subtext && <p className="text-xs font-bold text-slate-400 mt-3 flex items-center gap-1.5 opacity-80">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title={t('completionRate')}
          value={`${completionRate}%`} 
          icon={CheckCircle} 
          color="bg-gradient-to-br from-green-400 to-emerald-600" 
          subtext={`${completedTasks} de ${totalTasks} finalizadas`}
          trend="+5%"
        />
        <StatCard 
          title={t('overdueTasks')}
          value={overdueTasks} 
          icon={AlertTriangle} 
          color="bg-gradient-to-br from-rose-400 to-red-600" 
          subtext={t('pastDue')}
        />
        <StatCard 
          title={t('totalWorkload')}
          value={totalTasks} 
          icon={Activity} 
          color="bg-gradient-to-br from-indigo-400 to-violet-600" 
          subtext={t('activeTasks')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Layers size={20} /></div>
             <h3 className="text-xl font-black text-slate-800 tracking-tight">{t('taskStatusDist')}</h3>
          </div>
          <div className="flex-1 w-full relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><BarChart3 size={20} /></div>
             <h3 className="text-xl font-black text-slate-800 tracking-tight">{t('tasksByPriority')}</h3>
          </div>
          <div className="flex-1 w-full relative min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  allowDecimals={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 12}} 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)" 
                  radius={[12, 12, 0, 0]} 
                  barSize={50}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
