import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Adicionando logs para depuração
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Loaded' : 'Undefined');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Loaded' : 'Undefined');

// Adicionando uma verificação explícita para garantir que as variáveis existam
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and/or Anon Key are not loaded from environment variables. Please ensure your .env file is correctly configured at the project root.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);