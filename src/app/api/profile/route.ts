import { NextResponse, type NextRequest } from 'next/server';
import db from '@/lib/db';
import { getUserFromSessionToken, AuthenticatedUser } from '@/lib/auth';

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  const user: AuthenticatedUser | null = getUserFromSessionToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const profileStmt = db.prepare('SELECT allergy_profile FROM users WHERE id = ?');
    const result = profileStmt.get(user.id) as { allergy_profile: string | null } | undefined;

    if (result && result.allergy_profile) {
      return NextResponse.json(JSON.parse(result.allergy_profile), { status: 200 });
    } else {
      // If no profile stored, return a default empty profile structure
      // This matches what loadUserProfile from localStorage used to do.
      return NextResponse.json({ knownAllergies: [] }, { status: 200 });
    }
  } catch (error: any) {
    console.error('[PROFILE_GET_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// POST - Update user profile
export async function POST(request: NextRequest) {
  const user: AuthenticatedUser | null = getUserFromSessionToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const profileData = await request.json(); // Expects { knownAllergies: string[] }
    
    // Basic validation of incoming data (can be enhanced with Zod)
    if (!profileData || !Array.isArray(profileData.knownAllergies) || !profileData.knownAllergies.every((item: any) => typeof item === 'string')) {
        return NextResponse.json({ message: 'Invalid profile data format. Expected { knownAllergies: string[] }.' }, { status: 400 });
    }

    const profileJson = JSON.stringify(profileData);

    const updateStmt = db.prepare('UPDATE users SET allergy_profile = ? WHERE id = ?');
    updateStmt.run(profileJson, user.id);

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('[PROFILE_POST_ERROR]', error);
    // Check if the error is due to invalid JSON in the request body
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ message: 'Invalid JSON format in request body.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 