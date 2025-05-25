import { NextResponse, type NextRequest } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    // 修正查询，使用正确的列名：token 而不是 id
    const sessionStmt = db.prepare(`
      SELECT s.user_id, u.username 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.token = ? AND s.expires_at > unixepoch()
    `);
    
    const session = sessionStmt.get(token) as { user_id: string; username: string } | undefined;

    if (!session) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.json(
      {
        message: 'Token is valid',
        user: { 
          id: session.user_id, 
          username: session.username 
        },
        token: token // 返回相同的令牌以供客户端确认
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[VERIFY_TOKEN_POST_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 