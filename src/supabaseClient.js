import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://trqhhmgowvlwfpvcyyig.supabase.co';
const supabaseKey = 'sb_publishable_4sNjmyFt_sT5i9RBkLdW-w_iXD5fWiO';

export const supabase = createClient(supabaseUrl, supabaseKey);