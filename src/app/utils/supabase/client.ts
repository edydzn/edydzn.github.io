import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;

export const supabase = createClient(SUPABASE_URL, publicAnonKey);
