import admin from 'firebase-admin';
import { firebaseConfig } from './firebaseConfig';

let _firebase: admin.app.App | null = null;
export const firebase = () => _firebase ??= admin.initializeApp({
    ...firebaseConfig,
    credential: admin.credential.cert('.firebase-service-account.json'),
});
