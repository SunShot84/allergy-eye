import { NextResponse, type NextRequest } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // In a real app with HttpOnly cookies, the client wouldn't send the token like this.
    // The token would be in the cookie, and you might not even need a body.
    // Or, the client sends an empty POST, and the server clears the cookie.
    // For token-in-body/header based auth, the client would send it.

    const token = request.headers.get('Authorization')?.split('Bearer ')?.[1];

    if (token) {
      // Delete the session from the database
      const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
      stmt.run(token);
    }

    // If using HttpOnly cookies, you would clear it here:
    // const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    // response.cookies.set('session_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', expires: new Date(0) });
    // return response;

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  } catch (error: any) {
    console.error('[LOGOUT_POST_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 