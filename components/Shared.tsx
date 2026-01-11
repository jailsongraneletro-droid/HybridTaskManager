import React from 'react';
import { Priority } from '../types';
import { 
  Clock, AlertCircle, CheckCircle2, Circle, AlertTriangle, 
  Calendar, User as UserIcon
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const PriorityBadge = ({ priority }: { priority?: Priority }) => {
  if (!priority) {
      return <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 uppercase tracking-widest">Nenhuma</span>;
  }

  return (
    <span 
      className="px-1.5 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-widest"
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
      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] border w-fit font-bold"
      style={{ 
        backgroundColor: `${color}10`,
        color: color,
        borderColor: `${color}20`
      }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
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
      className={`flex items-center gap-1 text-[9px] ${isOld ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-slate-500 font-medium'}`} 
    >
      <Clock size={10} />
      <span>{days === 0 ? t('today') : `${days} ${t('daysOld')}`}</span>
    </div>
  );
};

export const Avatar = ({ url, name, size = 'sm', onClick }: { url?: string; name: string; size?: 'sm' | 'md'; onClick?: () => void }) => {
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[10px]';
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
      className={`${sizeClasses} ${clickableClass} rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black border border-indigo-200 dark:border-indigo-800`} 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight uppercase">{title}</h2>
          <button onClick={onClose} className="relative p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white/50 dark:bg-slate-800 rounded-lg group">
             <Circle size={16} className="fill-current opacity-10" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-base leading-none">×</div>
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-red-500">
             <AlertTriangle size={24} />
             <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium">
            {message}
          </p>
          <div className="flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-all">{t('cancel')}</button>
             <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-lg transition-all active:scale-95">{t('confirm')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};