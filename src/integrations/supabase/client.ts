// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nmjmurbaaevmakymqiyc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tam11cmJhYWV2bWFreW1xaXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MTg5NjYsImV4cCI6MjA1MTI5NDk2Nn0.I6XHmFZSmz3sgcdRV3NNQD6JFwADju2zJpHBLT-8ANk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);