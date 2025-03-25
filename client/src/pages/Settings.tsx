import React, { useState, useRef, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import SidebarOptimized from "@/components/SidebarOptimized";
import SubscriptionPlansCards from "@/components/billing/SubscriptionPlansCards";
import CurrentPlanCard from "@/components/billing/CurrentPlanCard";
import { AIToolsSettings } from "@/components/workflow";
import { Check, CreditCard, FileText, LogOut, Settings as SettingsIcon, User } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// 3D Modern Card Component
interface Modern3DCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  accentColor?: string;
}

function Modern3DCard({ title, description, children, className, delay = 0, accentColor = 'bg-blue-500' }: Modern3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

  return (
    <motion.div 
      ref={cardRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border-3 border-black bg-gray-50 p-1 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]",
        "hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{
        rotateX,
        rotateY,
        perspective: 1000,
      }}
      onMouseMove={(e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        mouseX.set((e.clientX - centerX) / rect.width);
        mouseY.set((e.clientY - centerY) / rect.height);
      }}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(#00000015 1px, transparent 1px), linear-gradient(90deg, #00000015 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      }} />
      
      <div className="relative z-10 p-5">
        <div className="mb-5">
          <h3 className="text-xl font-black text-black">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        
        {children}
      </div>
    </motion.div>
  );
}

// 3D Modern Button Component
interface Modern3DButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  accentColor?: string;
}

