import admin from "firebase-admin";
import { firebaseConfig } from "./firebaseConfig";

function getFirebaseAdmin() {
  try {
    return admin.app();
  } catch {
    return admin.initializeApp({
      ...firebaseConfig,
      credential: admin.credential.cert(
        JSON.parse(atob(process.env.NEXT_PUBLIC_SERVICE_ACCOUNT ?? ""))
      ),
    });
  }
}

export const firebase = getFirebaseAdmin;
