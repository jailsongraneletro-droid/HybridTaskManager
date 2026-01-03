import React from 'react';
import { BoardData, Task, TaskStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
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

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} shadow-lg shadow-inner`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title={t('completionRate')}
          value={`${completionRate}%`} 
          icon={CheckCircle} 
          color="bg-green-500" 
          subtext={`${completedTasks} de ${totalTasks} ${t('completedTasks')}`}
        />
        <StatCard 
          title={t('overdueTasks')}
          value={overdueTasks} 
          icon={AlertTriangle} 
          color="bg-red-500" 
          subtext={t('pastDue')}
        />
        <StatCard 
          title={t('totalWorkload')}
          value={totalTasks} 
          icon={Clock} 
          color="bg-indigo-500" 
          subtext={t('activeTasks')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t('taskStatusDist')}</h3>
          <div className="flex-1 w-full relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">{t('tasksByPriority')}</h3>
          <div className="flex-1 w-full relative min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  allowDecimals={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#6366f1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
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