function Modern3DButton({ children, onClick, type = "button", className, accentColor = "bg-blue-500" }: Modern3DButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={cn(
        `w-full py-2 rounded-lg text-white font-bold text-sm
        border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
        hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]
        active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]
        transition-all duration-200`,
        accentColor,
        className
      )}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.98,
      }}
    >
      {children}
    </motion.button>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  // Use useEffect to update state when user data changes (useful for when Firebase auth is fully implemented)
  const [profileImage, setProfileImage] = useState<string | null>(user?.photoURL || null);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });
  
  // Update user data when user object changes (for Firebase integration)
  React.useEffect(() => {
    if (user) {
      setProfileImage(user.photoURL);
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user]);
  
  const [appSettings, setAppSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    inAppNotifications: true,
    aiContentStyle: "professional",
    aiTone: "neutral",
    darkMode: false,
  });
  
  const [activeIntegrations, setActiveIntegrations] = useState<string[]>([]);
  
  // Determine the active tab based on URL query parameters
  const getActiveTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam === 'app-settings') return 'app-settings';
    if (tabParam === 'subscription') return 'subscription';
    return 'profile';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  // Update the URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    let newUrl = '/settings';
    if (value !== 'profile') {
      newUrl += `?tab=${value}`;
    }
    window.history.pushState({}, '', newUrl);
  };
  
  // Update active tab when URL changes
  React.useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location]);
  
  // Subscription plan data
  const subscriptionPlans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      features: ["5 AI content generations/month", "Basic templates", "Standard support"],
      current: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$29/month",
      features: ["Unlimited generations", "Custom templates", "Priority support", "Advanced AI tools"],
      current: false,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99/month",
      features: ["Team collaboration", "Custom AI training", "Dedicated account manager", "API access"],
      current: false,
    }
  ];
  
  const [currentPlan] = useState(subscriptionPlans.find(plan => plan.current) || subscriptionPlans[0]);
  
  // Handle profile updates
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulate API call - this will be replaced with Firebase calls later
      // When Firebase is integrated, this would update the user profile in Firebase Auth
      // and also sync with our backend database
      
      // Example of future Firebase implementation:
      // if (user) {
      //   await updateProfile(user, {
      //     displayName: formData.displayName,
      //     photoURL: profileImage,
      //   });
      //   
      //   // Also update in our backend
      //   await apiRequest(`/api/users/${user.uid}`, 'PUT', {
      //     displayName: formData.displayName,
      //     photoURL: profileImage,
      //   });
      // }
      
      // For now, just show success toast
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Simulate API call - this will be replaced with Firebase calls later
      // Example of future Firebase implementation:
      // if (user && user.email) {
      //   // First, reauthenticate the user
      //   const credential = EmailAuthProvider.credential(
      //     user.email,
      //     formData.currentPassword
      //   );
      //   await reauthenticateWithCredential(user, credential);
      //   
      //   // Then update the password
      //   await updatePassword(user, formData.newPassword);
      // }
      
      // Clear password fields after successful update
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your password. Please check your current password and try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle app settings update
  const handleAppSettingsUpdate = async () => {
    try {
      // In the future, this will save the settings to Firebase and our backend
      // Example:
      // if (user) {
      //   // Save to our database
      //   await apiRequest(`/api/users/${user.uid}/settings`, 'PUT', {
      //     appSettings: appSettings,
      //   });
      // }
      
      // Update app theme if needed
      // if (appSettings.darkMode !== currentDarkMode) {
      //   document.documentElement.classList.toggle('dark', appSettings.darkMode);
      //   // Save theme preference to localStorage
      //   localStorage.setItem('theme', appSettings.darkMode ? 'dark' : 'light');
      // }
      
      toast({
        title: "Settings Saved",
        description: "Your application settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving app settings:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle integration toggle
  const toggleIntegration = (integration: string) => {
    setActiveIntegrations(prev => 
      prev.includes(integration) 
        ? prev.filter(i => i !== integration)
        : [...prev, integration]
    );
    
    toast({
      title: activeIntegrations.includes(integration) ? "Integration Removed" : "Integration Connected",
      description: activeIntegrations.includes(integration) 
        ? `${integration} has been disconnected.`
        : `${integration} has been connected successfully.`,
    });
  };
  
  // Handle plan upgrade
  const handlePlanChange = (planId: string) => {
    toast({
      title: "Plan Change Requested",
      description: `You're about to change to the ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan. Please confirm on the next screen.`,
    });
  };
  
  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImage(result);
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarOptimized />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                User Profile
              </TabsTrigger>
              <TabsTrigger value="app-settings" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                App Settings
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription
              </TabsTrigger>
            </TabsList>
            
            {/* User Profile Tab */}
            <TabsContent value="profile" className="space-y-6 pt-4">
              <Modern3DCard 
                title="Profile Information" 
                description="Update your account information and how others see you on the platform"
                accentColor="bg-blue-500"
              >
                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 bg-white p-5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex flex-col items-center gap-2">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Avatar className="h-24 w-24 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                        <AvatarImage src={profileImage || undefined} alt={formData.displayName} />
                        <AvatarFallback>{formData.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="flex items-center gap-2 mt-2">
                      <label htmlFor="picture" className="cursor-pointer">
                        <motion.div 
                          className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white font-bold
                            border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]
                            hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                            active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]
                            transition-all duration-150"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Change
                        </motion.div>
                        <input
                          id="picture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate} className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-bold text-black">Display Name</Label>
                        <Input
                          id="name"
                          value={formData.displayName}
                          onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                          className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-bold text-black">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
                        />
                      </div>
                    </div>
                    
                    <Modern3DButton type="submit" accentColor="bg-blue-500">
                      Save Changes
                    </Modern3DButton>
                  </form>
                </div>
              </Modern3DCard>
              
              <Modern3DCard 
                title="Security Settings" 
                description="Update your password and manage two-factor authentication"
                accentColor="bg-purple-600"
                delay={0.1}
              >
                <form onSubmit={handlePasswordUpdate} className="space-y-4 bg-white p-5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="font-bold text-black">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="font-bold text-black">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="font-bold text-black">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
                      />
                    </div>
                  </div>
                  
                  <Modern3DButton type="submit" accentColor="bg-purple-600">
                    Update Password
                  </Modern3DButton>
                </form>
                
                <div className="pt-4 mt-4 border-t-2 border-black/10">
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                    <div className="flex flex-col space-y-1">
                      <h3 className="text-sm font-bold">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={formData.twoFactorEnabled}
                      onCheckedChange={(checked) => {
                        setFormData({...formData, twoFactorEnabled: checked});
                        toast({
                          title: checked ? "2FA Enabled" : "2FA Disabled",
                          description: checked
                            ? "Two-factor authentication has been enabled."
                            : "Two-factor authentication has been disabled.",
                        });
                      }}
                      className="data-[state=checked]:bg-green-500 border-2 border-black"
                    />
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t-2 border-black/10">
                  <div className="bg-white p-5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                    <h3 className="text-lg font-black text-red-600">Danger Zone</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Permanently delete your account and all associated data
                    </p>
                    <motion.button
                      className="bg-red-500 py-2 px-4 rounded-lg text-white font-bold text-sm
                        border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
                        hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]
                        active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]
                        transition-all duration-200"
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={() => {
                        toast({
                          title: "Are you sure?",
                          description: "This action cannot be undone. Please confirm via email.",
                          variant: "destructive",
                        });
                      }}
                    >
                      Delete Account
                    </motion.button>
                  </div>
                </div>
              </Modern3DCard>
            </TabsContent>
            
            {/* App Settings Tab */}
            <TabsContent value="app-settings" className="space-y-6 pt-4">
              {/* AI Tools Settings Section */}
              <AIToolsSettings />
              
              <Modern3DCard 
                title="Notification Preferences" 
                description="Manage how and when you receive notifications"
                accentColor="bg-indigo-500"
                delay={0.1}
              >
                <div className="space-y-4 bg-white p-5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <h3 className="font-bold text-black">Email Notifications</h3>
                      <p className="text-sm text-gray-600">
                        Receive update notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.emailNotifications}
                      onCheckedChange={(checked) => setAppSettings({...appSettings, emailNotifications: checked})}
                      className="data-[state=checked]:bg-indigo-500 border-2 border-black"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <h3 className="font-bold text-black">Push Notifications</h3>
                      <p className="text-sm text-gray-600">
                        Receive notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.pushNotifications}
                      onCheckedChange={(checked) => setAppSettings({...appSettings, pushNotifications: checked})}
                      className="data-[state=checked]:bg-indigo-500 border-2 border-black"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <h3 className="font-bold text-black">In-App Notifications</h3>
                      <p className="text-sm text-gray-600">
                        Receive notifications within the application
                      </p>
                    </div>
                    <Switch
                      checked={appSettings.inAppNotifications}
                      onCheckedChange={(checked) => setAppSettings({...appSettings, inAppNotifications: checked})}
                      className="data-[state=checked]:bg-indigo-500 border-2 border-black"
                    />
                  </div>
                </div>
              </Modern3DCard>
              
              <Modern3DCard 
                title="AI Preferences" 
                description="Customize how the AI generates content for you"
                accentColor="bg-teal-500"
                delay={0.2}
              >
                <div className="space-y-6 bg-white p-5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="space-y-3">
                    <Label className="text-lg font-bold text-black">Default Content Style</Label>
                    <RadioGroup 
                      value={appSettings.aiContentStyle}
                      onValueChange={(value) => setAppSettings({...appSettings, aiContentStyle: value})}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      {['professional', 'creative', 'casual'].map((style) => (
                        <motion.div
                          key={style}
                          className={`relative rounded-lg border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] 
                                    hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all cursor-pointer
                                    ${appSettings.aiContentStyle === style 
                                    ? 'bg-teal-50 border-teal-500' 
                                    : 'bg-white hover:bg-gray-50'}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAppSettings({...appSettings, aiContentStyle: style})}
                        >
                          <div className="flex items-center justify-between">
                            <Label htmlFor={style} className="font-bold text-black capitalize cursor-pointer">
                              {style}
                            </Label>
                            <RadioGroupItem value={style} id={style} className="border-2 border-black data-[state=checked]:bg-teal-500" />
                          </div>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-lg font-bold text-black">Preferred AI Tone</Label>
                    <RadioGroup 
                      value={appSettings.aiTone}
                      onValueChange={(value) => setAppSettings({...appSettings, aiTone: value})}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      {['neutral', 'friendly', 'authoritative'].map((tone) => (
                        <motion.div
                          key={tone}
                          className={`relative rounded-lg border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] 
                                    hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all cursor-pointer
                                    ${appSettings.aiTone === tone 
                                    ? 'bg-teal-50 border-teal-500' 
                                    : 'bg-white hover:bg-gray-50'}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setAppSettings({...appSettings, aiTone: tone})}
                        >
                          <div className="flex items-center justify-between">
                            <Label htmlFor={tone} className="font-bold text-black capitalize cursor-pointer">
                              {tone}
                            </Label>
                            <RadioGroupItem value={tone} id={tone} className="border-2 border-black data-[state=checked]:bg-teal-500" />
                          </div>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </Modern3DCard>
              
              <Modern3DCard 
                title="Integrations" 
                description="Connect third-party services to enhance your experience"
                accentColor="bg-orange-500"
                delay={0.3}
              >
                <div className="bg-white p-5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {["Google", "Facebook", "Twitter", "Zapier", "Slack", "Mailchimp"].map((integration) => (
                      <motion.div 
                        key={integration}
                        className={`flex flex-col items-center p-4 border-2 border-black rounded-lg 
                                  shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] 
                                  transition-all cursor-pointer
                                  ${activeIntegrations.includes(integration) 
                                    ? "bg-orange-50 border-orange-500" 
                                    : "bg-white hover:bg-gray-50"}`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleIntegration(integration)}
                      >
                        <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] ${
                          activeIntegrations.includes(integration) 
                            ? "bg-orange-500 text-white" 
                            : "bg-white text-gray-500"
                        }`}>
                          {activeIntegrations.includes(integration) ? (
                            <Check className="h-6 w-6" />
                          ) : (
                            <FileText className="h-6 w-6" />
                          )}
                        </div>
                        <h3 className="font-bold text-black">{integration}</h3>
                        <span className={`text-sm px-2 py-1 mt-1 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)] ${
                          activeIntegrations.includes(integration) 
                            ? "bg-green-500 text-white font-bold" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {activeIntegrations.includes(integration) ? "Connected" : "Not connected"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Modern3DCard>
              
              <Modern3DCard 
                title="Appearance" 
                description="Customize the look and feel of the application"
                accentColor="bg-violet-500"
                delay={0.4}
              >
                <div className="p-5 bg-white rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                  <motion.div 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <div>
                      <h3 className="font-bold text-black">Dark Mode</h3>
                      <p className="text-sm text-gray-600">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Switch
                        checked={appSettings.darkMode}
                        onCheckedChange={(checked) => {
                          setAppSettings({...appSettings, darkMode: checked});
                          document.documentElement.classList.toggle("dark", checked);
                        }}
                        className="data-[state=checked]:bg-violet-500 border-2 border-black"
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </Modern3DCard>
              
              <div className="flex justify-end pt-4">
                <Modern3DButton 
                  onClick={handleAppSettingsUpdate} 
                  accentColor="bg-blue-500"
                >
                  Save All Settings
                </Modern3DButton>
              </div>
            </TabsContent>
            
            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6 pt-4">
              {/* Modern 3D Current Plan Section */}
              <div className="relative w-full overflow-hidden rounded-xl border-3 border-black bg-gray-50 p-1 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: "linear-gradient(#00000015 1px, transparent 1px), linear-gradient(90deg, #00000015 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }} />
                
                <div className="relative z-10 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-black">Current Plan</h3>
                      <p className="text-sm text-gray-600">Your subscription details and usage</p>
                    </div>
                  </div>
                  
                  {/* Modern 3D Current Plan Card */}
                  <CurrentPlanCard 
                    plan={currentPlan}
                    onUpgrade={() => handlePlanChange("pro")}
                  />
                </div>
              </div>
              
              {/* Modern 3D Available Plans Section */}
              <div className="relative w-full overflow-hidden rounded-xl border-3 border-black bg-gray-50 p-1 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: "linear-gradient(#00000015 1px, transparent 1px), linear-gradient(90deg, #00000015 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }} />
                
                <div className="relative z-10 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-black">Available Plans</h3>
                      <p className="text-sm text-gray-600">Choose the plan that works best for you</p>
                    </div>
                    <Link href="/billing">
                      <div className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800">
                        View All Plans
                        <span className="text-lg">→</span>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Our new 3D pricing cards */}
                  <SubscriptionPlansCards 
                    plans={subscriptionPlans} 
                    onUpgrade={handlePlanChange} 
                  />
                </div>
              </div>
              
              {/* Modern 3D Billing Information Section */}
              <div className="relative w-full overflow-hidden rounded-xl border-3 border-black bg-gray-50 p-1 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: "linear-gradient(#00000015 1px, transparent 1px), linear-gradient(90deg, #00000015 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }} />
                
                <div className="relative z-10 p-5">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-black">Billing Information</h3>
                    <p className="text-sm text-gray-600">Manage your payment methods and billing details</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-black">Visa ending in 4242</p>
                          <p className="text-sm text-gray-600">Expires 12/25</p>
                        </div>
                      </div>
                      <Badge className="border-2 border-black bg-green-500 px-2 py-1 font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">Default</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href="/billing">
                        <Button className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:bg-gray-100 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                          Add Payment Method
                        </Button>
                      </Link>
                      <Link href="/billing">
                        <Button className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] hover:bg-gray-100 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]">
                          View Invoices
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}