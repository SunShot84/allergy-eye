import { NextResponse, type NextRequest } from 'next/server';
import db from '@/lib/db';
import { getUserFromSessionToken, AuthenticatedUser } from '@/lib/auth';

// DELETE - Delete a specific scan history item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user: AuthenticatedUser | null = getUserFromSessionToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const { id: itemId } = params;

  if (!itemId || typeof itemId !== 'string') {
    return NextResponse.json({ message: 'Scan history item ID is required' }, { status: 400 });
  }

  try {
    // Ensure the item belongs to the current user before deleting
    const itemCheckStmt = db.prepare('SELECT user_id FROM scan_history WHERE id = ?');
    const itemOwner = itemCheckStmt.get(itemId) as { user_id: string } | undefined;

    if (!itemOwner) {
      return NextResponse.json({ message: 'Scan history item not found' }, { status: 404 });
    }

    if (itemOwner.user_id !== user.id) {
      return NextResponse.json({ message: 'Forbidden: You do not own this resource' }, { status: 403 });
    }

    const deleteStmt = db.prepare('DELETE FROM scan_history WHERE id = ? AND user_id = ?');
    const result = deleteStmt.run(itemId, user.id);

    if (result.changes > 0) {
      return NextResponse.json({ message: 'Scan history item deleted successfully' }, { status: 200 });
    } else {
      // This case should ideally be caught by the !itemOwner check, but as a fallback:
      return NextResponse.json({ message: 'Item not found or already deleted' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('[HISTORY_DELETE_ITEM_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 