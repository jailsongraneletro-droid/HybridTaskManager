import React from 'react';
import { Priority } from '../types';
import { 
  Clock, AlertCircle, CheckCircle2, Circle, AlertTriangle, 
  Calendar, User as UserIcon
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';

export const PriorityBadge = ({ priority }: { priority?: Priority }) => {
  // Fallback if priority is deleted or undefined
  if (!priority) {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">None</span>;
  }

  return (
    <span 
      className="px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: priority.color,
        borderColor: `${priority.color}80`, // darken border slightly
        color: '#475569' // slate-600 for text contrast usually works on light pastels
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
        backgroundColor: `${color}15`, // 10% opacity
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
    // Calculate difference in milliseconds
    const diffTime = now.getTime() - created.getTime();
    
    // Ensure we don't return negative if system clock is slightly off
    if (diffTime < 0) return 0;

    // Use Math.floor to get full days elapsed. 
    // Tasks created today (less than 24h ago) will be 0.
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = calculateAge(createdAt);
  const isOld = days >= 5;

  return (
    <div 
      className={`flex items-center gap-1 text-xs ${isOld ? 'text-red-600 font-bold' : 'text-slate-400'}`} 
      title={`Created on ${new Date(createdAt).toLocaleDateString()}`}
    >
      <Clock size={12} className={isOld ? 'text-red-600' : ''} />
      <span>{days === 0 ? t('today') : `${days} ${t('daysOld')}`}</span>
    </div>
  );
};

export const Avatar = ({ url, name, size = 'sm' }: { url?: string; name: string; size?: 'sm' | 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  
  if (url) {
    return <img src={url} alt={name} className={`${sizeClasses} rounded-full object-cover border border-slate-200`} title={name} />;
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border border-indigo-200`} title={name}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[80vh]">
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-red-600">
             <div className="p-2 bg-red-100 rounded-full">
               <AlertTriangle size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          </div>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex justify-end gap-3">
             <button 
               onClick={onClose}
               className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
             >
               {t('cancel')}
             </button>
             <button 
               onClick={() => { onConfirm(); onClose(); }}
               className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-md shadow-red-200 transition-colors"
             >
               {t('confirm')}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};