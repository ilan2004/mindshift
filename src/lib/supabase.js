let client = null;

export function getSupabaseClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  // We keep this lightweight for now to avoid adding deps; later import @supabase/supabase-js
  // const { createClient } = await import('@supabase/supabase-js');
  // client = createClient(url, anon);
  return client;
}
