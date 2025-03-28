import { seoExpertAgent } from './seo-expert';
import { contentPlannerAgent } from './content-planner';
import { creativeDirectorAgent } from './creative-director';
import { Agent } from '@/types/marketplace';

// Export all agents
export {
  seoExpertAgent,
  contentPlannerAgent,
  creativeDirectorAgent
};

// Export a collection for easy iteration
export const agents: Agent[] = [
  seoExpertAgent,
  contentPlannerAgent,
  creativeDirectorAgent,
  {
    id: 'alex-copywriter',
    name: 'Alex Copywriter',
    category: 'copywriting',
    description: 'Award-winning AI copywriter specializing in persuasion and conversion optimization',
    avatar: '✍️',
    rating: 4.8,
    reviews: 156,
    level: 'Expert',
    compatibility: 95,
    skills: [
      'Persuasive Writing',
      'Brand Voice',
      'Marketing Strategy',
      'SEO Optimization',
      'A/B Testing'
    ],
    primaryColor: 'bg-emerald-600',
    secondaryColor: 'from-emerald-500 to-green-600',
    featured: true,
    trending: true,
    new: true,
    premium: true
  }
];

export default agents;