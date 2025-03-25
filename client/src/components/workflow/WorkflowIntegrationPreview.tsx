import React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ArrowRight,
  Zap,
  Target,
  FileText,
  LineChart,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types
interface Agent {
  id: string;
  name: string;
  avatar: string;
  color: string;
  description: string;
  skills: string[];
}

interface WorkflowMember {
  agent: Agent;
  role: string;
  position: number;
  outputs?: string[];
}

interface WorkflowPreviewProps {
  title: string;
  description: string;
  members: WorkflowMember[];
  workflowSteps?: string[];
  onSelectWorkflow?: () => void;
  showConnections?: boolean;
  highlightAgentId?: string;
  accentColor?: string;
  secondaryColor?: string;
}

const WorkflowIntegrationPreview: React.FC<WorkflowPreviewProps> = ({
  title,
  description,
  members,
  workflowSteps = [],
  onSelectWorkflow,
  showConnections = true,
  highlightAgentId,
  accentColor = 'from-blue-500 to-indigo-600',
  secondaryColor = 'bg-blue-600'
}) => {
  // Sort members by position
  const sortedMembers = [...members].sort((a, b) => a.position - b.position);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <Card className="border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${accentColor}`}></div>
      
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-500" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Workflow Visualization */}
          <div className="w-full p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-blue-100 mb-5">
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 lg:gap-8 py-4">
              {sortedMembers.map((member, index) => (
                <React.Fragment key={member.agent.id}>
                  {/* Agent Node */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div 
                            className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${
                              member.agent.id === highlightAgentId 
                                ? `${secondaryColor} border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]` 
                                : `bg-${member.agent.color}-100 border-2 border-${member.agent.color}-300`
                            } flex items-center justify-center mb-2`}
                          >
                            <div className={`text-2xl md:text-3xl ${member.agent.id === highlightAgentId ? 'text-white' : ''}`}>
                              {member.agent.avatar}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1 max-w-xs">
                            <p className="font-semibold">{member.agent.name}</p>
                            <p className="text-xs text-gray-500">{member.agent.description}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.agent.skills.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs font-normal">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <div className="text-center">
                      <div className="font-semibold text-sm">{member.agent.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                    
                    {member.outputs && (
                      <div className="mt-2 text-xs text-gray-600">
                        <ul className="list-disc list-inside">
                          {member.outputs.map((output, i) => (
                            <li key={i} className="text-xs">{output}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Connection Line */}
                  {showConnections && index < sortedMembers.length - 1 && (
                    <motion.div 
                      variants={itemVariants}
                      className="hidden sm:block w-10 h-0.5 bg-gray-300"
                    >
                      <ArrowRight className="w-4 h-4 text-gray-400 relative -top-1.5 left-3" />
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Workflow Steps */}
          {workflowSteps.length > 0 && (
            <motion.div variants={itemVariants} className="w-full mb-4">
              <div className="text-sm font-semibold mb-2">Workflow Execution</div>
              <ol className="space-y-2">
                {workflowSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`p-1 rounded-full bg-${secondaryColor.replace('bg-', '')} text-white mr-2 mt-0.5 flex-shrink-0`}>
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
          
          {/* Workflow Stats */}
          <motion.div variants={itemVariants} className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
              <div className="text-xs text-gray-500">Agents</div>
              <div className="font-bold">{members.length}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
              <div className="text-xs text-gray-500">Compatibility</div>
              <div className="font-bold text-green-600">High</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
              <div className="text-xs text-gray-500">Workflow Steps</div>
              <div className="font-bold">{workflowSteps.length || members.length}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
              <div className="text-xs text-gray-500">Est. Time Savings</div>
              <div className="font-bold text-blue-600">65%</div>
            </div>
          </motion.div>
          
          {/* Agent Avatars */}
          <motion.div variants={itemVariants} className="flex -space-x-3 mb-4">
            {sortedMembers.map((member) => (
              <div 
                key={member.agent.id}
                className={`w-10 h-10 rounded-full ${
                  member.agent.id === highlightAgentId 
                    ? secondaryColor
                    : `bg-${member.agent.color.split('-')[0]}-600`
                } text-white flex items-center justify-center border-2 border-white shadow-md`}
              >
                <span>{member.agent.avatar}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </CardContent>
      
      {onSelectWorkflow && (
        <CardFooter>
          <Button 
            className="w-full border-2 border-black bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transform hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all"
            onClick={onSelectWorkflow}
          >
            Build This Workflow
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default WorkflowIntegrationPreview;