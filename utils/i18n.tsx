
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Simplified to just string map since we only support PT-BR now
const translations = {
    // Landing Page SEO & Content
    landingHeroTitle: 'Gerenciador de Projetos e Tarefas Inteligente',
    landingHeroSub: 'A solução definitiva que combina Quadro Kanban, Tabela Dinâmica, Notas Ricas e Analytics para elevar a sua produtividade ao nível máximo.',
    landingStartBtn: 'Começar Agora Gratuitamente',
    landingLoginBtn: 'Entrar na Conta',
    landingBackToHome: 'Voltar ao Início',

    // Landing Page Features (SEO Optimized)
    landingFeature1Title: 'Gestão Visual com Kanban',
    landingFeature1Desc: 'Organize seu fluxo de trabalho com arrastar e soltar. Ideal para metodologias Ágeis e Scrum.',
    landingFeature2Title: 'Analytics e BI Integrado',
    landingFeature2Desc: 'Visualize o desempenho do projeto com gráficos de carga de trabalho e taxas de conclusão em tempo real.',
    landingFeature3Title: 'Tabelas e Planilhas Dinâmicas',
    landingFeature3Desc: 'Gerencie centenas de tarefas simultâneas com filtros avançados e agrupamentos inteligentes.',
    landingFeature4Title: 'Bloco de Notas Estruturado',
    landingFeature4Desc: 'Documente ideias e atas de reunião com editor Rich Text diretamente vinculado aos seus projetos.',

    // Help & Manual Section
    help: 'Ajuda',
    userManualTitle: 'Manual do Usuário',
    userManualSub: 'Aprenda a dominar o HybridTask em poucos minutos.',
    step1Title: '1. Começando sua Jornada',
    step1Desc: 'Crie sua conta gratuita em segundos. O sistema criará automaticamente suas primeiras colunas e prioridades para você não começar do zero.',
    step2Title: '2. Criando sua Primeira Tarefa',
    step2Desc: 'Use o botão "+" no topo de qualquer tela. Defina título, data de entrega e o nível de urgência. Você pode até anexar descrições detalhadas.',
    step3Title: '3. Escolhendo sua Visualização',
    step3Desc: 'Alterne entre Kanban (fluxo), Calendário (prazos) ou Tabela (dados). O que você muda em uma tela, reflete instantaneamente em todas as outras.',
    step4Title: '4. Notas e Brainstorming',
    step4Desc: 'Use o Bloco de Notas para atas de reuniões ou ideias rápidas. Personalize com cores para categorizar seus pensamentos.',
    
    // New Landing Sections
    landingBenefitsTitle: 'Por que escolher o HybridTask para sua Gestão?',
    landingBenefit1Title: 'Interface Intuitiva',
    landingBenefit1Desc: 'Diga adeus à curva de aprendizado. Nossa interface foi desenhada para ser simples e poderosa.',
    landingBenefit2Title: 'Dados em Nuvem Seguros',
    landingBenefit2Desc: 'Seus projetos e notas são sincronizados instantaneamente e protegidos com criptografia de ponta.',
    landingBenefit3Title: 'Foco em Resultados',
    landingBenefit3Desc: 'Nossos Dashboards ajudam a identificar gargalos antes que eles se tornem problemas críticos.',

    landingFaqTitle: 'Perguntas Frequentes (FAQ)',
    landingFaq1Q: 'O HybridTask é realmente gratuito?',
    landingFaq1A: 'Sim! Oferecemos um plano gratuito robusto para indivíduos e pequenas equipes organizarem seus projetos sem custos.',
    landingFaq2Q: 'Posso usar no celular?',
    landingFaq2A: 'Sim, o HybridTask é totalmente responsivo e funciona perfeitamente em smartphones e tablets via navegador.',
    landingFaq3Q: 'Como funciona a segurança dos dados?',
    landingFaq3A: 'Utilizamos a infraestrutura do Supabase para garantir que seus dados estejam sempre seguros, privados e acessíveis.',

    // Nav
    dashboard: 'Painel',
    kanban: 'Quadro Kanban',
    table: 'Tabela',
    notes: 'Anotações',
    calendar: 'Calendário',
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
    restoreDefaults: 'Restaurar Padrões',
    
    // Fields
    title: 'Nome da Tarefa',
    status: 'Status',
    priority: 'Prioridade',
    assignee: 'Responsável',
    dueDate: 'Vencimento',
    taskAge: 'Tempo de Vida',
    description: 'Descrição',
    actions: 'Ações',
    
    // Notes
    takeANote: 'Criar uma nota...',
    noteTitle: 'Título',
    noteContent: 'Criar uma nota...',
    deleteNoteConfirm: 'Tem certeza que deseja excluir esta nota?',
    
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
    
    // Calendar
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    todayView: 'Hoje',
    next: 'Próximo',
    previous: 'Anterior',
    taskDeadline: 'Prazo da Tarefa',

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
    troubleshooting: 'Solução de Problemas',
    restoreDefaultsDesc: 'Se suas colunas ou prioridades sumiram, use este botão para recriar os itens padrão (A fazer, Em andamento, Concluído, etc).',
    restoring: 'Restaurando...',
    restoreSuccess: 'Padrões restaurados com sucesso!',
    
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
    // Fix: Added missing 'grid' and 'list' keys
    grid: 'Grade',
    list: 'Lista',
    
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
    welcomeBack: 'Bem-vindo de volta!',
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
    checkEmail: 'Cadastro realizado! Verifique seu email para ativar a conta antes de entrar.',
    forgotPassword: 'Esqueci minha senha',
    forgotPasswordTitle: 'Recuperar Senha',
    forgotPasswordDesc: 'Enviaremos um código para seu email.',
    sendResetLink: 'Enviar Código',
    sending: 'Enviando...',
    backToLogin: 'Voltar para o Login',
    resetLinkSent: 'Código enviado! Verifique seu email.',
    
    // Password Reset (OTP Flow)
    enterCodeTitle: 'Digitar Código',
    enterCodeDesc: 'Insira o código de 6 dígitos enviado para seu email. (Se houver link, pode ignorar).',
    codeLabel: 'Código de Verificação',
    verifyCode: 'Validar Código',
    verifying: 'Validando...',
    setNewPassword: 'Definir Nova Senha',
    newPasswordDesc: 'Código validado. Crie sua nova senha.',
    newPassword: 'Nova Senha',
    updatePassword: 'Alterar Senha e Entrar',
    passwordUpdated: 'Senha alterada com sucesso!',
    otpError: 'Código inválido ou expirado.',

    // Session Timeout
    sessionExpiring: 'Sessão Expirando',
    sessionExpiringDesc: 'Você esteve inativo por 30 minutos. Para sua segurança, sua sessão será encerrada em:',
    stayLoggedIn: 'Continuar Logado',
    loggingOut: 'Saindo...',
};

interface LanguageContextType {
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children?: ReactNode }) => {
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
