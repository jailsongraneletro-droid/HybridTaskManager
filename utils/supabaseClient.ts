import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in various environments (Vite, CRA, Node)
const getEnvVar = (key: string, viteKey: string, fallback: string): string => {
  let value = '';
  
  // 1. Try process.env (Standard Node/CRA)
  // We use typeof check to prevent "ReferenceError: process is not defined" in browsers/Vite
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
      // Cast import.meta to any to avoid TS error: Property 'env' does not exist on type 'ImportMeta'
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        value = (import.meta as any).env[viteKey] || '';
      }
    } catch (e) {
      // Ignore
    }
  }

  // 3. Return value or fallback
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Credentials missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);