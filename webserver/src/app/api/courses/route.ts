import { NextRequest, NextResponse } from "next/server";
import { firebase } from "lib/firebaseServer";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageFile = formData.get("image") as File | null;

  const buffer = imageFile ? Buffer.from(await imageFile.arrayBuffer()) : null;

  return {
    fields: { name, description },
    file: buffer
      ? { buffer, originalName: imageFile?.name, mime: imageFile?.type }
      : null,
  };
}

async function uploadCoverImage(buffer: Buffer, courseId: string) {
  const bucket = firebase().storage().bucket();
  const imagePath = `courses/${courseId}/cover.webp`;
  const fileRef = bucket.file(imagePath);

  const webpBuffer = await sharp(buffer)
    .resize(1200, 675, { fit: "cover" })
    .toFormat("webp")
    .toBuffer();

  await fileRef.save(webpBuffer, {
    metadata: { contentType: "image/webp" },
  });

  await fileRef.makePublic();
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid token" },
      { status: 401 }
    );
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await firebase().auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { fields, file } = await parseFormData(req);
    if (!fields.name) {
      return NextResponse.json(
        { error: "Course name is required" },
        { status: 400 }
      );
    }

    const courseId = uuidv4();

    if (file?.buffer) {
      try {
        await uploadCoverImage(file.buffer, courseId);
      } catch (err) {
        console.error("Image processing failed:", err);
      }
    }

    await firebase()
      .database()
      .ref(`/courses/${courseId}`)
      .set({
        name: fields.name,
        description: fields.description || "",
        ownerId: userId,
        createdAt: new Date().toISOString(),
      });

    return NextResponse.json(
      { success: true, courseId, message: "Course created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
