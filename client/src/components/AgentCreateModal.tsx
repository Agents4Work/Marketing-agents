"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Agent, AgentType, defaultAgentConfigs } from "@/lib/agents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface AgentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated?: (agent: Agent) => void;
}

const agentTypes: { value: AgentType; label: string }[] = [
  { value: "seo", label: "SEO & Keyword Optimization" },
  { value: "copywriting", label: "Copywriting & Content Creation" },
  { value: "ads", label: "Advertising & Campaign Management" },
  { value: "creative", label: "Creative & Visual Content" },
  { value: "email", label: "Email Marketing & Automation" },
  { value: "analytics", label: "Analytics & Data Reporting" },
  { value: "social", label: "Social Media Management" },
];

const AgentCreateModal = ({ isOpen, onClose, onAgentCreated }: AgentCreateModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "copywriting" as AgentType,
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: AgentType) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all the required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use default configuration for the selected agent type
      const configuration = defaultAgentConfigs[formData.type];
      
      const newAgent = await apiRequest('/api/agents', 'POST', {
        ...formData,
        configuration,
        icon: "robot", // Default icon
        color: "#4f46e5", // Default color
      });
      
      // Invalidate agents cache to reload the list
      queryClient.invalidateQueries({ queryKey: ['/api/agents/dev/all'] });
      
      toast({
        title: "Agent created",
        description: `${formData.name} has been created successfully.`,
      });
      
      // Reset form
      setFormData({
        name: "",
        type: "copywriting",
        description: "",
      });
      
      // Notify parent component
      if (onAgentCreated && newAgent.agent) {
        onAgentCreated(newAgent.agent);
      }
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to create agent",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New AI Agent</DialogTitle>
          <DialogDescription>
            Design a custom AI agent to add to your marketing team.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Agent Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Social Media Specialist"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Agent Type
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleTypeChange(value as AgentType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an agent type" />
              </SelectTrigger>
              <SelectContent>
                {agentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this agent does..."
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentCreateModal;