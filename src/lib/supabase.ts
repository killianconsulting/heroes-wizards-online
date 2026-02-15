import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Support both standard anon key and publishable key env var names
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  '';

function createSupabaseClient() {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      // Web Worker keeps heartbeats running when tab is backgrounded (avoids throttle-induced disconnects)
      worker: true,
      heartbeatCallback: (status) => {
        if (status === 'disconnected' || status === 'timeout') {
          client.realtime.connect();
        }
      },
    },
  });
  return client;
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createSupabaseClient()
    : null;

export const isSupabaseConfigured = (): boolean =>
  Boolean(supabaseUrl && supabaseAnonKey);
