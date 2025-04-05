import admin from 'firebase-admin';
import serviceAccount from '.firebase-service-account.json';
import { firebaseConfig } from './firebaseConfig';

export const firebase = admin.initializeApp({
    ...firebaseConfig,
    credential: admin.credential.cert(JSON.stringify(serviceAccount)),
});
