import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'
  );
}

/**
 * Supabase client instance
 * This client is used for all database and authentication operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable email verification
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

