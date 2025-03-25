import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, CreditCard } from 'lucide-react';
import PricingPlans from '@/components/billing/PricingPlans';
import SubscriptionManager from '@/components/billing/SubscriptionManager';

// Modern 3D card component from Settings.tsx for consistent styling
interface Modern3DCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  accentColor?: string;
}

function Modern3DCard({ title, description, children, className, delay = 0, accentColor = 'bg-blue-500' }: Modern3DCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: delay * 0.1
      }}
      className={`rounded-xl overflow-hidden ${className}`}
    >
      <div className="relative group">
        {/* 3D Card Effect with Border */}
        <div className="absolute inset-0 rounded-xl border-2 border-black/5 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-800/30 dark:to-neutral-900/30 transform group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
        
        {/* Accent Bar */}
        <div className={`absolute top-0 left-12 right-12 h-1 ${accentColor} rounded-b-full transform group-hover:scale-x-105 transition-transform`}></div>
        
        {/* Main Card */}
        <div className="relative rounded-xl bg-white dark:bg-neutral-900 shadow-lg p-6 border-2 border-black/5 transform group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">{title}</h3>
            {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function Billing() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('subscription');

  // For demo purposes, we'll use a mock customer ID
  const mockCustomerId = user ? `cus_mock_${user.uid}` : undefined;

  const handleManageBilling = () => {
    // In a real implementation, this would redirect to a Stripe Customer Portal
    // For now, just show an alert
    alert('In a production environment, this would open the Stripe Customer Portal');
  };

  return (
    <div className="container py-10 max-w-screen-xl mx-auto">
      <motion.div 
        className="flex flex-col gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription plan and payment methods
          </p>
        </motion.div>

        <Alert variant="default" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            This is a demonstration of the billing system. No actual charges will be processed.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="subscription">Current Subscription</TabsTrigger>
            <TabsTrigger value="plans">Available Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SubscriptionManager 
                customerId={mockCustomerId} 
                onManageBilling={handleManageBilling} 
              />
              
              <Modern3DCard 
                title="Payment Methods" 
                description="Manage your payment methods and billing information"
                accentColor="bg-blue-500"
                delay={1}
              >
                <div className="space-y-4">
                  <div className="rounded-lg border p-3 flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Visa ending in 4242</p>
                      <p className="text-xs text-muted-foreground">Expires 04/25</p>
                    </div>
                    <div>
                      <Button variant="ghost" className="text-xs">Edit</Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Add Payment Method
                  </Button>
                </div>
              </Modern3DCard>
            </div>
          </TabsContent>
          
          <TabsContent value="plans" className="mt-6">
            <div className="space-y-6">
              {/* Removed the duplicate heading here */}
              {user && mockCustomerId && 
                <PricingPlans userId={user.uid} customerId={mockCustomerId} />
              }
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}