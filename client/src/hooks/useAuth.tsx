import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { auth, signInWithGoogle, logout as firebaseLogout, loginWithEmailAndPassword, registerWithEmailAndPassword } from '../lib/firebase';
import { apiRequest } from '../lib/queryClient';

// For development environment, we can use these values to auto-login
const DEV_MODE = import.meta.env.DEV;
// Check if we have proper Firebase API key
const hasProperAuth = !!import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key";
// Check if we should auto-login - only in dev mode without real Firebase auth and if not logged out
const hasLoggedOut = sessionStorage.getItem('user_logged_out') === 'true';
// Force development mode if explicitly requested via URL parameter
const urlParams = new URLSearchParams(window.location.search);
const forceDev = urlParams.get('dev_mode') === 'true';
console.log("Has user logged out:", hasLoggedOut);
const AUTO_LOGIN = (DEV_MODE && !hasProperAuth && !hasLoggedOut) || forceDev;

// Mock user for development
const mockUser = {
  uid: 'hHu8ZABjCPUBxhiWxSA6Z8A2pJ12', // ID que está buscando el sistema
  email: 'dev@example.com',
  displayName: 'Development User',
  getIdToken: () => Promise.resolve('mock-token-for-development'),
  photoURL: null,
} as User;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create auth context with default implementations
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async (_email: string, _password: string) => {},
  register: async (_email: string, _password: string, _displayName: string) => null,
  loginWithGoogle: async () => {},
  logout: async () => {}
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a development user in the backend
  const createDevUser = async () => {
    try {
      const headers = {
        'X-Dev-Bypass-Auth': 'true',
        'Authorization': 'Bearer mock-token-for-development',
        'Content-Type': 'application/json'
      };
      
      // Try to create the user in the backend
      const userData = {
        uid: 'hHu8ZABjCPUBxhiWxSA6Z8A2pJ12', // ID que está buscando el sistema
        email: 'dev@example.com',
        displayName: 'Development User',
        photoURL: null
      };
      await apiRequest('/api/users', 'POST', userData);
      console.log("Created or updated development user in backend");
    } catch (error) {
      console.error("Error creating development user:", error);
    }
  };

  // Sync Firebase auth state with our context
  useEffect(() => {
    // For development, use a mock user
    if (AUTO_LOGIN) {
      console.log("🔄 Development mode: Auto-login enabled");
      setUser(mockUser);
      
      // Create dev user in backend without waiting for response
      createDevUser();
      
      setLoading(false);
      return () => {}; // No cleanup needed for mock user
    }
    
    // Normal Firebase auth for production
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        
        // No need to await this
        syncUserWithBackend(firebaseUser)
          .catch(error => console.error("Error syncing user with backend:", error));
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  // Sync user with our backend
  const syncUserWithBackend = async (currentUser: User) => {
    try {
      // Get ID token for API authentication
      const idToken = await currentUser.getIdToken();
      
      try {
        // Check if user exists in our backend
        await apiRequest(`/api/users/${currentUser.uid}`, 'GET');
      } catch (error: any) {
        if (error.status === 404) {
          // User doesn't exist in our backend, create it
          console.log("User doesn't exist in backend, will try to create");
          
          const userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0],
            photoURL: currentUser.photoURL
          };
          
          try {
            await apiRequest('/api/users', 'POST', userData);
            console.log("Created new user in backend");
          } catch(err) {
            console.error("Failed to create user in backend", err);
          }
        }
      }
    } catch (error) {
      console.error("Error syncing user with backend:", error);
      throw error;
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Clear the logged out flag when logging in
      sessionStorage.removeItem('user_logged_out');
      
      await loginWithEmailAndPassword(email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || 'Failed to log in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register with email and password
  const register = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Clear the logged out flag when registering
      sessionStorage.removeItem('user_logged_out');
      
      const user = await registerWithEmailAndPassword(email, password);
      
      // If we have a user, update profile to add display name
      if (user) {
        // Update user profile with display name in Firebase
        try {
          await updateProfile(user, {
            displayName: displayName
          });
          console.log("User profile updated with display name");
        } catch (profileError) {
          console.error("Error updating user profile:", profileError);
          // Don't throw here, user is created but profile update failed
        }
      }
      
      return user;
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || 'Failed to register');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Clear the logged out flag when logging in with Google
      sessionStorage.removeItem('user_logged_out');
      
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message || 'Failed to log in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Set flag to prevent auto re-login on development
      sessionStorage.setItem('user_logged_out', 'true');
      console.log("Setting logged out flag in session storage");
      
      // Clear the user immediately to immediately update UI
      setUser(null);
      
      // Then perform Firebase logout
      await firebaseLogout();
      
      console.log("Firebase logout completed");
      
      // Force a page reload to ensure all auth state is cleared
      setTimeout(() => {
        console.log("Redirecting to home page");
        window.location.href = "/";
      }, 100);
      
    } catch (error: any) {
      console.error("Logout error:", error);
      setError(error.message || 'Failed to log out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseLogout();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle: handleGoogleLogin,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
