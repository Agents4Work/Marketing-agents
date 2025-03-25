# Agent Profile Standards Documentation

## Overview
This document outlines the required standards for adding new AI agents to the marketing platform. All agents must follow the premium visual style and data structure guidelines to maintain consistency across the platform.

## Visual Design Standards

### Agent Card Design
- Must use the premium 3D card design with 8px black shadows (`shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]`)
- Must include a gradient stripe at the top using the agent's `secondaryColor` gradient
- Must maintain the 3px black border around cards (`border-3 border-black`) 
- Must include a hover effect that slightly elevates the card (`whileHover={{ y: -8, scale: 1.02 }}`)
- Must increase shadow size on hover (`hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)]`)

### Agent Avatar
- Must be displayed in a colored square with the agent's `primaryColor` (use `rounded-xl` not rounded-full)
- Must include a relevant emoji or icon representing the agent's specialty
- Must include a shadow effect on the avatar container (`shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]`)
- Must maintain a 2px black border around the avatar (`border-2 border-black`)
- Must use text-2xl size for emoji/icon to ensure visibility

### Typography & Information Display
- Agent name must be displayed in large, bold text (`text-xl font-bold` for standard cards)
- Agent level badge must be displayed as a border-2 black outline badge (`variant="outline" className="font-semibold border-2 border-black px-2"`)
- Agent description must be clear and concise with maximum 2 lines (`line-clamp-2`)
- Rating and reviews must be shown with yellow star icons (`<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />`)
- Team compatibility must be displayed with a green-to-emerald gradient progress bar
- Skills must be displayed with badge components (`<Badge variant="secondary">`)
- All text must follow proper hierarchy and readability standards

### Action Buttons
- All buttons must maintain the 3D style with 2px black borders (`border-2 border-black`)
- All buttons must include proper shadow effects (`shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)]`)
- Primary action (Add to Team) must use a gradient background with the agent's colors (`bg-gradient-to-r ${agent.secondaryColor}`)
- Secondary actions (Try Demo, Quick Integration) must use white background with black border (`variant="outline"`)
- All buttons must include relevant icons and clear labeling
- Buttons should be sized appropriately for their context (`size="sm"` for card footers)
- Buttons should have consistent spacing between icons and text

## Data Structure Requirements

### Required Agent Properties
All agents must implement the `ExtendedAgent` interface with the following properties:

```typescript
interface ExtendedAgent extends Omit<Agent, 'skills'> {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  category: string;              // Category identifier
  description: string;           // Detailed description
  avatar: string;                // Emoji or icon
  rating: number;                // Rating (0-5)
  reviews: number;               // Number of reviews
  level: string;                 // Expertise level
  compatibility: number;         // Team compatibility percentage
  skills: Array<{               // Array of skills with proficiency
    name: string;
    level: number;              // 0-100 scale
  }>;
  primaryColor: string;          // Main background color
  secondaryColor: string;        // Gradient color
  benefits: string[];            // Array of benefit statements
  testimonials: Array<{         // User feedback
    name: string;
    company: string;
    avatar: string;
    text: string;
    rating: number;
  }>;
  sampleOutputs: Array<{        // Example work
    title: string;
    content: string;
    type: string;
  }>;
  compatibleAgents: Array<{     // Related agents
    id: string;
    name: string;
    avatar: string;
    compatibility: number;
    color: string;
  }>;
  useCases: Array<{             // Applications
    title: string;
    description: string;
    icon: React.ReactNode;
  }>;
  performance: {                // Metrics
    conversionRate: number;
    engagementScore: number;
    outputQuality: number;
    creativity: number;
    consistency: number;
  };
}
```

## Tab Organization Standards
Every agent must include the following tabs:
1. **Overview** - Skills, benefits, compatible agents, and use cases
2. **Sample Outputs** - Examples of work the agent can produce
3. **Team Integration** - How the agent works with others
4. **Reviews** - Testimonials and feedback
5. **Performance** - Metrics and analytics

## Skill Visualization
- Each skill must include a name and level (0-100)
- Skill dots must be color-coded based on proficiency:
  - 95-100: Green (`bg-green-500`)
  - 85-94: Emerald (`bg-emerald-500`)
  - 75-84: Teal (`bg-teal-500`)
  - 65-74: Blue (`bg-blue-500`)
  - Below 65: Gray (`bg-gray-400`)

## Example Implementation
For each new agent type (Email Writer, SEO Specialist, etc.), adapt the data structure while maintaining the visual style:

```typescript
// Email Writer Agent Example
const emailWriterAgent: ExtendedAgent = {
  id: 'email-campaign-pro',
  name: 'Email Campaign Pro',
  category: 'email-marketing',
  description: 'Specialized in crafting engaging email sequences that convert leads into customers and nurture long-term relationships with your audience.',
  avatar: '📧',
  rating: 4.8,
  reviews: 256,
  level: 'Expert',
  compatibility: 94,
  skills: [
    { name: 'Email Sequences', level: 97 },
    { name: 'Subject Lines', level: 95 },
    { name: 'Personalization', level: 93 },
    { name: 'A/B Testing', level: 91 },
    { name: 'Automation', level: 89 },
    { name: 'Analytics', level: 86 }
  ],
  primaryColor: 'bg-purple-600',
  secondaryColor: 'from-purple-500 to-indigo-600',
  // Additional properties following the ExtendedAgent interface...
};
```

## Implementation Process
1. Create the agent data structure following the ExtendedAgent interface
2. Assign appropriate colors based on the agent's category
3. Provide realistic skills and proficiency levels
4. Include at least 3 testimonials from real use cases
5. Create sample outputs that demonstrate the agent's capabilities
6. Identify at least 3 compatible agents for team integration
7. Define key performance metrics relevant to the agent's specialty

---

**Note**: This documentation is required reading for all developers adding new agents to the platform. Adherence to these standards ensures a cohesive, premium user experience across all agent profiles.

## Implementation Reference

### Prescribed Component Usage
For displaying agents in the UI, always use the following components:

1. **PremiumAgentCard**: The main component for displaying agents in the marketplace and throughout the application. Located at `client/src/components/PremiumAgentCard.tsx`.
    - Do NOT use any inline agent card implementations (like the one in AgentMarketplace.tsx)
    - PremiumAgentCard implements all the required visual standards and handles proper animation

2. **AgentCategoryCard**: For displaying agent categories. Located at `client/src/components/AgentCategoryCard.tsx`.

3. **AgentDetailPage**: For displaying detailed agent information. Located at `client/src/pages/AgentDetailPage.tsx`.

Any deviation from using these standardized components will result in inconsistent UI and should be avoided.

### Known Issues to Fix

The current implementation in `AgentMarketplace.tsx` contains a duplicated and simplified version of the agent card component defined inline (lines 193-310). This implementation should be refactored to use the official `PremiumAgentCard` component instead. This would involve:

1. Removing the inline `PremiumAgentCard` definition from AgentMarketplace.tsx
2. Importing the official component: `import PremiumAgentCard from '@/components/PremiumAgentCard';`
3. Updating the card usage in various sections of the marketplace to use the imported component with correct props

This refactoring will ensure consistent appearance of agent cards throughout the application.