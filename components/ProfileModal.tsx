import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Modal } from './Shared';
import { useLanguage } from '../utils/i18n';
import { User as UserIcon, Mail, Lock, Image as ImageIcon, Camera } from 'lucide-react';

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
        <div className="flex flex-col items-center gap-4 py-2 border-b border-slate-100 pb-6 mb-2">
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-slate-50">
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
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700 hover:underline flex items-center gap-1"
                >
                    <Camera size={16} />
                    {t('uploadPhoto')}
                </button>
                {avatar && (
                     <button 
                        type="button" 
                        onClick={() => setAvatar('')}
                        className="text-sm text-red-500 font-medium hover:text-red-700 hover:underline"
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
                <label className="block text-xs font-semibold text-slate-500 mb-1">{t('orPasteUrl')}</label>
                <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        value={avatar}
                        onChange={e => setAvatar(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                        placeholder="https://..."
                    />
                </div>
            </div>
        </div>

        {/* Name */}
        <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t('name')}</label>
            <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>
        </div>

        {/* Email */}
        <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t('email')}</label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />
            </div>
        </div>

         {/* Password */}
         <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t('password')}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter new password"
                />
            </div>
        </div>

        <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200">
                {t('updateProfile')}
            </button>
        </div>
      </form>
    </Modal>
  );
};