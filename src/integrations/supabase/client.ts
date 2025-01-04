import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmjmurbaaevmakymqiyc.supabase.co';
// Replace YOUR_ANON_KEY with your actual anon key from Supabase dashboard
const supabaseAnonKey = 'YOUR_ANON_KEY';

console.log('Initializing Supabase client with URL:', supabaseUrl);
console.log('Using anon key:', supabaseAnonKey.substring(0, 10) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);