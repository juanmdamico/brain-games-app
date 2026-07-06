import { createClient } from '@supabase/supabase-js';

// Trigger rebuild to inject newly added Vercel environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing. Database operations will fail. " +
    "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
  );
}

// Fallback to a placeholder URL to prevent application crash on boot if env vars are missing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url-for-supabase.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
