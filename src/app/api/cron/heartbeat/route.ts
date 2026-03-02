import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

/**
 * GET /api/cron/heartbeat
 *
 * Lightweight Supabase query used by a scheduled job
 * to keep the free-tier database from going idle.
 */
export async function GET() {
  const supabase = getAnonClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
  }

  const { error } = await supabase
    .from('lobbies')
    .select('id', { head: true, count: 'estimated' })
    .limit(1);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message ?? 'Heartbeat query failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, message: 'Supabase heartbeat OK' });
}

