import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getStorage } from "firebase-admin/storage";
import { firebase } from "lib/firebaseServer";
import sharp from "sharp";

async function urlToFile(
  url: string,
  filename: string,
  mimeType?: string
): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch image");
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType || blob.type });
}

async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const fullName = formData.get("full_name") as string;
  const imageField = formData.get("image");
  let imageFile: File | null = null;
  if (typeof imageField === "string") {
    imageFile = await urlToFile(imageField, "downloadedImage.webp");
  } else if (imageField instanceof File) {
    imageFile = imageField;
  }
  const buffer = imageFile ? Buffer.from(await imageFile.arrayBuffer()) : null;
  return {
    fields: { fullName },
    file: buffer
      ? { buffer, originalName: imageFile!.name, mime: imageFile!.type }
      : null,
  };
}

async function uploadProfilePicture(
  buffer: Buffer,
  userId: string
): Promise<string> {
  const firebaseApp = firebase();
  const storage = getStorage(firebaseApp);

  const bucket = storage.bucket();
  const imagePath = `users/${userId}/profile_picture.webp`;
  const fileRef = bucket.file(imagePath);
  const webpBuffer = await sharp(buffer)
    .resize(256, 256, { fit: "cover" })
    .toFormat("webp")
    .toBuffer();
  await fileRef.save(webpBuffer, { metadata: { contentType: "image/webp" } });
  await fileRef.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${imagePath}`;
}

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
    const { fields, file } = await parseFormData(req);
    let imageUrl: string | null = null;
    if (file?.buffer) {
      imageUrl = await uploadProfilePicture(file.buffer, userId);
    }
    await db.ref(`/users/${userId}`).set({
      fullName: fields.fullName,
      profilePicture: imageUrl,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: true, userId, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in user API:", error);
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
    const requesterId = decodedToken.uid;

    const url = new URL(req.url);
    const queryUserId = url.searchParams.get("userId");

    if (queryUserId) {
      const userRef = db.ref(`/users/${queryUserId}`);
      const snapshot = await userRef.get();

      if (!snapshot.exists()) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userData = snapshot.val();

      return NextResponse.json({
        success: true,
        user: {
          id: queryUserId,
          fullName: userData.fullName || "",
          profilePicture: userData.profilePicture || "",
        },
      });
    }

    const userRef = db.ref(`/users/${requesterId}`);
    const snapshot = await userRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json({
        success: true,
        user: {
          id: requesterId,
          fullName: "",
          profilePicture: "",
        },
      });
    }

    const userData = snapshot.val();

    return NextResponse.json({
      success: true,
      user: {
        id: requesterId,
        fullName: userData.fullName || "",
        profilePicture: userData.profilePicture || "",
      },
    });
  } catch (error) {
    console.error("Error in user GET API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
