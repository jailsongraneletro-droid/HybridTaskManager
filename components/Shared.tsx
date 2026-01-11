import React from 'react';
import { Priority } from '../types';
import { 
  Clock, AlertCircle, CheckCircle2, Circle, AlertTriangle, 
  Calendar, User as UserIcon
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const PriorityBadge = ({ priority }: { priority?: Priority }) => {
  if (!priority) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">Nenhuma</span>;
  }

  return (
    <span 
      className="px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: priority.color,
        borderColor: `${priority.color}80`,
        color: '#1e293b'
      }}
    >
      {priority.title}
    </span>
  );
};

export const StatusBadge = ({ status, color = '#64748b' }: { status: string; color?: string }) => {
  return (
    <div 
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm border w-fit"
      style={{ 
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`
      }}
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span>{status}</span>
    </div>
  );
};

export const TaskAge = ({ createdAt }: { createdAt: string }) => {
  const { t } = useLanguage();
  
  const calculateAge = (dateStr: string) => {
    const created = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = calculateAge(createdAt);
  const isOld = days >= 5;

  return (
    <div 
      className={`flex items-center gap-1 text-xs ${isOld ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`} 
      title={`Criado em ${new Date(createdAt).toLocaleDateString()}`}
    >
      <Clock size={12} className={isOld ? 'text-red-500' : ''} />
      <span>{days === 0 ? t('today') : `${days} ${t('daysOld')}`}</span>
    </div>
  );
};

export const Avatar = ({ url, name, size = 'sm', onClick }: { url?: string; name: string; size?: 'sm' | 'md'; onClick?: () => void }) => {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  const clickableClass = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';
  
  if (url) {
    return (
      <img 
        src={url} 
        alt={name} 
        className={`${sizeClasses} ${clickableClass} rounded-full object-cover border border-slate-200 dark:border-slate-700`} 
        title={name} 
        onClick={onClick}
      />
    );
  }

  return (
    <div 
      className={`${sizeClasses} ${clickableClass} rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-800`} 
      title={name}
      onClick={onClick}
    >
      {name.charAt(0)}
    </div>
  );
};

interface ModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode; 
  title: string; 
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h2>
          <button onClick={onClose} className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white/50 dark:bg-slate-800 rounded-lg group">
             <Circle size={20} className="fill-current opacity-20" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg leading-none">×</div>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[85vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-5 text-red-500">
             <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
               <AlertTriangle size={32} />
             </div>
             <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
            {message}
          </p>
          <div className="flex justify-end gap-4">
             <button 
               onClick={onClose}
               className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
             >
               {t('cancel')}
             </button>
             <button 
               onClick={() => { onConfirm(); onClose(); }}
               className="px-6 py-2.5 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-lg shadow-red-100 dark:shadow-red-900/40 transition-all active:scale-95"
             >
               {t('confirm')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};