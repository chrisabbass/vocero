import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmjmurbaaevmakymqiyc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tam11cmJhYWV2bWFreW1xaXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MTg5NjYsImV4cCI6MjA1MTI5NDk2Nn0.I6XHmFZSmz3sgcdRV3NNQD6JFwADju2zJpHBLT-8ANk';

console.log('Initializing Supabase client with URL:', supabaseUrl);
console.log('Using anon key:', supabaseAnonKey.substring(0, 10) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);