import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Types
export interface AgentCategoryProps {
  category: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    textColor: string;
    agents: number;
    popular?: boolean;
  };
  onClick: (categoryId: string) => void;
  animationDelay?: number;
  size?: 'sm' | 'md' | 'lg';
}

const AgentCategoryCard: React.FC<AgentCategoryProps> = ({
  category,
  onClick,
  animationDelay = 0,
  size = 'md'
}) => {
  // Size-dependent styles
  const sizeStyles = {
    sm: {
      card: 'h-[220px]',
      iconContainer: 'p-2',
      icon: 'w-5 h-5',
      title: 'text-base',
      description: 'text-xs line-clamp-2',
      badge: 'text-xs',
      button: 'text-xs'
    },
    md: {
      card: 'h-full',
      iconContainer: 'p-3',
      icon: 'w-6 h-6',
      title: 'text-lg',
      description: 'line-clamp-2',
      badge: 'text-sm',
      button: 'text-sm'
    },
    lg: {
      card: 'h-full',
      iconContainer: 'p-4',
      icon: 'w-7 h-7',
      title: 'text-xl',
      description: 'line-clamp-3',
      badge: 'text-sm',
      button: 'text-base'
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className="cursor-pointer"
      onClick={() => onClick(category.id)}
    >
      <Card className={`overflow-hidden border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200 ${sizeStyles[size].card}`}>
        <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className={`${sizeStyles[size].iconContainer} rounded-full ${category.textColor} bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`}>
              {React.cloneElement(category.icon as React.ReactElement, { className: sizeStyles[size].icon })}
            </div>
            
            <Badge variant="outline" className={`font-medium border-2 border-black ml-2 ${sizeStyles[size].badge}`}>
              {category.agents} Agents
            </Badge>
          </div>
          <CardTitle className={`mt-2 ${sizeStyles[size].title}`}>{category.name}</CardTitle>
          <CardDescription className={sizeStyles[size].description}>{category.description}</CardDescription>
        </CardHeader>
        
        <CardFooter className="pt-0 pb-4 mt-auto">
          <Button 
            variant="outline" 
            className={`w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] ${sizeStyles[size].button}`}
          >
            Browse Agents <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AgentCategoryCard;