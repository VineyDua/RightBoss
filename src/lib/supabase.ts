

// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase with URL:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Optional test function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
    console.log('Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Error during connection test:', err);
    return false;
  }
};
