import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabase: SupabaseClient = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey
);

export async function verifyConnection(): Promise<void> {
  const { error } = await supabase.from('carros').select('id_carro').limit(1);
  if (error) {
    console.error('❌ Error conectando a Supabase:', error.message);
  } else {
    console.log('✅ Conexión a Supabase exitosa');
  }
}

if (env.nodeEnv !== 'production') {
  verifyConnection();
}