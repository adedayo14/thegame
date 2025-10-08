import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Fallback in-memory storage if database is not configured
let memoryStorage: Array<{
  id: number;
  username: string;
  totalScore: number;
  roundScores: number[];
  networkPrivilege: boolean;
  opportunityPrivilege: boolean;
  videoGameFrequency: string;
  timestamp: string;
}> = [];

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
    return true;
  } catch (error) {
    console.error('Database init error - using memory storage:', error);
    return false;
  }
}

export async function GET() {
  try {
    const dbAvailable = await initDatabase();
    if (!dbAvailable) {
      // Return memory storage if DB not available
      return NextResponse.json({ results: memoryStorage });
    }
    
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
    // Fallback to memory storage
    return NextResponse.json({ results: memoryStorage });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const dbAvailable = await initDatabase();
    
    if (!dbAvailable) {
      // Use memory storage if DB not available
      memoryStorage.push({
        id: memoryStorage.length + 1,
        ...data,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, storage: 'memory' });
    }
    
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
    
    return NextResponse.json({ success: true, storage: 'database' });
  } catch (error) {
    console.error('POST error:', error);
    // Fallback to memory storage
    try {
      const data = await request.json();
      memoryStorage.push({
        id: memoryStorage.length + 1,
        ...data,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, storage: 'memory' });
    } catch {
      return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
    }
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const dbAvailable = await initDatabase();
    
    if (!dbAvailable) {
      // Use memory storage
      if (id) {
        memoryStorage = memoryStorage.filter(r => r.id !== parseInt(id));
      } else {
        memoryStorage = [];
      }
      return NextResponse.json({ success: true, storage: 'memory' });
    }
    
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
