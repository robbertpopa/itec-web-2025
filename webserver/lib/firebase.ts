import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
export const auth = () => getAuth(app);
export const googleProvider = () => new GoogleAuthProvider();
export const db = () => getDatabase(app);
export const storage = () => getStorage(app);
