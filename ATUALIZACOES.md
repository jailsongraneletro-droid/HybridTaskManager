# Sistema de Atualização Automática - Hybrid Task Manager

## 🎯 Como Funciona

O app agora verifica automaticamente se há novas versões disponíveis quando é aberto. Um banner aparece no topo da tela informando sobre a atualização.

## 📦 Como Publicar uma Nova Versão

### 1. **Atualizar o Número da Versão**

Edite os arquivos:

**package.json:**
```json
{
  "version": "1.2.0"  // Incrementar
}
```

**android/app/build.gradle:**
```gradle
versionCode 3        // SEMPRE incrementar (número inteiro)
versionName "1.2.0"  // Deve corresponder ao package.json
```

**services/updateService.ts:**
```typescript
const CURRENT_VERSION = '1.2.0';
const CURRENT_VERSION_CODE = 3;
```

### 2. **Gerar o APK Release**

```powershell
# Build e sync
npm run build
npx cap sync android

# Gerar APK assinado
cd android
.\gradlew assembleRelease

# APK estará em: android/app/build/outputs/apk/release/hybrid-task-manager.apk
```

### 3. **Publicar no GitHub Releases**

1. Vá para: https://github.com/jailsongraneletro-droid/HybridTaskManager/releases
2. Clique em "Draft a new release"
3. Preencha:
   - **Tag version:** `v1.2.0` (deve começar com `v`)
   - **Release title:** `Versão 1.2.0`
   - **Description:** Notas de release (será exibido no app)
   
   Exemplo:
   ```markdown
   ## 🎉 Novidades
   
   - ✅ Sistema de verificação de atualizações
   - ✅ Correções de segurança
   - ✅ Melhorias de performance
   
   ## 🐛 Correções
   
   - Corrigido conflito de pacotes
   - Corrigido exposição de senha
   ```

4. **Anexe o APK:**
   - Arraste `hybrid-task-manager.apk` para a seção de assets
   
5. **Publicar:**
   - Para atualização obrigatória: adicione `[MANDATORY]` no título
   - Exemplo: `Versão 1.2.0 [MANDATORY]`
   - Clique em "Publish release"

### 4. **Usuários serão Notificados Automaticamente**

Quando abrirem o app, verão:

**Banner normal:**
```
🎉 Nova Versão Disponível
Versão 1.2.0 - Correções de segurança e melhorias
[Atualizar] [X]
```

**Banner obrigatório (com [MANDATORY]):**
```
⚠️ Atualização Obrigatória Disponível
Versão 1.2.0 - Correções críticas de segurança
[Atualizar]  (sem botão fechar)
```

## 🔧 Regras de Versionamento

Use **Semantic Versioning** (semver):

- **MAJOR** (1.0.0 → 2.0.0): Mudanças incompatíveis
- **MINOR** (1.0.0 → 1.1.0): Novas funcionalidades
- **PATCH** (1.0.0 → 1.0.1): Correções de bugs

**versionCode** sempre incrementa (+1 a cada release):
- v1.0.0 = versionCode 1
- v1.1.0 = versionCode 2
- v1.1.1 = versionCode 3
- v2.0.0 = versionCode 4

## 🚨 Quando Marcar como MANDATORY

Use `[MANDATORY]` quando a atualização for **crítica**:
- ✅ Correção de vulnerabilidade de segurança
- ✅ Bug que corrompe dados
- ✅ Incompatibilidade com API/backend
- ❌ Novas funcionalidades (apenas opcional)

## 🔄 Método Alternativo: Supabase Storage

Se preferir hospedar APKs no Supabase:

### 1. Criar Bucket no Supabase

```sql
-- No Supabase SQL Editor
CREATE TABLE app_versions (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL,
  version_code INTEGER NOT NULL UNIQUE,
  release_notes TEXT,
  apk_url TEXT NOT NULL,
  mandatory BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Upload do APK

1. Crie um bucket público chamado `app-releases`
2. Faça upload do APK
3. Copie a URL pública

### 3. Inserir Registro

```sql
INSERT INTO app_versions (version, version_code, release_notes, apk_url, mandatory)
VALUES (
  '1.2.0',
  3,
  'Correções de segurança e melhorias',
  'https://[seu-projeto].supabase.co/storage/v1/object/public/app-releases/hybrid-task-manager-v1.2.0.apk',
  false
);
```

### 4. Ativar no Código

Em `services/updateService.ts`, altere a função de check:

```typescript
// Na função checkForUpdates(), comentar GitHub e descomentar:
const result = await checkForUpdatesSupabase();
```

## 📱 Experiência do Usuário

1. **Usuário abre o app**
2. **App verifica versão** (GitHub Releases ou Supabase)
3. **Se houver atualização:**
   - Banner aparece no topo
   - Usuário clica em "Atualizar"
   - APK é baixado
   - Sistema Android abre instalador
   - Usuário confirma instalação
   - App é atualizado sem perder dados

## ⚠️ Importante

- **Não desinstale** para atualizar (perde dados)
- **versionCode** SEMPRE deve aumentar
- **APK deve estar assinado** com o mesmo keystore
- **Não commite** o arquivo keystore.properties com senha real
- **BackupO keystore** (se perder, não pode mais atualizar!)

## 🎨 Personalização

Para customizar mensagens, edite:
- **Banner:** `components/UpdateChecker.tsx`
- **Lógica:** `services/updateService.ts`
- **Versão:** `android/app/build.gradle` + `package.json`

## 📋 Checklist de Release

- [ ] Incrementar `versionCode` e `versionName` em `android/app/build.gradle`
- [ ] Atualizar `version` em `package.json`
- [ ] Atualizar constantes em `services/updateService.ts`
- [ ] Escrever notas de release
- [ ] Gerar APK assinado (`.\gradlew assembleRelease`)
- [ ] Testar instalação em dispositivo
- [ ] Criar release no GitHub ou Supabase
- [ ] Anexar APK ao release
- [ ] Publicar release
- [ ] Testar verificação de atualização em versão antiga

## 🔐 Segurança

- ✅ Usa HTTPS para download
- ✅ APK assinado com certificado válido
- ✅ Android verifica assinatura antes de instalar
- ✅ Permissão REQUEST_INSTALL_PACKAGES solicitada ao usuário

---

**Versão atual:** 1.1.0 (versionCode 2)
