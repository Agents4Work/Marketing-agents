"use client"
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'wouter';

export interface CurrentPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  current: boolean;
}

interface CurrentPlanCardProps {
  plan: CurrentPlan;
  onUpgrade?: () => void;
}

export default function CurrentPlanCard({ plan, onUpgrade }: CurrentPlanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

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
      className="relative w-full bg-white rounded-xl p-6 border-3 border-black overflow-hidden
        shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]
        hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]
        transition-all duration-200"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(#00000015 1px, transparent 1px), linear-gradient(90deg, #00000015 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      }} />

      {/* Active Plan Badge */}
      <motion.div
        className="absolute -top-3 -left-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Badge className="bg-green-500 text-white border-2 border-black px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]">
          Active Plan
        </Badge>
      </motion.div>

      {/* Price Badge */}
      <motion.div
        className={cn(
          `absolute -top-4 -right-4 w-16 h-16 
          rounded-full flex items-center justify-center border-2 border-black
          shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]`,
          plan.id === 'free' ? 'bg-blue-500' : 
          plan.id === 'pro' ? 'bg-purple-600' : 
          'bg-cyan-600'
        )}
        animate={{
          rotate: [0, 10, 0, -10, 0],
          scale: [1, 1.1, 0.9, 1.1, 1],
          y: [0, -5, 5, -3, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: [0.76, 0, 0.24, 1]
        }}
      >
        <div className="text-center text-white">
          <div className="text-lg font-black">{plan.price.replace(/\/month/, '')}</div>
          <div className="text-[10px] font-bold">/mo</div>
        </div>
      </motion.div>

      <div className="relative z-10">
        {/* Plan Info */}
        <div className="mt-2 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-black">{plan.name} Plan</h3>
          </div>
        </div>

        {/* Features List */}
        <ul className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                x: 5,
                transition: { type: "spring", stiffness: 400 }
              }}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border-2 border-black
                shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]"
            >
              <motion.span
                whileHover={{ scale: 1.2, rotate: 360 }}
                className={cn(
                  `w-5 h-5 rounded-full flex items-center justify-center
                  text-white font-bold text-xs border border-black
                  shadow-[1px_1px_0px_0px_rgba(0,0,0,0.8)]`, 
                  plan.id === 'free' ? 'bg-blue-500' : 
                  plan.id === 'pro' ? 'bg-purple-600' : 
                  'bg-cyan-600'
                )}
              >
                <Check size={12} />
              </motion.span>
              <span className="text-black text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>

        {/* Usage Stats */}
        <div className="space-y-3 mb-6">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-bold">AI Content Generations</span>
              <span className="text-sm font-medium">12/20</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden border border-black">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className={cn(
                  "h-full rounded-full", 
                  plan.id === 'free' ? 'bg-blue-500' : 
                  plan.id === 'pro' ? 'bg-purple-600' : 
                  'bg-cyan-600'
                )}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-bold">Storage Used</span>
              <span className="text-sm font-medium">250MB/1GB</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden border border-black">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "25%" }}
                transition={{ duration: 1, delay: 0.7 }}
                className={cn(
                  "h-full rounded-full", 
                  plan.id === 'free' ? 'bg-blue-500' : 
                  plan.id === 'pro' ? 'bg-purple-600' : 
                  'bg-cyan-600'
                )}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {plan.id === "free" ? (
            <Button
              onClick={onUpgrade}
              className={cn(
                `py-2 rounded-lg text-white font-bold text-sm border-2 border-black
                shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]
                hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]
                active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]
                transition-all duration-200 w-full`,
                plan.id === 'free' ? 'bg-blue-500' : 
                plan.id === 'pro' ? 'bg-purple-600' : 
                'bg-cyan-600'
              )}
            >
              Upgrade to Pro
            </Button>
          ) : (
            <Link href="/billing">
              <Button
                className="w-full py-2 rounded-lg font-bold text-sm
                  border-2 border-black bg-white text-black
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]
                  hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]
                  active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]
                  transition-all duration-200"
              >
                Manage Subscription
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}