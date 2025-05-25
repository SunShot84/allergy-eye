import { NextResponse, type NextRequest } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  // captchaToken: z.string().optional(), // For future captcha
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input", errors: parsed.error.format() }, { status: 400 });
    }

    const { username, password } = parsed.data;

    // Check if user already exists
    const existingUserStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    const existingUser = existingUserStmt.get(username);

    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate a unique ID for the new user
    const userId = crypto.randomUUID();

    // Create default allergy profile
    const defaultAllergyProfile = JSON.stringify({
      knownAllergies: []
    });

    // Insert new user with the generated ID and default allergy profile
    const insertStmt = db.prepare(
      'INSERT INTO users (id, username, password_hash, allergy_profile) VALUES (?, ?, ?, ?)'
    );

    try {
      insertStmt.run(userId, username, hashedPassword, defaultAllergyProfile);

      return NextResponse.json({ 
        message: 'User registered successfully',
        user: {
          id: userId,
          username: username
        }
      }, { status: 201 });

    } catch (error) {
      console.error('Failed to create user:', error);
      return NextResponse.json({ message: 'Failed to create user account' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[REGISTER_POST_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 