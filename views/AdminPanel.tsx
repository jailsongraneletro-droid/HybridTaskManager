import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, LogOut, Search, Filter, Edit2, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { DataService } from '../services/dataService';
import { User, UserRole } from '../types';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
}

interface EditingUser extends User {
  isEditing?: boolean;
}

export const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [users, setUsers] = useState<EditingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeUsers: 0, totalTasks: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Carrega todos os usuários (neste caso, vamos simular)
      // Em produção, você terá um endpoint que lista todos os usuários
      const mockUsers: EditingUser[] = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          role: UserRole.USER,
          isActive: true,
          maxDailyMinutes: 480, // 8 horas
          maxWeeklyMinutes: 2400, // 40 horas
          createdAt: '2026-01-15T10:00:00Z',
          lastLogin: '2026-02-22T14:30:00Z',
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@example.com',
          role: UserRole.USER,
          isActive: true,
          maxDailyMinutes: 360, // 6 horas
          maxWeeklyMinutes: 1800, // 30 horas
          createdAt: '2026-01-20T10:00:00Z',
          lastLogin: '2026-02-21T09:00:00Z',
        },
        {
          id: '3',
          name: 'Pedro Costa',
          email: 'pedro@example.com',
          role: UserRole.USER,
          isActive: false,
          maxDailyMinutes: null,
          maxWeeklyMinutes: null,
          createdAt: '2026-02-01T10:00:00Z',
          lastLogin: '2026-02-10T16:45:00Z',
        },
      ];

      setUsers(mockUsers);
      setStats({
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.isActive).length,
        totalTasks: 150, // Simulado
      });
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const handleUpdateLimits = async (userId: string, dailyMinutes: number | null, weeklyMinutes: number | null) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, maxDailyMinutes: dailyMinutes, maxWeeklyMinutes: weeklyMinutes, isEditing: false }
        : u
    ));
    // TODO: Salvar no Supabase
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja remover este usuário? Todos os seus dados serão perdidos.')) {
      setUsers(users.filter(u => u.id !== userId));
      // TODO: Deletar no Supabase
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0b0d] dark:to-[#111315]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1a1d21] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestão de Usuários e Limites</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-[#1a1d21] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1d21] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Usuários Ativos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeUsers}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <ToggleRight className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1d21] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Tarefas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalTasks}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Clock className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === 'users'
                ? 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users size={16} />
              Usuários
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === 'settings'
                ? 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Settings size={16} />
              Configurações
            </span>
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-[#1a1d21] dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#1a1d21] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Usuário</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Email</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Limite Diário</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Limite Semanal</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Carregando usuários...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500">ID: {user.id}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="px-6 py-4">
                            {user.isEditing ? (
                              <input
                                type="number"
                                defaultValue={user.maxDailyMinutes || ''}
                                placeholder="Minutos"
                                className="w-24 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-800 dark:text-white text-sm"
                              />
                            ) : (
                              <span className="text-gray-600 dark:text-gray-400">
                                {user.maxDailyMinutes ? `${user.maxDailyMinutes}min` : 'Ilimitado'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.isEditing ? (
                              <input
                                type="number"
                                defaultValue={user.maxWeeklyMinutes || ''}
                                placeholder="Minutos"
                                className="w-24 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-800 dark:text-white text-sm"
                              />
                            ) : (
                              <span className="text-gray-600 dark:text-gray-400">
                                {user.maxWeeklyMinutes ? `${user.maxWeeklyMinutes}min` : 'Ilimitado'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleActive(user.id)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition ${
                                user.isActive
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              }`}
                            >
                              {user.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                              {user.isActive ? 'Ativo' : 'Inativo'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingUser(user.id === editingUser?.id ? null : user)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                title="Deletar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-[#1a1d21] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configurações do Sistema</h2>
            
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">Permitir novos registros</span>
                </label>
              </div>

              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-gray-700 dark:text-gray-300">Ativar verificação de atualizações</span>
                </label>
              </div>

              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Limite Padrão Diário (minutos)
                </label>
                <input
                  type="number"
                  defaultValue="480"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Limite Padrão Semanal (minutos)
                </label>
                <input
                  type="number"
                  defaultValue="2400"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
              Salvar Configurações
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
