import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmjmurbaaevmakymqiyc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tam11cmJhYWV2bWFreW1xaXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2NTg1NzgsImV4cCI6MjAyNTIzNDU3OH0.BmIPdVGrGNGTYEA6ygfvXYTOKqwZe5kO0QbGMsHk_Oc';

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});