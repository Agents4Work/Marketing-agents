"use client"
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  current: boolean;
  accent?: string;
}

interface SubscriptionPlansCardsProps {
  plans: Plan[];
  onUpgrade?: (planId: string) => void;
}

// Plan Card Component
const PlanCard = ({
  plan,
  onUpgrade
}: {
  plan: Plan;
  onUpgrade?: (planId: string) => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);
  
  const accent = plan.accent || (
    plan.id === 'free' ? 'bg-blue-500' :
    plan.id === 'pro' ? 'bg-purple-600' :
    'bg-cyan-600'
  );

  const rawPrice = plan.price.replace(/[^0-9]/g, '');
  const price = rawPrice === '' ? '0' : rawPrice;
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade(plan.id);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
      className={`relative w-full bg-white rounded-xl p-6 
        border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]
        hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,0.8)]
        transition-all duration-200 overflow-visible
        ${plan.current ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
    >
      {/* Plan Name and Price */}
      <div className="mb-5">
        <h3 className="text-xl font-black text-black">{plan.name}</h3>
        <div className="mt-2 flex items-baseline">
          <motion.div 
            className={cn(
              "text-3xl font-black text-black flex items-center",
              plan.id === 'free' ? 'text-blue-600' : 
              plan.id === 'pro' ? 'text-purple-600' : 
              'text-cyan-600'
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {plan.price}
          </motion.div>
        </div>
      </div>

      {/* Price Badge for non-free plans */}
      {plan.id !== 'free' && (
        <motion.div
          className={cn(
            `absolute -top-4 -right-4 w-16 h-16 
            rounded-full flex items-center justify-center border-2 border-black
            shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`, accent)}
          animate={{
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.05, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: [0.76, 0, 0.24, 1]
          }}
        >
          <div className="text-center text-white">
            <div className="text-sm font-black">${price}</div>
            <div className="text-[8px] font-bold">/month</div>
          </div>
        </motion.div>
      )}

      {/* Current Plan Badge */}
      {plan.current && (
        <motion.div
          className="absolute -top-3 -left-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Badge variant="outline" className="border-2 border-black bg-green-500 text-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
            Current Plan
          </Badge>
        </motion.div>
      )}

      {/* Features List */}
      <div className="space-y-2 mb-5">
        {plan.features.map((feature, i) => (
          <motion.div
            key={feature}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{
              x: 5,
              transition: { type: "spring", stiffness: 400 }
            }}
            className="flex items-center gap-2"
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 360 }}
              className={cn(
                `w-5 h-5 rounded-full flex items-center justify-center
                text-white text-xs border border-black
                shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]`, 
                plan.id === 'free' ? 'bg-blue-500' : 
                plan.id === 'pro' ? 'bg-purple-600' : 
                'bg-cyan-600'
              )}
            >
              <Check size={12} />
            </motion.div>
            <span className="text-black text-sm">{feature}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      {!plan.current ? (
        <motion.button
          onClick={handleUpgrade}
          className={cn(
            `w-full py-2 rounded-lg text-white font-bold text-sm
            border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]
            hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)]
            active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]
            transition-all duration-200`,
            plan.id === 'free' ? 'bg-blue-500' : 
            plan.id === 'pro' ? 'bg-purple-600' : 
            'bg-cyan-600'
          )}
          whileHover={{
            scale: 1.03,
            transition: { duration: 0.2 }
          }}
          whileTap={{
            scale: 0.97,
          }}
        >
          Upgrade
        </motion.button>
      ) : (
        <motion.div
          className="w-full py-2 rounded-lg text-black font-bold text-sm text-center
            border-2 border-black bg-white/80 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]"
        >
          Current Plan
        </motion.div>
      )}
    </motion.div>
  );
};

// Background Grid
const BackgroundGrid = () => (
  <div className="absolute inset-0 opacity-10" style={{
    backgroundImage: "linear-gradient(#00000015 1px, transparent 1px), linear-gradient(90deg, #00000015 1px, transparent 1px)",
    backgroundSize: "20px 20px"
  }} />
);

// Main Component
export default function SubscriptionPlansCards({ plans, onUpgrade }: SubscriptionPlansCardsProps) {
  return (
    <div className="relative w-full bg-gray-50 rounded-lg p-6 overflow-hidden">
      <BackgroundGrid />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="flex-1">
              <PlanCard plan={plan} onUpgrade={onUpgrade} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}