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
  ""
);

const supabaseAnonKey = getEnvVar(
  'REACT_APP_SUPABASE_ANON_KEY', 
  'VITE_SUPABASE_ANON_KEY', 
  ""
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Credentials missing.');
}

// SINGLETON PATTERN FIX
// We attach the client to the global window object in development to prevent 
// creating multiple instances during hot-reloads.
const globalAny: any = typeof window !== 'undefined' ? window : {};
let client: SupabaseClient;

// Custom storage key to prevent collisions with other apps or stuck locks from previous versions
const STORAGE_KEY = 'hybrid-task-manager-v2-auth';

if (globalAny._supabaseInstance) {
  client = globalAny._supabaseInstance;
} else {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: STORAGE_KEY, // Explicit unique key
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
      lock: false, // Explicitly disable locking to prevent hangs
    }
  });
  
  // Save instance globally immediately to prevent duplicates in all envs
  globalAny._supabaseInstance = client;
}

export const supabase = client;

export const supabaseAdmin = null;