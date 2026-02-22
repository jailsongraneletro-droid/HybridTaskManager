import { useState, useEffect } from 'react';
import { User } from '../types';

interface UsageStats {
  todayMinutes: number;
  weekMinutes: number;
  lastDayUsage: DailyUsage[];
}

interface DailyUsage {
  date: string;
  minutes: number;
}

/**
 * Hook para rastrear tempo de uso do app
 * Monitora quantos minutos o usuário usou hoje e esta semana
 */
export const useTimeTracking = (user: User | null) => {
  const [usage, setUsage] = useState<UsageStats>({
    todayMinutes: 0,
    weekMinutes: 0,
    lastDayUsage: [],
  });

  const [isLimitExceeded, setIsLimitExceeded] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Calcula tempo de uso local (apenas nesta sessão)
    // Nota: Para rastreamento real, você precisa salvar no Supabase
    const startTime = Date.now();
    const trackingInterval = setInterval(() => {
      const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);

      // Verifica limite diário
      if (user.maxDailyMinutes && elapsedMinutes > user.maxDailyMinutes) {
        setIsLimitExceeded(true);
      }

      setUsage(prev => ({
        ...prev,
        todayMinutes: elapsedMinutes,
      }));
    }, 1000); // Atualiza a cada segundo

    return () => clearInterval(trackingInterval);
  }, [user]);

  return { usage, isLimitExceeded };
};

/**
 * Registra tempo de uso no Supabase
 */
export async function logUserUsageSession(userId: string, minutes: number): Promise<void> {
  try {
    // TODO: Implementar com supabase quando AdminService estiver pronto
    console.log(`Usuário ${userId} usou ${minutes} minutos`);
  } catch (error) {
    console.error('Erro ao registrar uso:', error);
  }
}
