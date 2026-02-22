import { supabase } from '../utils/supabaseClient';
import { User, UserRole } from '../types';

/**
 * Serviço para gerenciar usuários no painel admin
 */

export const AdminService = {
  mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name || row.full_name || 'Sem nome',
      email: row.email || '',
      avatar: row.avatar || null,
      role: (row.role === 'admin' ? UserRole.ADMIN : UserRole.USER),
      isActive: row.is_active ?? true,
      maxDailyMinutes: row.max_daily_minutes ?? null,
      maxWeeklyMinutes: row.max_weekly_minutes ?? null,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    };
  },

  /**
   * Lista todos os usuários (apenas admin pode fazer isso)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (userProfilesError) throw userProfilesError;

      if (userProfiles && userProfiles.length > 0) {
        return userProfiles.map((row) => this.mapRowToUser(row));
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      return (profiles || []).map((row) => this.mapRowToUser(row));

    } catch (error) {
      console.error('Erro ao listar usuários:', error);

      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        return (profiles || []).map((row) => this.mapRowToUser(row));
      } catch (fallbackError) {
        console.error('Erro no fallback de usuários:', fallbackError);
        throw fallbackError;
      }
    }
  },

  /**
   * Atualiza role de um usuário (apenas admin)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const payload = { role };
      const { data, error } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.mapRowToUser(data);
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      throw error;
    }
  },

  /**
   * Atualiza status ativo/inativo de um usuário
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.mapRowToUser(data);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  /**
   * Atualiza limites de tempo de um usuário
   */
  async updateUserLimits(
    userId: string,
    maxDailyMinutes: number | null,
    maxWeeklyMinutes: number | null
  ): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          max_daily_minutes: maxDailyMinutes,
          max_weekly_minutes: maxWeeklyMinutes,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.mapRowToUser(data);
    } catch (error) {
      console.error('Erro ao atualizar limites:', error);
      throw error;
    }
  },

  /**
   * Remove um usuário completamente
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Nota: Você pode querer fazer soft delete ao invés de hard delete
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  },

  /**
   * Obtém estatísticas de uso de um usuário
   */
  async getUserUsageStats(userId: string): Promise<{
    todayMinutes: number;
    weekMinutes: number;
    monthMinutes: number;
  }> {
    try {
      // Busca registro de uso do usuário
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('user_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString());

      if (error) throw error;

      let todayMinutes = 0;
      let weekMinutes = 0;
      let monthMinutes = 0;

      const today = new Date().toDateString();

      data?.forEach((log: any) => {
        const logDate = new Date(log.created_at).toDateString();
        monthMinutes += log.minutes || 0;

        if (logDate === today) {
          todayMinutes += log.minutes || 0;
        }

        const logWeekAgo = new Date(log.created_at);
        if (logWeekAgo > weekAgo) {
          weekMinutes += log.minutes || 0;
        }
      });

      return { todayMinutes, weekMinutes, monthMinutes };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { todayMinutes: 0, weekMinutes: 0, monthMinutes: 0 };
    }
  },

  /**
   * Registra tempo de uso do usuário
   */
  async logUserUsage(userId: string, minutes: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_usage_logs')
        .insert({
          user_id: userId,
          minutes,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao registrar uso:', error);
    }
  },

  /**
   * Obtém estatísticas gerais do sistema
   */
  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalTasks: number;
    totalNotes: number;
  }> {
    try {
      const [{ data: users }, { data: tasks }, { data: notes }] = await Promise.all([
        supabase.from('user_profiles').select('id, is_active'),
        supabase.from('tasks').select('id'),
        supabase.from('notes').select('id'),
      ]);

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.is_active)?.length || 0;
      const inactiveUsers = totalUsers - activeUsers;
      const totalTasks = tasks?.length || 0;
      const totalNotes = notes?.length || 0;

      return { totalUsers, activeUsers, inactiveUsers, totalTasks, totalNotes };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, totalTasks: 0, totalNotes: 0 };
    }
  },
};
