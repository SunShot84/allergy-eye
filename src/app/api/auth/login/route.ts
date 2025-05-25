import { NextResponse, type NextRequest } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
  // captchaToken: z.string().optional(), // For future captcha
});

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input", errors: parsed.error.format() }, { status: 400 });
    }

    const { username, password } = parsed.data;

    // Get user with all necessary fields
    const userStmt = db.prepare('SELECT id, username, password_hash, allergy_profile FROM users WHERE username = ?');
    const user = userStmt.get(username) as { 
      id: string; 
      username: string; 
      password_hash: string;
      allergy_profile: string | null;
    } | undefined;

    if (!user) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordIsValid) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    // Generate a secure session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    // Store session in the database
    const sessionStmt = db.prepare(
      'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
    );
    
    try {
      // Store expires_at as UNIX timestamp (seconds)
      sessionStmt.run(sessionToken, user.id, Math.floor(expiresAt.getTime() / 1000));

      // Parse allergy profile
      const profile = user.allergy_profile ? JSON.parse(user.allergy_profile) : { knownAllergies: [] };

      return NextResponse.json(
        {
          message: 'Login successful',
          token: sessionToken,
          user: {
            id: user.id,
            username: user.username,
            profile: profile
          }
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Failed to create session:', error);
      return NextResponse.json({ message: 'Failed to create session' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[LOGIN_POST_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 