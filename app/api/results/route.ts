import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Initialize database table (runs automatically on first query)
async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS game_results (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        total_score INTEGER NOT NULL,
        round_scores INTEGER[] NOT NULL,
        network_privilege BOOLEAN NOT NULL,
        opportunity_privilege BOOLEAN NOT NULL,
        video_game_frequency VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (error) {
    console.error('Database init error:', error);
  }
}

export async function GET() {
  try {
    await initDatabase();
    const { rows } = await sql`
      SELECT 
        id,
        username,
        total_score as "totalScore",
        round_scores as "roundScores",
        network_privilege as "networkPrivilege",
        opportunity_privilege as "opportunityPrivilege",
        video_game_frequency as "videoGameFrequency",
        timestamp
      FROM game_results
      ORDER BY timestamp DESC
    `;
    return NextResponse.json({ results: rows });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDatabase();
    const data = await request.json();
    
    await sql`
      INSERT INTO game_results (
        username,
        total_score,
        round_scores,
        network_privilege,
        opportunity_privilege,
        video_game_frequency
      ) VALUES (
        ${data.username},
        ${data.totalScore},
        ${data.roundScores},
        ${data.networkPrivilege},
        ${data.opportunityPrivilege},
        ${data.videoGameFrequency}
      )
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      // Delete specific entry by ID
      await sql`DELETE FROM game_results WHERE id = ${id}`;
      return NextResponse.json({ success: true, message: 'Entry deleted' });
    } else {
      // Delete all entries
      await sql`DELETE FROM game_results`;
      return NextResponse.json({ success: true, message: 'All entries deleted' });
    }
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
