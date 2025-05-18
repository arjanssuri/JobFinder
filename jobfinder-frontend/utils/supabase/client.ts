import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Default values for development (use placeholders)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const createClient = () => {
  // Check if running on client side and in development mode
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn('Using placeholder Supabase credentials. Set actual values in .env.local');
  }
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};
