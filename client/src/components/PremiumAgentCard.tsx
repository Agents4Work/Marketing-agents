import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Star,
  Zap,
  Users,
  Check,
  PlusCircle,
  ChevronRight,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Agent, normalizeSkillToString } from '@/types/marketplace';
import { formatAgentVersion } from '@/lib/agent-version-control';

// Types
export interface AgentCardProps {
  agent: Agent;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
  onQuickAdd?: (agentId: string) => void;
  animationDelay?: number;
}

const PremiumAgentCard: React.FC<AgentCardProps> = ({
  agent,
  showStats = true,
  size = 'md',
  showActions = true,
  onQuickAdd,
  animationDelay = 0
}) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Size-dependent styles
  const sizeStyles = {
    sm: {
      card: 'h-[250px]',
      avatar: 'p-2 text-xl',
      title: 'text-base',
      description: 'line-clamp-2 text-xs',
      footer: 'pt-2'
    },
    md: {
      card: 'h-full',
      avatar: 'p-3 text-2xl',
      title: 'text-xl',
      description: 'line-clamp-2',
      footer: 'pt-3'
    },
    lg: {
      card: 'h-full',
      avatar: 'p-4 text-3xl',
      title: 'text-2xl',
      description: 'line-clamp-3',
      footer: 'pt-4'
    }
  };

  // Handle view agent details
  const handleViewAgent = () => {
    setLocation(`/agent-marketplace/${agent.id}`);
  };

  // Handle quick add to team
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onQuickAdd) {
      onQuickAdd(agent.id);
    } else {
      // Add the agent to the team using localStorage for persistence
      const teamAgents = JSON.parse(localStorage.getItem('teamAgents') || '[]');
      if (!teamAgents.includes(agent.id)) {
        teamAgents.push(agent.id);
        localStorage.setItem('teamAgents', JSON.stringify(teamAgents));
      }
      
      toast({
        title: "Agent Added to Team",
        description: `${agent.name} has been added to your team.`,
        variant: "default",
      });
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className="cursor-pointer"
      onClick={handleViewAgent}
    >
      <Card className={`overflow-hidden border-3 border-black relative flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ${sizeStyles[size].card}`}>
        {/* Colored stripe at top */}
        <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${agent.secondaryColor}`}></div>
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              {/* Agent avatar with border and shadow */}
              <div className={`${sizeStyles[size].avatar} rounded-xl ${agent.primaryColor} text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] flex items-center justify-center`}>
                <span className="text-2xl">{agent.avatar}</span>
              </div>
              <div>
                <CardTitle className={sizeStyles[size].title}>{agent.name}</CardTitle>
                {showStats && agent.rating && (
                  <div className="flex items-center mt-1 space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold">{agent.rating}</span>
                    {agent.reviews && <span className="text-sm text-gray-500">({agent.reviews})</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-1">
              {agent.version && (
                <Badge variant="outline" className="font-semibold border-2 border-black px-2 text-xs flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {formatAgentVersion(agent.version)}
                </Badge>
              )}
              {agent.level && (
                <Badge variant="outline" className="font-semibold border-2 border-black px-2">
                  {agent.level}
                </Badge>
              )}
            </div>
          </div>
          
          <CardDescription className={`mt-3 ${sizeStyles[size].description}`}>
            {agent.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3 flex-grow">
          <div className="space-y-3">
            <div>
              <div className="text-sm font-semibold mb-1.5 flex items-center">
                <Zap className="h-4 w-4 mr-1 text-yellow-500" /> Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.skills.slice(0, size === 'sm' ? 2 : 3).map((skill, i) => (
                  <Badge key={i} variant="secondary" className="font-medium">
                    {normalizeSkillToString(skill)}
                  </Badge>
                ))}
                {agent.skills.length > (size === 'sm' ? 2 : 3) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="font-medium">
                          +{agent.skills.length - (size === 'sm' ? 2 : 3)} more
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          {agent.skills.slice(size === 'sm' ? 2 : 3).map((skill, i) => (
                            <div key={i} className="text-sm">{normalizeSkillToString(skill)}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            
            {showStats && agent.compatibility && (
              <div>
                <div className="text-sm font-semibold mb-1.5 flex items-center">
                  <Users className="h-4 w-4 mr-1 text-blue-500" /> Team Compatibility
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full" 
                    style={{ width: `${agent.compatibility}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        {showActions && (
          <CardFooter className={`flex justify-between ${sizeStyles[size].footer}`}>
            {/* 3D-styled View Details button */}
            <Button 
              variant="outline"
              className="w-full text-sm border-2 border-black flex items-center justify-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200"
              onClick={handleViewAgent}
            >
              View Details <ChevronRight className="h-4 w-4" />
            </Button>
            {/* 3D-styled Quick Add button */}
            <Button 
              className="w-full ml-2 text-sm border-2 border-black bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center gap-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200 text-white"
              onClick={handleQuickAdd}
            >
              Quick Add <PlusCircle className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default PremiumAgentCard;