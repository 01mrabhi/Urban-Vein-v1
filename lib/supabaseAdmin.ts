import { createClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from './supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = (supabaseUrl && serviceRoleKey && serviceRoleKey !== 'your_supabase_service_role_key_here')
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : defaultSupabase;
