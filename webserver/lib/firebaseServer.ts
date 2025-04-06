import admin from 'firebase-admin';
import { firebaseConfig } from './firebaseConfig';

function getFirebaseAdmin() {
  try {
    return admin.app();
  } catch {
    return admin.initializeApp({
      ...firebaseConfig,
      credential: admin.credential.cert('.firebase-service-account.json'),
    });
  }
}

export const firebase = getFirebaseAdmin;
