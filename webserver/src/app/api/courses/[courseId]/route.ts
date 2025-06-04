import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { firebase } from 'lib/firebaseServer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const firebaseApp = firebase();
  const auth = getAuth(firebaseApp);
  const db = getDatabase(firebaseApp);

  const { courseId } = await params;
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid token' },
      { status: 401 }
    );
  }
  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid;

    const courseRef = db.ref(`/courses/${courseId}`);
    const courseSnapshot = await courseRef.get();
    if (!courseSnapshot.exists()) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const courseData = courseSnapshot.val();
    if (courseData.ownerId !== userId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { access } = await req.json();
    if (!access || !['open', 'invite'].includes(access)) {
      return NextResponse.json({ error: 'Invalid access value' }, { status: 400 });
    }

    await courseRef.update({ access });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
