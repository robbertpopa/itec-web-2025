import admin from "firebase-admin";

function getFirebaseAdmin() {
  try {
    return admin.app();
  } catch {
    const svc = process.env.SERVICE_ACCOUNT;
    let credential: admin.credential.Credential;
    if (svc) {
      try {
        credential = admin.credential.cert(
          JSON.parse(Buffer.from(svc, "base64").toString("utf8"))
        );
      } catch (err) {
        console.error("Failed to parse service account JSON", err);
        credential = admin.credential.applicationDefault();
      }
    } else {
      credential = admin.credential.applicationDefault();
    }

    return admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      credential,
    });
  }
}

export const firebase = getFirebaseAdmin;
