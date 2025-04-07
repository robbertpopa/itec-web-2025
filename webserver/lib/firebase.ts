import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { env } from "next-runtime-env";

const app = () =>
  initializeApp({
    apiKey: env("NEXT_PUBLIC_API_KEY"),
    projectId: env("NEXT_PUBLIC_PROJECT_ID"),
    appId: env("NEXT_PUBLIC_APP_ID"),

    authDomain: env("NEXT_PUBLIC_AUTH_DOMAIN"),
    messagingSenderId: env("NEXT_PUBLIC_MESSAGING_SENDER_ID"),

    databaseURL: env("NEXT_PUBLIC_DATABASE_URL"),
    storageBucket: env("NEXT_PUBLIC_STORAGE_BUCKET"),

    measurementId: env("NEXT_PUBLIC_MEASUREMENT_ID"),
  });

export const auth = () => getAuth(app());
export const googleProvider = () => new GoogleAuthProvider();
export const db = () => getDatabase(app());
export const storage = () => getStorage(app());
