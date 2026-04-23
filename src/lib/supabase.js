import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hssqiyobakeofacctwfp.supabase.co';
const supabaseAnonKey = 'sb_publishable_j4B0dmt9eYrRPKAHWeEngw_24s-4uqI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);