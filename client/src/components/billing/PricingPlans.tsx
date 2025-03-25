import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { createCheckoutSession } from '@/lib/stripe';
import PricingContainer, { PricingPlan } from './PricingContainer';
import { useToast } from '@/hooks/use-toast';

interface PricingPlansProps {
  userId: string;
  customerId: string;
}

export default function PricingPlans({ userId, customerId }: PricingPlansProps) {
  const { toast } = useToast();
  
  const { data: plansData, isLoading } = useQuery({
    queryKey: ['/api/billing/plans'],
    queryFn: async () => {
      const response = await fetch('/api/billing/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      return response.json();
    }
  });

  const handleSubscribe = useCallback(async (priceId: string) => {
    try {
      const session = await createCheckoutSession(customerId, priceId, userId);
      if (session && session.url) {
        window.location.href = session.url;
      } else {
        toast({
          title: "Error",
          description: "Could not create checkout session",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate checkout",
        variant: "destructive"
      });
      console.error('Checkout error:', error);
    }
  }, [customerId, userId, toast]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading plans...</div>;
  }

  if (!plansData?.plans) {
    return <div className="flex justify-center p-8">No plans available</div>;
  }

  // Transform the plans data to match our new PricingPlan interface
  const transformedPlans: PricingPlan[] = [
    {
      name: "Starter",
      monthlyPrice: 29,
      yearlyPrice: 279,
      features: [
        "1 AI Assistant",
        "Basic content generation",
        "5 workflows per month",
        "Email support"
      ],
      accent: "bg-blue-500",
    },
    {
      name: "Professional",
      monthlyPrice: 79,
      yearlyPrice: 759,
      features: [
        "3 AI Assistants",
        "Advanced content generation",
        "Unlimited workflows",
        "Priority support",
        "Analytics dashboard",
        "Custom templates"
      ],
      isPopular: true,
      accent: "bg-purple-600",
    },
    {
      name: "Enterprise",
      monthlyPrice: 199,
      yearlyPrice: 1919,
      features: [
        "Unlimited AI Assistants",
        "Enterprise-grade security",
        "Dedicated account manager",
        "Custom AI training",
        "API access",
        "White labeling",
        "SSO integration"
      ],
      accent: "bg-cyan-600",
    }
  ];

  // Handle subscription based on plan selection and yearly/monthly choice
  const handleSubscriptionChoice = (plan: PricingPlan, isYearly: boolean) => {
    // In a real implementation, we would map the plan name to a price ID
    // For now, we'll use mock price IDs based on the plan name
    const planId = plan.name.toLowerCase().replace(/\s+/g, '_');
    const interval = isYearly ? 'yearly' : 'monthly';
    const priceId = `price_mock_${planId}_${interval}`;
    
    handleSubscribe(priceId);
  };

  return (
    <div className="w-full">
      <motion.div 
        className="text-center max-w-3xl mx-auto mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: 0.2, 
            duration: 0.5,
            type: "spring",
            stiffness: 200
          }}
          className="relative inline-block mb-6"
        >
          <div className="absolute inset-0 bg-blue-500 rounded-lg transform translate-x-1 translate-y-1"></div>
          <div className="relative bg-white dark:bg-neutral-900 px-8 py-4 rounded-lg border-2 border-black/10 shadow-lg">
            <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          </div>
        </motion.div>
      </motion.div>
      
      <PricingContainer 
        // Removed the title prop to avoid duplication
        plans={transformedPlans} 
        className="max-w-7xl mx-auto"
        onSubscribe={handleSubscriptionChoice}
      />
    </div>
  );
}