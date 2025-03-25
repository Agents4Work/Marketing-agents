"use client";

import React, { useState } from "react";
import { ChevronLeft, Github, Twitter, Loader2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/ui/grid-pattern";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDirectText } from "@/lib/direct-text";

const SignIn: React.FC = () => {
  const [, params] = useLocation();
  const [activeTab, setActiveTab] = useState<string>(
    new URLSearchParams(window.location.search).get('tab') === 'register' ? 'register' : 'login'
  );

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-20 text-zinc-800 dark:text-zinc-200 selection:bg-zinc-300 dark:selection:bg-zinc-600">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, ease: "easeInOut" }}
        className="relative z-10 mx-auto w-full max-w-xl p-4"
      >
        <Logo />
        <Header activeTab={activeTab} />
        <SocialButtons />
        <Divider />
        
        <Tabs 
          defaultValue={activeTab} 
          className="w-full"
          onValueChange={(value) => {
            setActiveTab(value);
            // Update URL when tab changes
            const url = new URL(window.location.href);
            url.searchParams.set('tab', value);
            window.history.pushState({}, '', url);
          }}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
        
        <TermsAndConditions />
      </motion.div>
      <BackgroundDecoration />
    </div>
  );
};

const BackButton: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { t } = useDirectText();
  return (
    <div className="absolute top-6 left-6">
      <SocialButton 
        icon={<ChevronLeft size={16} />} 
        onClick={() => setLocation("/")}
      >
        Back
      </SocialButton>
    </div>
  );
};

const SocialButton: React.FC<{
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ icon, fullWidth, children, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative z-0 flex items-center justify-center gap-2 overflow-hidden rounded-md 
    border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 
    px-4 py-2 font-semibold text-zinc-800 dark:text-zinc-200 transition-all duration-500
    before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5]
    before:rounded-[100%] before:bg-zinc-800 dark:before:bg-zinc-200 before:transition-transform before:duration-1000 before:content-[""]
    ${!disabled ? 'hover:scale-105 hover:text-zinc-100 dark:hover:text-zinc-900 hover:before:translate-x-[0%] hover:before:translate-y-[0%] active:scale-95' : 'opacity-60 cursor-not-allowed'}
    ${fullWidth ? "col-span-2" : ""}`}
  >
    {icon}
    <span>{children}</span>
  </button>
);

const Logo: React.FC = () => (
  <div className="mb-6 flex justify-center">
    <img
      src="https://svgl.app/library/tailwindcss.svg"
      alt="Logo"
      className="h-8 w-8"
    />
    <span className="ml-2 text-xl font-bold">AI Marketing</span>
  </div>
);

type HeaderProps = {
  activeTab: string;
};

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold">
        {activeTab === 'login' ? "Login to your account" : "Create an account"}
      </h1>
      {activeTab === 'login' ? (
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Don't have an account?{" "}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              // Update URL to show register tab
              const url = new URL(window.location.href);
              url.searchParams.set('tab', 'register');
              window.history.pushState({}, '', url);
              // Trigger tab change via TabsTrigger - more reliable than click()
              const registerTab = document.querySelector('button[value="register"]') as HTMLButtonElement;
              if (registerTab) registerTab.click();
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Create one
          </a>
        </p>
      ) : (
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              // Update URL to show login tab
              const url = new URL(window.location.href);
              url.searchParams.set('tab', 'login');
              window.history.pushState({}, '', url);
              // Trigger tab change
              const loginTab = document.querySelector('button[value="login"]') as HTMLButtonElement;
              if (loginTab) loginTab.click();
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign in
          </a>
        </p>
      )}
    </div>
  );
};

const SocialButtons: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: "Sign in successful",
        description: "Welcome back!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Google login error:", error);
      
      // Handle the specific configuration error
      if (error.code === "auth/configuration-not-found") {
        toast({
          title: "Google Sign-In not available",
          description: "Google Sign-In hasn't been configured yet. Please use email/password login instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign in failed",
          description: error.message || "There was a problem signing in with Google",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <SocialButton icon={<Twitter size={20} />} disabled={loading}>Twitter</SocialButton>
        <SocialButton icon={<Github size={20} />} disabled={loading}>GitHub</SocialButton>
        <SocialButton 
          fullWidth 
          onClick={handleGoogleSignIn}
          disabled={loading}
          icon={loading ? <Loader2 className="animate-spin" size={20} /> : undefined}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </SocialButton>
      </div>
    </div>
  );
};

const Divider: React.FC = () => (
  <div className="my-6 flex items-center gap-3">
    <div className="h-[1px] w-full bg-zinc-300 dark:bg-zinc-700" />
    <span className="text-zinc-500 dark:text-zinc-400">OR</span>
    <div className="h-[1px] w-full bg-zinc-300 dark:bg-zinc-700" />
  </div>
);

const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Welcome back!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle the specific configuration error
      if (error.code === "auth/configuration-not-found") {
        toast({
          title: "Error",
          description: "Authentication is not configured properly. Please contact an administrator.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label
          htmlFor="email-input"
          className="mb-1.5 block text-zinc-500 dark:text-zinc-400"
        >
          Email
        </label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@provider.com"
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 
          bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
        />
      </div>
      <div className="mb-6">
        <div className="mb-1.5 flex items-end justify-between">
          <label
            htmlFor="password-input"
            className="block text-zinc-500 dark:text-zinc-400"
          >
            Password
          </label>
          <a href="#" className="text-sm text-blue-600 dark:text-blue-400">
            Forgot?
          </a>
        </div>
        <input
          id="password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 
          bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
};

const RegisterForm: React.FC = () => {
  const { register, loading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !displayName) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const user = await register(email, password, displayName);
      
      if (user) {
        toast({
          title: "Success",
          description: "Welcome to the AI Marketing Platform!",
        });
        setLocation("/dashboard");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle the specific configuration error
      if (error.code === "auth/configuration-not-found") {
        toast({
          title: "Error",
          description: "Authentication is not configured properly. Please contact an administrator.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Registration failed. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label
          htmlFor="display-name-input"
          className="mb-1.5 block text-zinc-500 dark:text-zinc-400"
        >
          Full Name
        </label>
        <input
          id="display-name-input"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="John Doe"
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 
          bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
        />
      </div>
      <div className="mb-3">
        <label
          htmlFor="register-email-input"
          className="mb-1.5 block text-zinc-500 dark:text-zinc-400"
        >
          Email
        </label>
        <input
          id="register-email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@provider.com"
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 
          bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
        />
      </div>
      <div className="mb-3">
        <label
          htmlFor="register-password-input"
          className="mb-1.5 block text-zinc-500 dark:text-zinc-400"
        >
          Password
        </label>
        <input
          id="register-password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 
          bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="confirm-password-input"
          className="mb-1.5 block text-zinc-500 dark:text-zinc-400"
        >
          Confirm Password
        </label>
        <input
          id="confirm-password-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 
          bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-800 dark:text-zinc-200
          placeholder-zinc-400 dark:placeholder-zinc-500 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-blue-700"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
};

const TermsAndConditions: React.FC = () => {
  return (
    <p className="mt-9 text-xs text-zinc-500 dark:text-zinc-400">
      By signing up, you agree to our{" "}
      <a href="#" className="text-blue-600 dark:text-blue-400">
        Terms of Service
      </a>{" "}
      and{" "}
      <a href="#" className="text-blue-600 dark:text-blue-400">
        Privacy Policy
      </a>
    </p>
  );
};

const BackgroundDecoration: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white">
      {/* Simple white background with no pattern */}
    </div>
  );
};

export default SignIn;