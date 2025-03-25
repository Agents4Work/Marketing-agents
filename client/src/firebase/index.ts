import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Configuración básica de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC6vRnG0h2YrQc7ZvTzkQ6HsGQUW-UHKAM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "4gents-marketing.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "4gents-marketing",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "4gents-marketing.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "723551657922",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:723551657922:web:d5efd4256b4b6c0d71f7f5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Imprimir configuración sin exponer datos sensibles
console.log('Firebase config loaded:', 
  Object.keys(firebaseConfig).reduce((acc, key) => {
    acc[key] = key === 'apiKey' ? '***REDACTED***' : 
              (firebaseConfig as any)[key] ? 'set' : 'not set';
    return acc;
  }, {} as Record<string, string>)
);

let app: FirebaseApp;

try {
  // Verificar si Firebase ya está inicializado
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully:', 
      import.meta.env.PROD ? 'Production Mode' : 'Development Mode');
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Inicializar con valores por defecto en caso de error
  app = initializeApp(firebaseConfig);
}

// Inicializar servicios de Firebase
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Exportar funcionalidad principal
export { app };

// Verificar si un usuario ha cerrado sesión recientemente para evitar problemas con Firestore
export function hasUserLoggedOut(): boolean {
  try {
    const logoutTimestamp = localStorage.getItem('userLogoutTimestamp');
    if (!logoutTimestamp) return false;
    
    const timestamp = parseInt(logoutTimestamp, 10);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    const hasLoggedOut = timestamp > fiveMinutesAgo;
    console.log('Has user logged out:', hasLoggedOut);
    return hasLoggedOut;
  } catch (error) {
    console.error('Error checking if user logged out:', error);
    return false;
  }
}

// Función para validar la configuración de Firebase
export function isFirebaseConfigured(): boolean {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = [];
  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.warn(`Firebase configuration missing: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}