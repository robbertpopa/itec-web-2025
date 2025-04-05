import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { isSupported, getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,

  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,

  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export const storage = getStorage(app);

// export const analytics = await isSupported().then(
//   (supported) => supported ? getAnalytics(app) : null
// );