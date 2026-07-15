import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

// Cliente para uso no lado do cliente (browser)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente para uso no lado do servidor com service role (API routes)
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Helper: obter sessão atual
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Helper: obter usuário atual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
