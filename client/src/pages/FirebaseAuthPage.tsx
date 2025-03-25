import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth } from '@/firebase/index';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const FirebaseAuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Escuchar cambios en la autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log('Auth state changed:', user);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Manejar registro
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(`Cuenta creada con éxito para ${result.user.email}`);
      setEmail('');
      setPassword('');
      console.log('Usuario creado:', result.user);
    } catch (error: any) {
      setError(error.message || 'Error al crear la cuenta');
      console.error('Error al registrar:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar inicio de sesión
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setSuccess(`Sesión iniciada como ${result.user.email}`);
      setEmail('');
      setPassword('');
      console.log('Usuario autenticado:', result.user);
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
      console.error('Error al iniciar sesión:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar inicio de sesión con Google
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setSuccess(`Sesión iniciada como ${result.user.email}`);
      console.log('Usuario Google autenticado:', result.user);
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión con Google');
      console.error('Error al iniciar sesión con Google:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar cierre de sesión
  const handleSignOut = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await signOut(auth);
      setSuccess('Sesión cerrada correctamente');
      console.log('Sesión cerrada');
    } catch (error: any) {
      setError(error.message || 'Error al cerrar sesión');
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">4Gents</span>
          </Link>
          <nav className="ml-auto flex gap-4">
            <Link href="/chat-adapter-demo">
              <Button variant="outline">Chat Adapter Demo</Button>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 container py-10">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Firebase Authentication</h1>
            <p className="text-muted-foreground mt-2">
              Prueba la autenticación con Firebase para persistencia de conversaciones
            </p>
          </div>
          
          {/* Mostrar usuario actual */}
          {currentUser ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Usuario actual</CardTitle>
                <CardDescription>
                  Has iniciado sesión con la siguiente cuenta:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    {currentUser.photoURL && (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <div className="font-medium">{currentUser.displayName || 'Usuario'}</div>
                      <div className="text-sm text-muted-foreground">{currentUser.email}</div>
                    </div>
                  </div>
                  <div className="text-sm mt-3">
                    <div><strong>ID:</strong> {currentUser.uid}</div>
                    <div><strong>Email verificado:</strong> {currentUser.emailVerified ? 'Sí' : 'No'}</div>
                    <div><strong>Proveedor:</strong> {currentUser.providerData[0]?.providerId}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSignOut} className="w-full" disabled={loading}>
                  {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
                  <TabsTrigger value="signup">Registrarse</TabsTrigger>
                </TabsList>
                
                {/* Formulario de inicio de sesión */}
                <TabsContent value="signin">
                  <Card>
                    <CardHeader>
                      <CardTitle>Iniciar sesión</CardTitle>
                      <CardDescription>
                        Accede a tu cuenta para usar las funciones de persistencia
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSignIn}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Puedes usar credenciales de prueba:
                          <ul className="list-disc list-inside mt-1">
                            <li>Email: demo@example.com</li>
                            <li>Contraseña: password123</li>
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                        >
                          {loading ? 'Procesando...' : 'Continuar con Google'}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
                
                {/* Formulario de registro */}
                <TabsContent value="signup">
                  <Card>
                    <CardHeader>
                      <CardTitle>Crear cuenta</CardTitle>
                      <CardDescription>
                        Crea una nueva cuenta para usar todas las funciones
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSignUp}>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input
                            id="name"
                            placeholder="Tu nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Contraseña</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            La contraseña debe tener al menos 6 caracteres.
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
          
          {/* Mensajes de error y éxito */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mt-4 bg-green-50 text-green-800 border-green-500">
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>¿Qué sigue?</CardTitle>
              <CardDescription>
                Prueba estas características después de iniciar sesión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <div className="bg-primary/10 text-primary rounded-full p-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>Chats persistentes con agentes IA</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-primary/10 text-primary rounded-full p-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>Historial de conversaciones por tipo de agente</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-primary/10 text-primary rounded-full p-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span>Sincronización entre dispositivos</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/chat-adapter-demo" className="w-full">
                <Button variant="outline" className="w-full">
                  Ir a la demostración de chat
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="border-t py-6 bg-background">
        <div className="container flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 4Gents. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FirebaseAuthPage;