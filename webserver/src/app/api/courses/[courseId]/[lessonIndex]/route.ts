import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { firebase } from "lib/firebaseServer";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonIndex: string }> }
) {
  const firebaseApp = firebase();
  const auth = getAuth(firebaseApp);
  const bucket = firebaseApp.storage().bucket();

  const { courseId, lessonIndex } = await params;
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid token" },
      { status: 401 }
    );
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    await auth.verifyIdToken(token);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `courses/${courseId}/${lessonIndex}/${file.name}`;
    const fileRef = bucket.file(filePath);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type || "application/octet-stream" },
    });

    await fileRef.makePublic();

    return NextResponse.json(
      { success: true, message: "File uploaded successfully", filePath },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
