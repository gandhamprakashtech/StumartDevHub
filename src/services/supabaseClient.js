import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `
    ⚠️ MISSING SUPABASE ENVIRONMENT VARIABLES ⚠️
    
    Please set the following environment variables:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY
    
    For local development: Add them to your .env file
    For Vercel deployment: Add them in Vercel Dashboard → Settings → Environment Variables
    
    The application will not work without these variables.
  `;
  console.error(errorMessage);
  
  // Show user-friendly error in production
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; padding: 20px;">
        <div style="max-width: 600px; text-align: center;">
          <h1 style="color: #dc2626; margin-bottom: 16px;">Configuration Error</h1>
          <p style="color: #4b5563; margin-bottom: 8px;">
            Missing Supabase environment variables.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment settings.
          </p>
        </div>
      </div>
    `;
  }
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

