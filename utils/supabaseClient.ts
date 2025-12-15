import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in various environments (Vite, CRA, Node)
const getEnvVar = (key: string, viteKey: string, fallback: string): string => {
  let value = '';
  
  // 1. Try process.env (Standard Node/CRA)
  try {
    if (typeof process !== 'undefined' && process.env) {
      value = process.env[key] || '';
    }
  } catch (e) {
    // Ignore error if process is not available
  }

  // 2. Try import.meta.env (Vite)
  if (!value) {
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        value = (import.meta as any).env[viteKey] || '';
      }
    } catch (e) {
      // Ignore
    }
  }

  return value || fallback;
};

const supabaseUrl = getEnvVar(
  'REACT_APP_SUPABASE_URL', 
  'VITE_SUPABASE_URL', 
  "https://wrmlpdwbyggzwcbtaknr.supabase.co"
);

const supabaseAnonKey = getEnvVar(
  'REACT_APP_SUPABASE_ANON_KEY', 
  'VITE_SUPABASE_ANON_KEY', 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybWxwZHdieWdnendjYnRha25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODYxNjQsImV4cCI6MjA4MTE2MjE2NH0.ShakDrL7hTEdC16ztUYyydW__nBhVXARONNstiYxKNI"
);

// --- ADMIN CONFIGURATION ---
// ATENÇÃO: Para o reset de senha direto funcionar, cole sua chave 'service_role' (não a 'anon') aqui.
// Você encontra ela em: Supabase Dashboard > Project Settings > API > Project API keys > service_role
// Como é uso interno, estamos colocando direto, mas cuidado ao compartilhar este código.
const supabaseServiceRoleKey = getEnvVar(
  'REACT_APP_SUPABASE_SERVICE_KEY',
  'VITE_SUPABASE_SERVICE_KEY',
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybWxwZHdieWdnendjYnRha25yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NjE2NCwiZXhwIjoyMDgxMTYyMTY0fQ.by6YllE9177aaw4hfjFs515RyMX4nlV1EcUBcxuq7vo" 
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Credentials missing. Please check your environment variables.');
}

// Client padrão para operações normais (respeita regras de segurança)
// Configurações adicionadas para evitar "Multiple GoTrueClient" e problemas de hash na URL
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false, // Desabilita detecção automática na URL para evitar conflitos
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Client Admin para reset de senha forçado (ignora regras de segurança)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  : null;