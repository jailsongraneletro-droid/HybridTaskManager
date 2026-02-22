# 🔐 Como Configurar Admin no Supabase

## Problema
Você tentou acessar `/#/admin` mas foi redirecionado para o dashboard porque seu usuário não tem `role = 'admin'` no banco de dados.

## ✅ Solução: Executar SQL no Supabase

### **Passo 1: Acessar Supabase SQL Editor**
1. Vá para: https://app.supabase.com
2. Selecione seu projeto `HybridTaskManager`
3. Clique em **"SQL Editor"** na barra lateral esquerda
4. Clique em **"New Query"**

### **Passo 2: Criar Tabela de Perfis (se não existir)**

Cole este código e execute (clique em ▶️):

```sql
-- Criar tabela user_profiles se não existir
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  max_daily_minutes INTEGER,
  max_weekly_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Política: Admin vê todos os perfis
CREATE POLICY "Admin can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- Política: Admins podem atualizar qualquer perfil
CREATE POLICY "Admin can update any profile" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );
```

**Status**: Você verá ✅ verde se executado com sucesso.

---

### **Passo 3: Tornar Seu Usuário Admin**

Cole este código no SQL Editor e execute:

```sql
-- ⚠️ ALTERE SEU EMAIL AQUI!
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'seu_email@example.com';
```

**Substitua `seu_email@example.com` pelo seu email real!**

Exemplo:
```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'jailson@example.com';
```

---

### **Passo 4: Verificar se Funcionou**

Execute esta query para confirmar:

```sql
SELECT id, email, role, is_active 
FROM public.user_profiles 
ORDER BY created_at DESC 
LIMIT 10;
```

Procure por seu email com `role = 'admin'`.

---

## 🌐 **Agora Acesse o Painel**

Volte para:
```
https://hybrid-task-manager.vercel.app/#/admin
```

Você deve ver o painel admin com:
- 📊 Estatísticas (Total de usuários, Ativos, Tarefas)
- 👥 Tab de Usuários (gerenciar, limites, deletar)
- ⚙️ Tab de Configurações

---

## ❌ **E Se Ainda Não Funcionar?**

### **Verificar se o usuário existe na tabela**
```sql
SELECT * FROM public.user_profiles WHERE email = 'seu_email@example.com';
```

Se nada aparece, insira manualmente:
```sql
INSERT INTO public.user_profiles (id, name, email, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'seu_email@example.com'),
  'Seu Nome',
  'seu_email@example.com',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### **Ainda não funciona?**

1. **Abra DevTools** (F12)
2. Vá para **Console**
3. Copie qualquer erro que apareça
4. Verifique em **Network** se a request está indo para o Supabase

---

## 📋 **Checklist**

- [ ] Tabela `user_profiles` foi criada
- [ ] Seu usuário tem `role = 'admin'`
- [ ] Você fez logout e login novamente (para sincronizar)
- [ ] Página `/admin` carrega sem erro
- [ ] Você vê painel com usuários

---

## 🔑 **Criar Novos Admins**

Para promover outro usuário a admin, execute:

```sql
UPDATE public.user_profiles 
SET role = 'admin'
WHERE email = 'outro_usuario@example.com';
```

Pronto! ✅

---

**Criado em:** 22/02/2026
**Versão:** 1.1.0
