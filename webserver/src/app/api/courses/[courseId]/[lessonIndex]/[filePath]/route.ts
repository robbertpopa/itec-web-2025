import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { firebase } from "lib/firebaseServer";
import { getDatabase } from "firebase-admin/database";
import { v4 as uuidv4 } from "uuid";

const firebaseApp = firebase();
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
      lessonIndex: string;
      filePath: string;
    }>;
  }
) {
  const { filePath } = await params;
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

    const uniqueId = uuidv4();
    await db.ref(`summarizeQueue/${uniqueId}`).set({
      path: filePath,
      status: "waiting",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Queue entry created successfully",
        queueId: uniqueId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating queue entry:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
