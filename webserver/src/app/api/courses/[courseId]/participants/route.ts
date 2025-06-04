import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { firebase } from "lib/firebaseServer";

export async function GET(
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
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid;

    const courseRef = db.ref(`/courses/${courseId}`);
    const courseSnapshot = await courseRef.get();
    if (!courseSnapshot.exists()) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseData = courseSnapshot.val();
    if (courseData.ownerId !== userId && !courseData.invitedUsers?.[userId]) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const usersRef = db.ref("/users");
    const usersSnapshot = await usersRef.get();
    if (!usersSnapshot.exists()) {
      return NextResponse.json({ success: true, participants: [] });
    }
    const usersData = usersSnapshot.val();
    const participants: Array<{ id: string; fullName: string; profilePicture: string }> = [];

    for (const uid of Object.keys(usersData)) {
      const userData = usersData[uid];
      if (userData.enrollments && userData.enrollments[courseId]) {
        participants.push({
          id: uid,
          fullName: userData.fullName || "",
          profilePicture: userData.profilePicture || "",
        });
      }
    }

    // include owner if not enrolled yet
    if (!participants.find((p) => p.id === courseData.ownerId)) {
      const owner = usersData[courseData.ownerId];
      if (owner) {
        participants.unshift({
          id: courseData.ownerId,
          fullName: owner.fullName || "",
          profilePicture: owner.profilePicture || "",
        });
      }
    }

    return NextResponse.json({ success: true, participants });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
