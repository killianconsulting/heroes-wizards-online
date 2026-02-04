import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/** Lobby retention: delete lobbies older than this (game is ~30–45 min; 2h gives buffer). */
const RETENTION_HOURS = 2;

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * DELETE /api/cron/cleanup-lobbies
 * Call with header: Authorization: Bearer <CRON_SECRET>
 * Deletes lobbies (and their lobby_players via cascade) older than RETENTION_HOURS.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 501 });
  }
  const authHeader = request.headers.get('authorization');
  const urlSecret = new URL(request.url).searchParams.get('secret');
  const valid = authHeader === `Bearer ${secret}` || urlSecret === secret;
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase service role not configured (SUPABASE_SERVICE_ROLE_KEY)' },
      { status: 503 }
    );
  }

  const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000).toISOString();

  const { data: deleted, error } = await supabase
    .from('lobbies')
    .delete()
    .lt('created_at', cutoff)
    .select('id');

  if (error) {
    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500 }
    );
  }

  const count = deleted?.length ?? 0;
  return NextResponse.json({
    ok: true,
    deleted: count,
    cutoff,
    retentionHours: RETENTION_HOURS,
  });
}
