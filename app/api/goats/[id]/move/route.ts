import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const client = await pool.connect();
    
    // Fetch movement history
    const historyRes = await client.query(`
      SELECT 
        m.*,
        f1.name as farm_from_name,
        f2.name as farm_to_name
      FROM goats_move m
      LEFT JOIN farms f1 ON m.id_farm_of = f1.id
      LEFT JOIN farms f2 ON m.id_farm_on = f2.id
      WHERE m.id_goat = $1
      ORDER BY m.time_added DESC
    `, [id]);

    // Fetch current farm for the goat
    const currentFarmRes = await client.query(`
      SELECT id_farm FROM animals WHERE id = $1
    `, [id]);

    client.release();
    
    return NextResponse.json({
      history: historyRes.rows,
      currentFarmId: currentFarmRes.rows[0]?.id_farm || 0
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch movement data' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { id_farm_of, id_farm_on, id_reason, date_return, info } = body;
  
  console.log('Record movement payload:', { id, id_farm_of, id_farm_on, id_reason, date_return, info });

  try {
    const client = await pool.connect();
    
    // 1. Insert into goats_move (Manually generating ID as sequence is missing)
    try {
      await client.query(`
        INSERT INTO goats_move (id, id_goat, id_farm_of, id_farm_on, id_reason, date_return, info, time_added)
        VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM goats_move), $1, $2, $3, $4, $5, $6, NOW())
      `, [
        parseInt(id), 
        parseInt(id_farm_of), 
        parseInt(id_farm_on), 
        parseInt(id_reason || 0), 
        date_return || null, 
        info || ''
      ]);
    } catch (dbErr: any) {
      console.error('Database error in goats_move insert:', dbErr.message, dbErr.stack);
      client.release();
      return NextResponse.json({ error: 'Database insert failed: ' + dbErr.message }, { status: 500 });
    }
    
    // 2. Update animals.id_farm
    try {
      await client.query(`
        UPDATE animals SET id_farm = $1 WHERE id = $2
      `, [parseInt(id_farm_on), parseInt(id)]);
    } catch (dbErr: any) {
      console.error('Database error in animals update:', dbErr.message, dbErr.stack);
      client.release();
      return NextResponse.json({ error: 'Database update failed: ' + dbErr.message }, { status: 500 });
    }
    
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Internal server error in movement API:', error.message, error.stack);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
