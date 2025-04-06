import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { firebase } from 'lib/firebaseServer';

const firebaseApp = firebase();
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid token" },
      { status: 401 }
    );
  }
  const { userId } = await params;
  try {
    const user = await db.ref(`/users/${userId}`).get();
    return NextResponse.json({ success: true, user, message: 'User received' }, { status: 201 });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
