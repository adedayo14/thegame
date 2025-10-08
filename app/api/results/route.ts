import { NextResponse } from 'next/server';

// In-memory storage (will reset on deployment restart)
// For production, you'd use a real database
let gameResults: any[] = [];

export async function GET() {
  return NextResponse.json({ results: gameResults });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    gameResults.push({
      ...data,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }
}

export async function DELETE() {
  gameResults = [];
  return NextResponse.json({ success: true });
}
