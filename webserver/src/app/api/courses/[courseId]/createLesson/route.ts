import { NextRequest, NextResponse } from "next/server";
import { firebase } from "lib/firebaseServer";
import { getDatabase } from "firebase-admin/database";

const firebaseApp = firebase();
const db = getDatabase(firebaseApp);
const bucket = firebaseApp.storage().bucket();

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid token" },
      { status: 401 }
    );
  }

  try {
    const { courseId, lessonIndex, lessonName } = await req.json();
    if (!courseId || lessonIndex === undefined || !lessonName) {
      return NextResponse.json(
        { error: "courseId, lessonIndex, and lessonName are required" },
        { status: 400 }
      );
    }

    await db.ref(`/courses/${courseId}/lessons/${lessonIndex}`).set(lessonName);

    const markdownContent = `# ${lessonName}

                            Welcome to lesson ${lessonIndex} of course ${courseId}.

                            This lesson covers important topics including:
                            - Topic 1
                            - Topic 2
                            - Topic 3

                            Enjoy your learning experience!`;

    const filePath = `courses/${courseId}/${lessonIndex}/main.md`;
    const fileRef = bucket.file(filePath);

    await fileRef.save(markdownContent, {
      metadata: { contentType: "text/markdown" },
    });

    return NextResponse.json(
      { success: true, message: "Lesson created successfully", filePath },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
