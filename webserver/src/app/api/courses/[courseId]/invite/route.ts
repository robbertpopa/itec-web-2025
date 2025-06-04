import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { firebase } from "lib/firebaseServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const firebaseApp = firebase();
  const auth = getAuth(firebaseApp);
  const db = getDatabase(firebaseApp);

  const { courseId } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid token" },
      { status: 401 }
    );
  }
  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const requesterId = decodedToken.uid;

    const courseRef = db.ref(`/courses/${courseId}`);
    const courseSnapshot = await courseRef.get();
    if (!courseSnapshot.exists()) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseData = courseSnapshot.val();
    if (courseData.ownerId !== requesterId) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    updates[`/courses/${courseId}/invitedUsers/${userId}`] = true;
    updates[`/users/${userId}/invitedCourses/${courseId}`] = true;
    await db.ref().update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
