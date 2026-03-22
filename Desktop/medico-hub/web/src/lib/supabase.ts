import { createClient } from '@supabase/supabase-js';

// We rely on standard Vite environment variables. 
// For scaffolding / local dev, these can be explicitly warned if missing.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn("VITE_SUPABASE_URL is missing. Please add it to your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
