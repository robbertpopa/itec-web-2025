import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import { firebase } from 'lib/firebaseServer';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';
import os from 'os';
import path from 'path';
import sharp from 'sharp';

// Initialize Firebase Admin once
const firebaseApp = firebase();
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

// Helper to parse FormData using native Web APIs
async function parseFormData(req: NextRequest) {
  try {
    // Use the native FormData API to parse the multipart/form-data
    const formData = await req.formData();
    
    // Extract the fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;
    
    // Create a temporary directory
    const tempDir = os.tmpdir();
    const uploadDir = join(tempDir, 'course-uploads');
    await fs.mkdir(uploadDir, { recursive: true }).catch(console.error);
    
    // Save the file to disk if it exists
    let savedFilePath: string | null = null;
    if (imageFile && imageFile.name) { // Make sure we have a file with a name
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate a unique filename
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${imageFile.name.split('.').pop()}`;
      savedFilePath = path.join(uploadDir, uniqueFilename);
      
      // Save the file to disk
      await fs.writeFile(savedFilePath, buffer);
    }
    
    return {
      fields: {
        name,
        description
      },
      file: savedFilePath ? {
        filepath: savedFilePath,
        originalFilename: imageFile?.name,
        mimetype: imageFile?.type
      } : null
    };
  } catch (error) {
    console.error('Error parsing form data:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Extract and verify the Firebase auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;
      
      const { fields, file } = await parseFormData(req);
      
      if (!fields.name) {
        return NextResponse.json(
          { error: 'Course name is required' },
          { status: 400 }
        );
      }
      
      const courseId = uuidv4();
      
      let imageUrl: string | null = null;
      
      if (file && file.filepath) {
        try {
          console.log('Processing image:', file.filepath);
          const imageBuffer = await fs.readFile(file.filepath);
          const webpBuffer = await sharp(imageBuffer)
            .resize(1200, 675, { fit: 'cover' })
            .toFormat('webp')
            .toBuffer();
          
          const bucket = storage.bucket();
          const imagePath = `courses/${courseId}/cover.webp`;
          const fileRef = bucket.file(imagePath);
          
          await fileRef.save(webpBuffer, {
            metadata: {
              contentType: 'image/webp',
            },
          });
          
          await fileRef.makePublic();
          
          imageUrl = `https://storage.googleapis.com/${bucket.name}/${imagePath}`;
          
          await fs.unlink(file.filepath).catch(console.error);
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
      
      console.log('Creating course in database:', {
        name: fields.name,
        description: fields.description,
        ownerId: userId,
        imageUrl
      });
      
      const courseRef = db.ref(`/courses/${courseId}`);
      
      await courseRef.set({
        name: fields.name,
        description: fields.description || '',
        ownerId: userId,
        imageUrl,
        createdAt: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { 
          success: true, 
          courseId,
          message: 'Course created successfully' 
        },
        { status: 201 }
      );
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}