import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { firebase } from 'lib/firebaseServer';
import { getDatabase } from 'firebase-admin/database';

const firebaseApp = firebase();
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const requestUserId = decodedToken.uid;

    if (requestUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot update another user\'s programmed lessons' },
        { status: 403 }
      );
    }

    const { date, isMarked } = await req.json();

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const dateObj = new Date(date);
    const dateISOString = dateObj.toISOString();
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
    const day = String(dateObj.getDate()).padStart(2, '0');
    const datePath = `${year}${month}${day}`;
    
    const programmedLessonsRef = db.ref(`/users/${userId}/programmedLessons`);

    if (isMarked) {
      await programmedLessonsRef.child(datePath).set({
        date: dateISOString,
        createdAt: new Date().toISOString(),
        timestamp: { '.sv': 'timestamp' }
      });
    } else {
      await programmedLessonsRef.child(datePath).remove();
    }

    return NextResponse.json(
      {
        success: true,
        message: isMarked ? 'Lesson day marked successfully' : 'Lesson day unmarked successfully',
        date: dateISOString
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating programmed lessons:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const requestUserId = decodedToken.uid;

    if (requestUserId !== userId) {
      return NextResponse.json({ error: 'Unauthorized: Cannot access another user\'s programmed lessons' }, { status: 403 });
    }

    const programmedLessonsRef = db.ref(`/users/${userId}/programmedLessons`);
    const snapshot = await programmedLessonsRef.get();
    
    if (!snapshot.exists()) {
      return NextResponse.json({ success: true, programmedLessons: [] });
    }
    
    const programmedLessons = snapshot.val();
    const formattedLessons = Object.keys(programmedLessons).map(key => ({
      date: programmedLessons[key].date,
      createdAt: programmedLessons[key].createdAt
    }));

    return NextResponse.json({
      success: true,
      programmedLessons: formattedLessons
    });
    
  } catch (error) {
    console.error('Error fetching programmed lessons:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
