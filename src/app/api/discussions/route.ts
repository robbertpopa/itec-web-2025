import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { firebase } from 'lib/firebaseServer';

const firebaseApp = firebase();
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { courseId, message } = await req.json();

    if (!courseId || !message) {
      return NextResponse.json({ 
        error: 'Course ID and message are required' 
      }, { status: 400 });
    }

    const userSnapshot = await db.ref(`/users/${userId}`).get();
    const userData = userSnapshot.val() || {};
    
    const createdAt = new Date().toISOString();
    
    const commentRef = db.ref(`/discussions/${courseId}`).push();
    
    await commentRef.set({
      userId,
      message,
      createdAt,
      timestamp: { '.sv': 'timestamp' }
  });

    return NextResponse.json({
      success: true,
      comment: {
        id: commentRef.key,
        userId,
        userName: userData.fullName || userData.displayName || '',
        profilePicture: userData.profilePicture || '',
        message,
        createdAt
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}