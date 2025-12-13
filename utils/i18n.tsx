import React, { createContext, useContext, useState, ReactNode } from 'react';

// Simplified to just string map since we only support PT-BR now
const translations = {
    // Nav
    dashboard: 'Painel',
    kanban: 'Quadro Kanban',
    table: 'Tabela',
    settings: 'Configurações',
    logout: 'Sair',
    projectOverview: 'Visão Geral',
    
    // Actions
    newTask: 'Nova Tarefa',
    edit: 'Editar',
    delete: 'Excluir',
    save: 'Salvar Alterações',
    create: 'Criar Tarefa',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    addColumn: 'Adicionar Categoria',
    deleteCategory: 'Excluir Categoria',
    addPriority: 'Adicionar Prioridade',
    deletePriority: 'Excluir Prioridade',
    editProfile: 'Editar Perfil',
    
    // Fields
    title: 'Nome da Tarefa',
    status: 'Status',
    priority: 'Prioridade',
    assignee: 'Responsável',
    dueDate: 'Vencimento',
    taskAge: 'Tempo de Vida',
    description: 'Descrição',
    actions: 'Ações',
    
    // Dashboard
    completionRate: 'Taxa de Conclusão',
    overdueTasks: 'Tarefas Atrasadas',
    totalWorkload: 'Carga Total',
    taskStatusDist: 'Distribuição por Status',
    tasksByPriority: 'Tarefas por Prioridade',
    completedTasks: 'tarefas concluídas',
    pastDue: 'Tarefas vencidas',
    activeTasks: 'Tarefas ativas no fluxo',
    
    // Notifications
    notifications: 'Notificações',
    noNotifications: 'Nenhuma notificação pendente.',
    dueToday: 'Vence Hoje!',
    dueInDays: 'Vence em',
    daysOverdue: 'dias de atraso',
    
    // Settings
    projectSettings: 'Configurações do Projeto',
    customizeBoard: 'Personalize a estrutura e categorias do quadro.',
    boardCategories: 'Categorias do Quadro (Status)',
    manageWorkflow: 'Gerencie status e fluxo de trabalho',
    managePriorities: 'Gerenciar Prioridades',
    managePrioritiesDesc: 'Defina níveis de prioridade e cores personalizadas.',
    newCategoryName: 'Nome da Nova Categoria',
    newPriorityName: 'Nome da Nova Prioridade',
    colorTag: 'Etiqueta de Cor',
    permissions: 'Como Funcionam as Permissões',
    
    // Table View
    searchPlaceholder: 'Filtrar tarefas...',
    tasksFound: 'tarefas encontradas',
    columns: 'Colunas',
    manageColumns: 'Gerenciar Colunas',
    groupBy: 'Agrupar por',
    groupByNone: 'Nenhum',
    groupByStatus: 'Status',
    groupByPriority: 'Prioridade',
    groupByAssignee: 'Responsável',
    
    // Shared
    daysOld: 'dias',
    today: 'Hoje',
    unassigned: 'Não atribuído',
    
    // Confirmation Modals
    confirmDeleteTitle: 'Excluir Item',
    confirmDeleteMessage: 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
    confirmDeleteTaskTitle: 'Excluir Tarefa',
    confirmDeleteTaskMessage: 'Tem certeza que deseja excluir esta tarefa permanentemente?',
    confirmDeleteCategoryTitle: 'Excluir Categoria',
    confirmDeleteCategoryMessage: 'Tem certeza? Excluir uma categoria apagará PERMANENTEMENTE todas as tarefas contidas nela.',
    confirmDeletePriorityTitle: 'Excluir Prioridade',
    confirmDeletePriorityMessage: 'Tem certeza que deseja excluir esta prioridade? Tarefas com esta prioridade podem ficar sem classificação.',

    // Validation
    dateInPastError: 'A data de vencimento não pode ser anterior à data atual.',

    // Auth & Profile
    welcomeBack: 'Bem-vindo de volta! Por favor, insira seus dados.',
    createAccount: 'Criar uma Conta',
    enterDetails: 'Insira seus dados para se cadastrar.',
    name: 'Nome Completo',
    email: 'Email',
    password: 'Senha',
    avatarUrl: 'Foto de Perfil',
    orPasteUrl: 'Ou cole a URL da imagem',
    uploadPhoto: 'Carregar Foto / Câmera',
    removePhoto: 'Remover Foto',
    signIn: 'Entrar',
    signUp: 'Cadastrar',
    signingIn: 'Entrando...',
    signingUp: 'Cadastrando...',
    dontHaveAccount: "Não tem uma conta?",
    alreadyHaveAccount: "Já tem uma conta?",
    loginError: "Email ou senha inválidos. Verifique se confirmou seu email.",
    signupError: "Erro ao cadastrar. Usuário pode já existir.",
    fillAllFields: "Por favor, preencha todos os campos.",
    profileSettings: 'Configurações de Perfil',
    updateProfile: 'Atualizar Perfil',
    checkEmail: 'Cadastro realizado! Verifique seu email para ativar a conta antes de entrar.'
};

interface LanguageContextType {
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children?: ReactNode }) => {
  // We strictly use translations object which is PT-BR
  const t = (key: keyof typeof translations) => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};