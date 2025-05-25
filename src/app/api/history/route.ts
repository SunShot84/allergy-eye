import { NextResponse, type NextRequest } from 'next/server';
import db from '@/lib/db';
import { getUserFromSessionToken, AuthenticatedUser } from '@/lib/auth';
import { ScanResultItem } from '@/lib/types';
import { z } from 'zod';
import crypto from 'crypto';

// GET - Fetch all scan history for the user
export async function GET(request: NextRequest) {
  const user: AuthenticatedUser | null = getUserFromSessionToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const historyStmt = db.prepare('SELECT id, scan_data, timestamp FROM scan_history WHERE user_id = ? ORDER BY timestamp DESC');
    const historyRows = historyStmt.all(user.id) as { id: string; scan_data: string; timestamp: number }[];
    
    const historyItems: ScanResultItem[] = historyRows.map(row => {
      const parsedData = JSON.parse(row.scan_data);
      return {
        ...parsedData,
        id: row.id,
        timestamp: row.timestamp
      } as ScanResultItem;
    });

    return NextResponse.json(historyItems, { status: 200 });
  } catch (error: any) {
    console.error('[HISTORY_GET_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// Define Zod schema for ScanResultItem validation
const scanResultItemSchemaForPost = z.object({
  imageDataUrl: z.string().url(),
  identifiedAllergens: z.array(z.object({
    allergenId: z.string(),
    confidence: z.number(),
    sourceFoodItem: z.string().optional(),
  })),
  prioritizedAllergens: z.array(z.string()),
  userProfileAllergiesAtScanTime: z.array(z.string()),
  foodDescription: z.string().optional(),
  extractedText: z.string().optional(),
  scanType: z.enum(['food', 'ingredients'])
});

// POST - Add a new scan history item
export async function POST(request: NextRequest) {
  const user: AuthenticatedUser | null = getUserFromSessionToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const rawData = await request.json();
    
    // Validate the incoming data against the schema
    const parsedData = scanResultItemSchemaForPost.safeParse(rawData);
    if (!parsedData.success) {
      return NextResponse.json({ message: "Invalid scan data format", errors: parsedData.error.format() }, { status: 400 });
    }
    
    const scanData: Omit<ScanResultItem, 'id' | 'timestamp'> = parsedData.data;

    const newId = crypto.randomUUID();
    const timestamp = Date.now();
    const scanDataJson = JSON.stringify(scanData);

    const insertStmt = db.prepare(
      'INSERT INTO scan_history (id, user_id, timestamp, scan_data) VALUES (?, ?, ?, ?)'
    );
    insertStmt.run(newId, user.id, timestamp, scanDataJson);

    // Return the newly created item with its ID and timestamp
    const newHistoryItem: ScanResultItem = {
      ...scanData,
      id: newId,
      timestamp: timestamp,
    };

    return NextResponse.json(newHistoryItem, { status: 201 });
  } catch (error: any) {
    console.error('[HISTORY_POST_ERROR]', error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({ message: 'Invalid JSON format in request body.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// DELETE - Clear all scan history for the user
export async function DELETE(request: NextRequest) {
  const user: AuthenticatedUser | null = getUserFromSessionToken(request);
  if (!user) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const deleteStmt = db.prepare('DELETE FROM scan_history WHERE user_id = ?');
    deleteStmt.run(user.id);
    return NextResponse.json({ message: 'Scan history cleared successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('[HISTORY_DELETE_ALL_ERROR]', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
} 