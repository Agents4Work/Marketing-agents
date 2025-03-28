import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Check if we're in development mode
const isDev = import.meta.env.DEV;

// Debug: Log all environment variables (without values)
console.log('Available environment variables:', {
  ...Object.keys(import.meta.env).reduce((acc, key) => ({
    ...acc,
    [key]: typeof import.meta.env[key]
  }), {})
});

// Debug: Log Firebase-specific environment variables
console.log('Firebase Config Environment Variables:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 5) + '...',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  isDev: isDev
});

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API key is missing. Make sure to set VITE_FIREBASE_API_KEY in your environment variables.');
}

if (!firebaseConfig.authDomain) {
  throw new Error('Firebase Auth Domain is missing. Make sure to set VITE_FIREBASE_AUTH_DOMAIN in your environment variables.');
}

if (!firebaseConfig.projectId) {
  throw new Error('Firebase Project ID is missing. Make sure to set VITE_FIREBASE_PROJECT_ID in your environment variables.');
}

console.log("Initializing Firebase in", isDev ? "Development" : "Production", "mode");

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

try {
  // Debug: Log the actual config being used (without sensitive data)
  console.log('Initializing Firebase with config:', {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyLength: firebaseConfig.apiKey?.length
  });
  
  if (getApps().length) {
    app = getApp();
    console.log('Using existing Firebase app');
  } else {
    app = initializeApp(firebaseConfig);
    console.log('Created new Firebase app');
  }
  
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
  
  // Configure Google Provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
  googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  console.log('Google Auth Provider configured');
  
  // Initialize Analytics only in production and in browser environment
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    getAnalytics(app);
    console.log('Firebase Analytics initialized');
  }
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error("Error initializing Firebase:", error);
  if (error instanceof Error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
  throw new Error("Failed to initialize Firebase. Check your configuration.");
}

// Initialize Firebase services
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Export initialized services
export { app, auth, db, storage, googleProvider };

// Export auth functions
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  if (!auth) throw new Error('Auth is not initialized');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const registerWithEmailAndPassword = async (email: string, password: string) => {
  if (!auth) throw new Error('Auth is not initialized');
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) throw new Error('Auth or Google Provider is not initialized');
  try {
    console.log('Attempting Google sign in...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign in successful! Welcome:', result.user.displayName);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign in:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
};

export const logout = () => {
  if (!auth) throw new Error('Auth is not initialized');
  return signOut(auth);
};