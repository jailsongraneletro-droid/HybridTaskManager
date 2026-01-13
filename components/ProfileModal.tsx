
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Modal } from './Shared';
import { useLanguage } from '../utils/i18n';
import { User as UserIcon, Mail, Lock, Image as ImageIcon, Camera, LogOut } from 'lucide-react';
import { DataService } from '../services/dataService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (userId: string, data: Partial<User>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const { t } = useLanguage();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [password, setPassword] = useState(user.password || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setName(user.name);
        setEmail(user.email);
        setAvatar(user.avatar || '');
        setPassword(user.password || '');
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(user.id, { name, email, avatar, password });
    onClose();
  };

  const handleLogout = async () => {
    await DataService.logout();
    window.location.href = '/';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profileSettings')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Avatar Selection */}
        <div className="flex flex-col items-center gap-4 py-2 border-b border-slate-100 dark:border-slate-800 pb-6 mb-2">
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-sm" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border-4 border-slate-50 dark:border-slate-900">
                        <ImageIcon size={32} />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                </div>
            </div>
            
            <div className="flex gap-4">
                 <button 
                    type="button" 
                    onClick={triggerFileInput}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                    <Camera size={14} />
                    {t('uploadPhoto')}
                </button>
                {avatar && (
                     <button 
                        type="button" 
                        onClick={() => setAvatar('')}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700"
                    >
                        {t('removePhoto')}
                    </button>
                )}
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />

             <div className="relative w-full">
                <label className="block text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('orPasteUrl')}</label>
                <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                        type="text" 
                        value={avatar}
                        onChange={e => setAvatar(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-[11px]"
                        placeholder="https://..."
                    />
                </div>
            </div>
        </div>

        {/* Name */}
        <div className="relative">
            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('name')}</label>
            <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-[11px]"
                    required
                />
            </div>
        </div>

        {/* Email */}
        <div className="relative">
            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('email')}</label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-[11px]"
                    required
                />
            </div>
        </div>

         {/* Password */}
         <div className="relative">
            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('password')}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-[11px]"
                    placeholder="Deixe em branco para manter"
                />
            </div>
        </div>

        <div className="pt-6 flex flex-col gap-2">
            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg active:scale-95 transition-all">
                {t('updateProfile')}
            </button>
            <button 
              type="button" 
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              {t('logout')}
            </button>
        </div>
      </form>
    </Modal>
  );
};
