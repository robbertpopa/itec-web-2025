import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import { firebase } from 'lib/firebaseServer';
import sharp from 'sharp';

const firebaseApp = firebase();
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);


async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const imageFile = formData.get('image') as File | null;

  const buffer = imageFile ? Buffer.from(await imageFile.arrayBuffer()) : null;
  return { file: buffer ? { buffer, originalName: imageFile!.name, mime: imageFile!.type } : null };
}


async function uploadProfilePicture(buffer: Buffer, userId: string): Promise<string> {
  const bucket = storage.bucket();
  const imagePath = `users/${userId}/profile_picture.webp`;
  const fileRef = bucket.file(imagePath);
  const webpBuffer = await sharp(buffer)
    .resize(256, 256, { fit: 'cover' })
    .toFormat('webp')
    .toBuffer();
  await fileRef.save(webpBuffer, { metadata: { contentType: 'image/webp' } });
  await fileRef.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${imagePath}`;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const { file } = await parseFormData(req);
    let imageUrl: string | null = null;
    if (file?.buffer) {
      imageUrl = await uploadProfilePicture(file.buffer, userId);
    }
    await db.ref(`/users/${userId}`).update({
      profilePicture: imageUrl,
    });
    return NextResponse.json({ success: true, userId, message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
