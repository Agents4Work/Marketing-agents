import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

// Check if we're in development mode or missing Firebase credentials
const isDev = import.meta.env.DEV;
const hasFirebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key";

// For development mode, use a mock configuration if not using real credentials
const DEV_CONFIG = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000000000"
};

// Firebase configuration - now using Replit secrets properly with VITE_ prefix
const firebaseConfig = isDev && !hasFirebaseApiKey ? DEV_CONFIG : {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agents-4-work.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agents-4-work",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agents-4-work.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "926000253324",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:926000253324:web:e47c3afd5a5bc86f2f97e8"
};

console.log("Initializing Firebase with config:", isDev ? "Development Mode" : "Production Mode");

// Initialize Firebase services
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

// Auth functions
export const registerWithEmailAndPassword = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Additional user setup can be done here
    return userCredential.user;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const handleRedirectResult = async () => {
  try {
    // This function would handle auth redirect results if using signInWithRedirect
    return null;
  } catch (error) {
    console.error("Error handling redirect:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

// Export initialized services
export { app, auth, db, storage };