import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { firebase } from "lib/firebaseServer";

export async function POST(req: NextRequest) {
  const firebaseApp = firebase();
  const auth = getAuth(firebaseApp);
  const db = getDatabase(firebaseApp);

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
    const userId = decodedToken.uid;

    const data = await req.json();
    const { courseId } = data;

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    const courseRef = db.ref(`/courses/${courseId}`);
    const courseSnapshot = await courseRef.get();

    if (!courseSnapshot.exists()) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const enrollmentData = {
      courseId,
      enrolledAt: new Date().toISOString(),
      status: "active",
    };

    await db
      .ref(`/users/${userId}/enrollments/${courseId}`)
      .set(enrollmentData);

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in the course",
      enrollment: enrollmentData,
    });
  } catch (error) {
    console.error("Error in enrollment API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const firebaseApp = firebase();
  const auth = getAuth(firebaseApp);
  const db = getDatabase(firebaseApp);

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
    const userId = decodedToken.uid;

    const enrollmentsRef = db.ref(`/users/${userId}/enrollments`);
    const enrollmentsSnapshot = await enrollmentsRef.get();

    const enrollments = enrollmentsSnapshot.exists()
      ? enrollmentsSnapshot.val()
      : {};

    return NextResponse.json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("Error in enrollment API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const firebaseApp = firebase();
  const auth = getAuth(firebaseApp);
  const db = getDatabase(firebaseApp);

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
    const userId = decodedToken.uid;

    const data = await req.json();
    const { courseId } = data;

    if (!courseId) {
      return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
    }

    await db.ref(`/users/${userId}/enrollments/${courseId}`).remove();

    return NextResponse.json({
      success: true,
      message: "Successfully unenrolled from the course",
    });
  } catch (error) {
    console.error("Error in enrollment API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
