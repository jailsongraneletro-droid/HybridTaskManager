import { createClient } from '@supabase/supabase-js';

// Access environment variables, handling potential type issues with import.meta
// Fallback to provided credentials if env vars are missing
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 
                    (import.meta as any).env?.VITE_SUPABASE_URL || 
                    "https://wrmlpdwbyggzwcbtaknr.supabase.co";

const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 
                        (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybWxwZHdieWdnendjYnRha25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODYxNjQsImV4cCI6MjA4MTE2MjE2NH0.ShakDrL7hTEdC16ztUYyydW__nBhVXARONNstiYxKNI";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);