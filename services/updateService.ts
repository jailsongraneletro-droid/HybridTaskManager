import { Capacitor } from '@capacitor/core';

export interface AppVersion {
  version: string;
  versionCode: number;
  releaseNotes: string;
  downloadUrl: string;
  mandatory: boolean;
  releaseDate: string;
}

const CURRENT_VERSION = '1.1.0';
const CURRENT_VERSION_CODE = 2;

/**
 * Verifica se há uma nova versão disponível
 * Você pode armazenar as informações de versão em:
 * 1. Supabase (tabela app_versions)
 * 2. GitHub Releases (mais simples para começar)
 * 3. Arquivo JSON estático no servidor
 */
export async function checkForUpdates(): Promise<{
  hasUpdate: boolean;
  version?: AppVersion;
}> {
  try {
    // Só verifica atualizações em dispositivos Android
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return { hasUpdate: false };
    }

    // Opção 1: GitHub Releases (exemplo)
    const response = await fetch(
      'https://api.github.com/repos/jailsongraneletro-droid/HybridTaskManager/releases/latest'
    );

    if (!response.ok) {
      console.warn('Não foi possível verificar atualizações');
      return { hasUpdate: false };
    }

    const release = await response.json();
    
    // Extrai versão do tag (ex: v1.2.0 -> 1.2.0)
    const latestVersion = release.tag_name.replace(/^v/, '');
    const latestVersionCode = extractVersionCode(latestVersion);

    // Encontra o APK nos assets
    const apkAsset = release.assets.find((asset: any) => 
      asset.name.endsWith('.apk')
    );

    if (!apkAsset) {
      return { hasUpdate: false };
    }

    const hasUpdate = latestVersionCode > CURRENT_VERSION_CODE;

    if (hasUpdate) {
      return {
        hasUpdate: true,
        version: {
          version: latestVersion,
          versionCode: latestVersionCode,
          releaseNotes: release.body || 'Correções de segurança e melhorias',
          downloadUrl: apkAsset.browser_download_url,
          mandatory: release.name?.includes('[MANDATORY]') || false,
          releaseDate: release.published_at,
        },
      };
    }

    return { hasUpdate: false };
  } catch (error) {
    console.error('Erro ao verificar atualizações:', error);
    return { hasUpdate: false };
  }
}

/**
 * Converte string de versão para código numérico
 * Ex: "1.2.3" -> 10203
 */
function extractVersionCode(version: string): number {
  const parts = version.split('.').map(Number);
  const [major = 0, minor = 0, patch = 0] = parts;
  return major * 10000 + minor * 100 + patch;
}

/**
 * Baixa e instala a nova versão do APK
 * Requer permissão REQUEST_INSTALL_PACKAGES no AndroidManifest
 */
export async function downloadAndInstallUpdate(downloadUrl: string): Promise<void> {
  try {
    // Baixa o APK
    const response = await fetch(downloadUrl);
    const blob = await response.blob();

    // Cria URL temporária
    const url = URL.createObjectURL(blob);

    // Cria link de download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hybrid-task-manager.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Libera memória
    URL.revokeObjectURL(url);

    // No Android, após o download, o usuário precisa abrir o APK manualmente
    // Para instalação automática, seria necessário um plugin nativo Capacitor
    alert('APK baixado! Abra o arquivo para instalar a atualização.');
  } catch (error) {
    console.error('Erro ao baixar atualização:', error);
    throw new Error('Não foi possível baixar a atualização');
  }
}

/**
 * Alternativa: usar Supabase Storage para hospedar APKs
 * Crie uma tabela app_versions com:
 * - version (text)
 * - version_code (integer)
 * - release_notes (text)
 * - apk_url (text)
 * - mandatory (boolean)
 * - created_at (timestamp)
 */
export async function checkForUpdatesSupabase(): Promise<{
  hasUpdate: boolean;
  version?: AppVersion;
}> {
  try {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return { hasUpdate: false };
    }

    // Importa supabase (descomente se for usar esta opção)
    // const { supabase } = await import('../utils/supabaseClient');
    
    // const { data, error } = await supabase
    //   .from('app_versions')
    //   .select('*')
    //   .order('version_code', { ascending: false })
    //   .limit(1)
    //   .single();

    // if (error || !data) {
    //   return { hasUpdate: false };
    // }

    // const hasUpdate = data.version_code > CURRENT_VERSION_CODE;

    // if (hasUpdate) {
    //   return {
    //     hasUpdate: true,
    //     version: {
    //       version: data.version,
    //       versionCode: data.version_code,
    //       releaseNotes: data.release_notes,
    //       downloadUrl: data.apk_url,
    //       mandatory: data.mandatory,
    //       releaseDate: data.created_at,
    //     },
    //   };
    // }

    return { hasUpdate: false };
  } catch (error) {
    console.error('Erro ao verificar atualizações:', error);
    return { hasUpdate: false };
  }
}

export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}

export function getCurrentVersionCode(): number {
  return CURRENT_VERSION_CODE;
}
