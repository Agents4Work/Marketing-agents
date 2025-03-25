import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './index';

// Tipo de usuario con info adicional
export interface User extends FirebaseUser {
  // Campos adicionales que queramos agregar
}

// Funciones de autenticación
export async function signUp(email: string, password: string, displayName?: string): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Actualizar el perfil con el nombre si se proporciona
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential;
  } catch (error: any) {
    console.error('Error al crear la cuenta:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
}

export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential;
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  try {
    // Guardar timestamp para verificar logout reciente
    localStorage.setItem('userLogoutTimestamp', Date.now().toString());
    
    await signOut(auth);
  } catch (error: any) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error al enviar correo de restablecimiento:', error);
    throw error;
  }
}

export async function updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error('No hay usuario autenticado');
    }
    
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL: photoURL || auth.currentUser.photoURL
    });
  } catch (error: any) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
}

// Función auxiliar para obtener el usuario actual
export function getCurrentUser(): User | null {
  return auth.currentUser as User;
}

// Función para escuchar cambios en el estado de autenticación
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    callback(user as User);
  });
}

// Verificar si hay un usuario autenticado
export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}