import admin from "firebase-admin";

function getFirebaseAdmin() {
  try {
    return admin.app();
  } catch {
    return admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,

      databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,

      credential: admin.credential.cert(
        JSON.parse(atob(process.env.SERVICE_ACCOUNT ?? ""))
      ),
    });
  }
}

export const firebase = getFirebaseAdmin;
