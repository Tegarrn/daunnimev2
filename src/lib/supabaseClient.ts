import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Anon Key dari environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Membuat dan mengekspor instance Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);