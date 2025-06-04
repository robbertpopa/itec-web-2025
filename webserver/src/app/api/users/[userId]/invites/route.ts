import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { firebase } from "lib/firebaseServer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const firebaseApp = firebase();
  const auth = getAuth(firebaseApp);
  const db = getDatabase(firebaseApp);

  const { userId } = await params;
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
    if (decodedToken.uid !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const invitesRef = db.ref(`/users/${userId}/invitedCourses`);
    const invitesSnapshot = await invitesRef.get();

    if (!invitesSnapshot.exists()) {
      return NextResponse.json({ success: true, invites: [] });
    }

    const courseIds = Object.keys(invitesSnapshot.val());
    const coursesRef = db.ref(`/courses`);
    const coursesSnapshot = await coursesRef.get();
    const coursesData = coursesSnapshot.exists() ? coursesSnapshot.val() : {};

    const invites = courseIds
      .map((id) => {
        const course = coursesData[id];
        if (!course) return null;
        return { id, ...(course as object) };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, invites });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const firebaseApp = firebase();
  const auth = getAuth(firebaseApp);
  const db = getDatabase(firebaseApp);

  const { userId } = await params;
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
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    updates[`/users/${userId}/invitedCourses/${courseId}`] = null;
    updates[`/courses/${courseId}/invitedUsers/${userId}`] = null;
    updates[`/users/${userId}/enrollments/${courseId}`] = {
      courseId,
      enrolledAt: new Date().toISOString(),
      status: "active",
    };

    await db.ref().update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const firebaseApp = firebase();
  const auth = getAuth(firebaseApp);
  const db = getDatabase(firebaseApp);

  const { userId } = await params;
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
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    updates[`/users/${userId}/invitedCourses/${courseId}`] = null;
    updates[`/courses/${courseId}/invitedUsers/${userId}`] = null;

    await db.ref().update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error declining invite:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
