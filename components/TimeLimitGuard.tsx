import React from 'react';
import { AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { User } from '../types';
import { useTimeTracking } from '../services/usageTrackingService';

/**
 * Componente que bloqueia uso se limite excedido
 */
export const TimeLimitGuard: React.FC<{ user: User | null; children: React.ReactNode }> = ({ user, children }) => {
  const { isLimitExceeded } = useTimeTracking(user);

  if (!user) {
    return <>{children}</>;
  }

  if (isLimitExceeded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0b0d] dark:to-[#111315] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1d21] rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Limite de Tempo Excedido</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você atingiu seu limite diário de {user.maxDailyMinutes} minutos.
          </p>
          <p className="text-sm text-gray-500">
            Seu acesso será restaurado amanhã às 00:00.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Widget para exibir tempo restante
 */
export const TimeRemainingWidget: React.FC<{ user: User | null }> = ({ user }) => {
  const { usage } = useTimeTracking(user);

  if (!user || !user.maxDailyMinutes) {
    return null;
  }

  const minutesRemaining = user.maxDailyMinutes - usage.todayMinutes;
  const hoursRemaining = Math.floor(minutesRemaining / 60);
  const fmMinutesRemaining = minutesRemaining % 60;
  const percentageUsed = (usage.todayMinutes / user.maxDailyMinutes) * 100;

  return (
    <div className="bg-white dark:bg-[#1a1d21] rounded-xl p-4 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="text-indigo-600 dark:text-indigo-400" size={18} />
          <span className="font-semibold text-gray-900 dark:text-white">Tempo Restante Hoje</span>
        </div>
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
          {hoursRemaining}h {fmMinutesRemaining}m
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all ${
            percentageUsed > 80
              ? 'bg-red-600'
              : percentageUsed > 60
              ? 'bg-yellow-600'
              : 'bg-green-600'
          }`}
          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        {usage.todayMinutes} de {user.maxDailyMinutes} minutos usados
      </div>

      {minutesRemaining < 60 && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-400 text-xs">
          ⚠️ Você está perto do limite diário
        </div>
      )}
    </div>
  );
};