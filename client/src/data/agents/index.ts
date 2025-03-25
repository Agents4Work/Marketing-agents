import { seoExpertAgent } from './seo-expert';
import { contentPlannerAgent } from './content-planner';
import { creativeDirectorAgent } from './creative-director';

// Export all agents
export {
  seoExpertAgent,
  contentPlannerAgent,
  creativeDirectorAgent
};

// Export a collection for easy iteration
export const agents = [
  seoExpertAgent,
  contentPlannerAgent,
  creativeDirectorAgent
];

export default agents;