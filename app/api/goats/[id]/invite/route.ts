import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { hours, gens } = body;
  
  if (!hours || !gens) {
    return NextResponse.json({ error: 'Missing hours or gens' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    
    // Generate unique code: XXXX-XXXX-XXXX-XXXX
    let code = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 10) {
      code = crypto.randomBytes(8).toString('hex').match(/.{4}/g)!.join('-').toUpperCase();
      const check = await client.query('SELECT 1 FROM invites WHERE code = $1', [code]);
      if (check.rowCount === 0) exists = false;
      attempts++;
    }

    if (exists) {
      client.release();
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
    }

    // Unix timestamp in seconds (binary compatibility with legacy PHP)
    const validToSeconds = Math.floor(Date.now() / 1000) + parseInt(hours) * 3600;
    
    // Manual ID generation to avoid sequence desync issues
    const idRes = await client.query('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM invites');
    const nextId = idRes.rows[0].next_id;

    await client.query(`
      INSERT INTO invites (id, code, valid_to, id_animal, gens, time_added)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [nextId, code, validToSeconds, parseInt(id), parseInt(gens)]);

    client.release();
    
    const url = `${req.nextUrl.origin}/guest/goats/${code}`;
    
    return NextResponse.json({ url, code });
  } catch (error: any) {
    console.error('Invite generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
