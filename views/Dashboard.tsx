import React from 'react';
import { BoardData, Task } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { CheckCircle, AlertTriangle, Activity, Layers, BarChart3 } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface DashboardProps {
  data: BoardData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  // Garantir que temos dados antes de tentar renderizar para evitar erro no dashboard
  if (!data || !data.columnOrder || data.columnOrder.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Aguardando dados...</p>
      </div>
    );
  }

  const tasks = Object.values(data.tasks) as Task[];
  const doneId = data.columnOrder.find(id => data.columns[id]?.title.toLowerCase().includes('concl')) || 'Done';
  
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === doneId).length,
    overdue: tasks.filter(t => t.status !== doneId && t.dueDate && new Date(t.dueDate).getTime() < new Date().setHours(0,0,0,0)).length
  };

  const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const statusData = data.columnOrder.map(id => ({ 
    name: data.columns[id]?.title || id, 
    value: tasks.filter(t => t.status === id).length, 
    color: data.columns[id]?.color || '#6366f1' 
  }));
  
  const priorityData = data.priorities.map(p => ({ 
    name: p.title, 
    count: tasks.filter(t => t.priority === p.id).length 
  }));

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white dark:bg-[#0a0a0a] p-3.5 rounded-xl border border-slate-200 dark:border-[#1a1a1a] shadow-sm flex flex-col justify-between group">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-1.5 rounded-lg ${color} text-white shadow-sm`}><Icon size={14} /></div>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{value}</h3>
        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-600 mt-1 uppercase">{subtext}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Taxa de Conclusão" value={`${rate}%`} icon={CheckCircle} color="bg-emerald-600" subtext={`${stats.done} concluidas`} />
        <StatCard title="Atrasadas" value={stats.overdue} icon={AlertTriangle} color="bg-rose-600" subtext="Requer atenção" />
        <StatCard title="Carga Total" value={stats.total} icon={Activity} color="bg-indigo-600" subtext="Tarefas no fluxo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-slate-200 dark:border-[#1a1a1a] shadow-sm h-60">
          <h3 className="text-[10px] font-black uppercase mb-4 text-slate-800 dark:text-white flex items-center gap-1.5"><Layers size={12} /> Status</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={statusData} innerRadius={40} outerRadius={60} dataKey="value" animationDuration={800}>
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip 
                contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', fontSize: '9px', borderRadius: '8px'}} 
                itemStyle={{color: '#ffffff'}}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-slate-200 dark:border-[#1a1a1a] shadow-sm h-60">
          <h3 className="text-[10px] font-black uppercase mb-4 text-slate-800 dark:text-white flex items-center gap-1.5"><BarChart3 size={12} /> Prioridades</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={priorityData}>
              <XAxis dataKey="name" tick={{fontSize: 8, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', fontSize: '9px', borderRadius: '8px'}} 
                itemStyle={{color: '#ffffff'}}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};