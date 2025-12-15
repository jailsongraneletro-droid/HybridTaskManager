import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper to safely access environment variables
const getEnvVar = (key: string, viteKey: string, fallback: string): string => {
  let value = '';
  try {
    if (typeof process !== 'undefined' && process.env) {
      value = process.env[key] || '';
    }
  } catch (e) {}

  if (!value) {
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        value = (import.meta as any).env[viteKey] || '';
      }
    } catch (e) {}
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

const supabaseServiceRoleKey = getEnvVar(
  'REACT_APP_SUPABASE_SERVICE_KEY',
  'VITE_SUPABASE_SERVICE_KEY',
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybWxwZHdieWdnendjYnRha25yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4NjE2NCwiZXhwIjoyMDgxMTYyMTY0fQ.by6YllE9177aaw4hfjFs515RyMX4nlV1EcUBcxuq7vo" 
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Credentials missing.');
}

// SINGLETON PATTERN FIX
// We attach the client to the global window object in development to prevent 
// creating multiple instances during hot-reloads, which causes the "GoTrueClient" warning.
const globalAny: any = typeof window !== 'undefined' ? window : {};
let client: SupabaseClient;

if (globalAny._supabaseInstance) {
  client = globalAny._supabaseInstance;
} else {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
      lock: false, // Explicitly disable locking to prevent hangs
      // storageKey removed to use default 'sb-...' key for better compatibility
    }
  });
  
  // Save instance globally if not in production
  if (process.env.NODE_ENV !== 'production') {
    globalAny._supabaseInstance = client;
  }
}

export const supabase = client;

export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  : null;