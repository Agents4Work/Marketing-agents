"use client"
import React, { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils';

export interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isPopular?: boolean;
  accent: string;
}

interface PricingProps {
    title?: string;
    plans: PricingPlan[];
    className?: string;
    onSubscribe?: (plan: PricingPlan, isYearly: boolean) => void;
}

// Counter Component
const Counter = ({ from, to }: { from: number; to: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        
        let start = from;
        const end = to;
        const duration = 1000; // 1 second
        const startTime = performance.now();
        
        const updateCounter = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const value = start + (end - start) * progress;
            
            node.textContent = Math.round(value).toString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
        
        return () => {
            node.textContent = to.toString();
        };
    }, [from, to]);
    
    return <span ref={nodeRef}>{from}</span>;
};

// Header Component
const PricingHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-8 sm:mb-12 relative z-10">
        <div className="inline-block pricing-header-animate">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 
                bg-gradient-to-r from-white to-gray-100 px-8 py-4 rounded-xl border-4 border-black
                shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9),_15px_15px_15px_-3px_rgba(0,0,0,0.1)]
                transform transition-transform hover:translate-x-1 hover:translate-y-1 mb-3 relative
                before:absolute before:inset-0 before:bg-white/50 before:rounded-xl before:blur-sm before:-z-10">
                {title}
            </h1>
            <div className="h-2 bg-gradient-to-r from-black via-gray-600 to-black rounded-full pricing-divider-animate" />
        </div>
    </div>
);

// Toggle Component
const PricingToggle = ({ isYearly, onToggle }: { isYearly: boolean; onToggle: () => void }) => (
    <div className="flex justify-center items-center gap-4 mb-8 relative z-10">
        <span className={`text-gray-600 font-medium ${!isYearly ? 'text-black' : ''}`}>Monthly</span>
        <button
            className="w-16 h-8 flex items-center bg-gray-200 rounded-full p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
            onClick={onToggle}
        >
            <div
                className={`w-6 h-6 bg-white rounded-full border-2 border-black pricing-toggle-knob ${isYearly ? 'yearly' : ''}`}
            />
        </button>
        <span className={`text-gray-600 font-medium ${isYearly ? 'text-black' : ''}`}>Yearly</span>
        {isYearly && (
            <span className="text-green-500 font-medium text-sm pricing-save-badge">
                Save 20%
            </span>
        )}
    </div>
);

// Background Effects Component
const BackgroundEffects = () => {
    // Generate an array of positions for the particles
    const particles = React.useMemo(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
            moveX: Math.random() * 20 - 10
        }));
    }, []);

    return (
        <>
            <div className="absolute inset-0">
                {particles.map((particle, i) => (
                    <div
                        key={i}
                        className="pricing-particle"
                        style={{
                            left: particle.left,
                            top: particle.top,
                            '--delay': particle.delay,
                            '--move-x': `${particle.moveX}px`,
                        } as React.CSSProperties}
                    />
                ))}
            </div>
            <div className="absolute inset-0" style={{
                backgroundImage: "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)",
                backgroundSize: "16px 16px"
            }} />
        </>
    );
};

// Pricing Card Component
const PricingCard = ({
    plan,
    isYearly,
    index,
    onSubscribe
}: {
    plan: PricingPlan;
    isYearly: boolean;
    index: number;
    onSubscribe?: (plan: PricingPlan, isYearly: boolean) => void;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        
        const mouseX = (e.clientX - centerX) / (rect.width / 2);
        const mouseY = (e.clientY - centerY) / (rect.height / 2);
        
        setTransform({
            rotateX: -mouseY * 7, // Inverse Y for natural tilt
            rotateY: mouseX * 7
        });
    };
    
    const handleMouseLeave = () => {
        setTransform({ rotateX: 0, rotateY: 0 });
    };
    
    const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const previousPrice = !isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    
    const handleSubscribe = () => {
        if (onSubscribe) {
            onSubscribe(plan, isYearly);
        }
    };

    return (
        <div
            ref={cardRef}
            style={{
                transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
                transition: 'transform 0.2s ease',
                "--index": index
            } as React.CSSProperties}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative w-full bg-white rounded-xl p-6 border-3 border-black
                shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]
                hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]
                transition-all duration-200 pricing-card-animate`}
        >
            {/* Price Badge */}
            <div
                className={cn(
                    `absolute -top-4 -right-4 w-16 h-16 
                    rounded-full flex items-center justify-center border-2 border-black
                    shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] pricing-price-badge`
                    , plan.accent)}
            >
                <div className="text-center text-white">
                    <div className="text-lg font-black">$
                        <Counter from={previousPrice} to={currentPrice} />
                    </div>
                    <div className="text-[10px] font-bold">/{isYearly ? 'yr' : 'mo'}</div>
                </div>
            </div>

            {/* Plan Name and Popular Badge */}
            <div className="mb-4">
                <h3 className="text-xl font-black text-black mb-2">{plan.name}</h3>
                {plan.isPopular && (
                    <span
                        className={cn(
                            `inline-block px-3 py-1 text-white
                            font-bold rounded-md text-xs border-2 border-black
                            shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] pricing-popular-badge`
                            , plan.accent)}
                    >
                        POPULAR
                    </span>
                )}
            </div>

            {/* Features List */}
            <div className="space-y-2 mb-4">
                {plan.features.map((feature, i) => (
                    <div
                        key={feature}
                        className={`flex items-center gap-2 p-2 bg-gray-50 rounded-md border-2 border-black
                            shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] pricing-feature-item`}
                        style={{ "--index": i } as React.CSSProperties}
                    >
                        <span
                            className={cn(
                                `w-5 h-5 rounded-md flex items-center justify-center
                                text-white font-bold text-xs border border-black
                                shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] pricing-feature-check`
                                , plan.accent)}
                        >
                            ✓
                        </span>
                        <span className="text-black font-bold text-sm">{feature}</span>
                    </div>
                ))}
            </div>

            {/* CTA Button */}
            <button
                onClick={handleSubscribe}
                className={cn(
                    `w-full py-2 rounded-lg text-white font-black text-sm
                    border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]
                    hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]
                    active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]
                    transition-all duration-200 pricing-cta-button`
                    , plan.accent)}
            >
                GET STARTED →
            </button>
        </div>
    );
};

// Main Container Component
export default function PricingContainer({ title, plans, className = "", onSubscribe }: PricingProps) {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className={`bg-white/20 dark:bg-black/10 p-4 sm:p-6 lg:p-8 relative overflow-hidden rounded-[12px] ${className}`}>
            {/* Only show the header if title is provided */}
            {title && <PricingHeader title={title} />}
            
            <PricingToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />
            <BackgroundEffects />

            <div className="w-[100%] max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {plans.map((plan, index) => (
                    <PricingCard
                        key={plan.name}
                        plan={plan}
                        isYearly={isYearly}
                        index={index}
                        onSubscribe={onSubscribe}
                    />
                ))}
            </div>
        </div>
    );
}