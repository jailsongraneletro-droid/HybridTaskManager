# Painel Administrativo - Geração de Usuários Admin

## 🔐 Como criar um usuário admin

**⚠️ IMPORTANTE:** Se você estiver tendo dificuldade para acessar `/#/admin`, veja o guia completo de SQL aqui:

👉 **[ADMIN_SQL_SETUP.md](ADMIN_SQL_SETUP.md)** ← Abra este arquivo para instruções passo-a-passo com SQL

---

## ✅ Resumo Rápido

1. **Acesse:** https://app.supabase.com → Seu projeto → SQL Editor
2. **Execute os comandos SQL** do arquivo `ADMIN_SQL_SETUP.md`
3. **Substitute seu email** no comando UPDATE
4. **Faça logout e login novamente** para sincronizar
5. **Acesse:** `/#/admin`

### **Opção 1: Via SQL (Recomendado)**

1. Vá para: https://app.supabase.com
2. Selecione seu projeto `HybridTaskManager`
3. Clique em "SQL Editor"
4. Cole este comando:

```sql
-- Criar tabela user_profiles se não existir
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  max_daily_minutes INTEGER, -- NULL = ilimitado
  max_weekly_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Inserir seu usuário como admin
INSERT INTO user_profiles (id, name, email, role, is_active, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'seu_email@example.com'), -- Use seu email real
  'Seu Nome',
  'seu_email@example.com',
  'admin',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### **Opção 2: Atualizar usuário existente**

Se você já tem um usuário criado, apenas altere seu role:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'seu_email@example.com';
```

## 📍 Acessar o Painel Admin

### **Web**
```
http://localhost:3000/#/admin
```

### **Produção**
```
https://seu-dominio.com/#/admin
```

**Importante:** Apenas usuários com `role = 'admin'` conseguem acessar. Qualquer outro usuário será redirecionado para o dashboard normal.

## 🎯 Funcionalidades do Painel

### **Tab: Usuários**
- 📋 Listar todos os usuários do sistema
- 🔍 Buscar por nome ou email
- ⏱️ Definir limite de tempo diário (em minutos)
- 📅 Definir limite de tempo semanal
- ✅ Ativar/desativar usuários
- 🗑️ Deletar usuários completamente

### **Tab: Configurações**
- ⚙️ Configurações globais do sistema
- 📊 Limite padrão para novos usuários
- 🔧 Preferências gerais

### **Stats do Dashboard**
- 👥 Total de usuários
- 🟢 Usuários ativos
- 📝 Total de tarefas

## 📊 Limites de Tempo

### **Como funcionam:**

1. **Limite Diário** (ex: 8 horas = 480 minutos)
   - Reset automático às 00:00
   - Se usuário atingir o limite, vê mensagem de acesso bloqueado

2. **Limite Semanal** (ex: 40 horas = 2400 minutos)
   - Reset todo domingo
   - Acumulativo ao longo da semana

3. **Ilimitado** (NULL)
   - Se deixar vazio, usuário tem acesso infinito

### **Exemplos de configuração:**

| Cenário | Diário | Semanal |
|---------|--------|---------|
| 8h/dia, 40h/semana | 480 | 2400 |
| 6h/dia, 30h/semana | 360 | 1800 |
| 4h/dia, 20h/semana | 240 | 1200 |
| Sem limite | (vazio) | (vazio) |

## 🛡️ Segurança

- ✅ Apenas admin pode acessar `/admin`
- ✅ Sem links do painel em telas normais
- ✅ Role verificada em cada requisição
- ✅ Dados sensíveis protegidos no Supabase
- ✅ Rota desaparece para usuários normais

## 📋 Fluxo de Criação de Admin

1. **Usuário se registra normalmente**
   - Nome, email, senha
   - Role padrão = `user`

2. **Admin promove via painel**
   - Edita usuário
   - Muda role para `admin`
   - Usuário obtém acesso imediatamente

3. **Admin agora pode:**
   - Gerenciar outros usuários
   - Definir limites
   - Ver estatísticas
   - Configurar sistema

## 🔄 Sincronização em Tempo Real

O painel admin se conecta direto ao Supabase:
- ✅ Mudanças aparecem em tempo real
- ✅ Limite é verificado quando usuário abre o app
- ✅ Status ativo/inativo controla acesso
- ✅ Histórico de uso registrado em `user_usage_logs`

## 🚀 Próximas Melhorias (Opcionais)

- [ ] Gráficos de uso sobre tempo (Chart.js)
- [ ] Exportar relatório CSV
- [ ] Avisar usuários sobre limites próximos
- [ ] Bloquear/desbloquear usuários por horário
- [ ] Auditoria de ações admin
- [ ] 2FA para admin
- [ ] Backup de usuários

## ⚠️ Troubleshooting

### "Acesso negado ao painel admin"
→ Verifique que `role = 'admin'` em `user_profiles`

### "Usuários não aparecem"
→ Tabela `user_profiles` foi criada? Verifique com SQL

### "Limites não funcionam"
→ Hook `useTimeTracking` está ativo? Verificar `App.tsx`

---

**Criado em:** 22/02/2026
**Versão:** 1.1.0
