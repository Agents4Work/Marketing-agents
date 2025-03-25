import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { getSubscriptionStatus } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionManagerProps {
  customerId?: string;
  onManageBilling?: () => void;
}

export default function SubscriptionManager({ customerId, onManageBilling }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function loadSubscription() {
      if (!user) return;

      try {
        // Use provided customerId or create a mock one based on user ID
        const stripeCustomerId = customerId || `cus_mock_${user.uid}`;
        
        const subscriptionData = await getSubscriptionStatus(stripeCustomerId);
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Failed to load subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription information. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [user, customerId, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Active
          </Badge>
        );
      case 'past_due':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Past Due
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Canceled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="rounded-xl overflow-hidden"
      >
        <div className="relative group">
          {/* 3D Card Effect with Border */}
          <div className="absolute inset-0 rounded-xl border-2 border-black/5 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-800/30 dark:to-neutral-900/30 transform group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
          
          {/* Accent Bar */}
          <div className="absolute top-0 left-12 right-12 h-1 bg-purple-600 rounded-b-full transform group-hover:scale-x-105 transition-transform"></div>
          
          {/* Main Card */}
          <div className="relative rounded-xl bg-white dark:bg-neutral-900 shadow-lg p-6 border-2 border-black/5 transform group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform">
            <div className="animate-pulse">
              <div className="flex justify-between items-start">
                <div>
                  <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="flex gap-2 pt-2">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // No subscription
  if (!subscription) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="rounded-xl overflow-hidden"
      >
        <div className="relative group">
          {/* 3D Card Effect with Border */}
          <div className="absolute inset-0 rounded-xl border-2 border-black/5 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-800/30 dark:to-neutral-900/30 transform group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
          
          {/* Accent Bar */}
          <div className="absolute top-0 left-12 right-12 h-1 bg-orange-500 rounded-b-full transform group-hover:scale-x-105 transition-transform"></div>
          
          {/* Main Card */}
          <div className="relative rounded-xl bg-white dark:bg-neutral-900 shadow-lg p-6 border-2 border-black/5 transform group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">No Active Subscription</h3>
              <p className="text-muted-foreground text-sm mt-1">You don't have an active subscription plan.</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Subscribe to a plan to get access to premium features and AI-powered marketing tools.
              </p>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="pt-2"
              >
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  onClick={() => window.location.href = '/pricing'}
                >
                  View Plans
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="rounded-xl overflow-hidden"
    >
      <div className="relative group">
        {/* 3D Card Effect with Border */}
        <div className="absolute inset-0 rounded-xl border-2 border-black/5 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-800/30 dark:to-neutral-900/30 transform group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
        
        {/* Accent Bar */}
        <div className="absolute top-0 left-12 right-12 h-1 bg-purple-600 rounded-b-full transform group-hover:scale-x-105 transition-transform"></div>
        
        {/* Main Card */}
        <div className="relative rounded-xl bg-white dark:bg-neutral-900 shadow-lg p-6 border-2 border-black/5 transform group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform">
          <div className="flex flex-row items-center justify-between pb-2">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Subscription Details</h3>
              <p className="text-muted-foreground text-sm mt-1">Manage your subscription and billing settings</p>
            </div>
            <div>
              {getStatusBadge(subscription.status)}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Current Plan</div>
              <div className="font-semibold text-lg">{subscription.plan}</div>
            </div>
            
            <div className="grid gap-2">
              <div className="text-sm font-medium">Renewal Date</div>
              <div>{formatDate(subscription.current_period_end)}</div>
            </div>

            {subscription.status === 'active' && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-900/30 text-sm">
                Your subscription is active and will automatically renew on {formatDate(subscription.current_period_end)}.
              </div>
            )}

            {subscription.status === 'past_due' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-900/30 text-sm">
                Your payment failed to process. Please update your payment method to keep your subscription active.
              </div>
            )}

            {subscription.status === 'canceled' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-900/30 text-sm">
                Your subscription has been canceled and will end on {formatDate(subscription.current_period_end)}.
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onManageBilling}>
                Manage Billing
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}