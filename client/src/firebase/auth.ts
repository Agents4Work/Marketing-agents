import { useState, useEffect, createContext, useContext } from 'react';
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

// Interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para utilizar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
}

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efecto para suscribirse a cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user as User);
      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  // Función para registrar un usuario
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el perfil con el nombre si se proporciona
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential;
    } catch (error: any) {
      setError(error.message || 'Error al crear la cuenta');
      throw error;
    }
  };

  // Función para iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setError(null);
      return userCredential;
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    }
  };

  // Función para iniciar sesión con Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setError(null);
      return userCredential;
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión con Google');
      throw error;
    }
  };

  // Función para cerrar sesión
  const logOut = async () => {
    try {
      // Guardar timestamp para verificar logout reciente
      localStorage.setItem('userLogoutTimestamp', Date.now().toString());
      
      await signOut(auth);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Error al cerrar sesión');
      throw error;
    }
  };

  // Función para restablecer contraseña
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Error al enviar correo de restablecimiento');
      throw error;
    }
  };

  // Función para actualizar el perfil
  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No hay usuario autenticado');
      }
      
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL: photoURL || auth.currentUser.photoURL
      });
      
      // Actualizar el estado local
      setUser({ ...auth.currentUser } as User);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el perfil');
      throw error;
    }
  };

  // Valores del contexto
  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logOut,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Función auxiliar para obtener el usuario actual
export function getCurrentUser(): User | null {
  return auth.currentUser as User;
}