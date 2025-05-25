import db from '@/lib/db';
import { type NextRequest } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  username: string;
}

/**
 * Retrieves user information from a session token.
 * The token is expected to be in the Authorization header as a Bearer token.
 * @param request - The NextRequest object.
 * @returns The authenticated user object or null if the token is invalid or not found.
 */
export function getUserFromSessionToken(request: NextRequest): AuthenticatedUser | null {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split('Bearer ')?.[1];

  if (!token) {
    return null;
  }

  try {
    // Query from your sessions table
    // Ensure expires_at is checked against the current time
    // The column names (token, user_id, expires_at) must match your sessions table schema
    const sessionStmt = db.prepare(
      'SELECT s.user_id, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > unixepoch()'
    );
    // Assuming expires_at is stored as UNIX epoch seconds. 
    // If it's ISO string, use datetime('now') or similar and adjust the query.
    // The user_id in sessions table should match the id in users table.
    const session = sessionStmt.get(token) as { user_id: string; username: string } | undefined;

    if (session) {
      return { id: session.user_id, username: session.username };
    }
    return null;
  } catch (error) {
    console.error("Error verifying session token:", error);
    return null;
  }
} 