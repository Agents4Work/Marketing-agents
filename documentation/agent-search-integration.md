# Agent Search Integration Documentation

## Overview

This document explains how to add new agents to the marketplace ensuring they are properly indexed by the search engine. The Agent Marketplace includes a powerful search feature that filters agents based on multiple properties, and new agents must be structured correctly to be discoverable.

## Agent Search Functionality

The search engine in Agent Marketplace performs multi-field filtering across:
- Agent name
- Description 
- Skills/capabilities
- Category
- Experience level

## How to Add a New Agent (Proper Search Integration)

When adding a new agent to the platform, follow these steps to ensure proper search functionality:

### 1. Create the Agent Data

Create your agent following the standard `Agent` or `ExtendedAgent` interface from `types/marketplace.ts`.

```typescript
// Example of a properly structured agent
const newAgent: ExtendedAgent = {
  id: "unique-agent-id",
  name: "New Agent Name",  // Will be searchable
  category: "content-creation", // Will be searchable
  description: "Detailed description of the agent's capabilities", // Will be searchable
  avatar: "🤖",
  rating: 4.7,
  reviews: 125,
  level: "Advanced", // Will be searchable
  compatibility: 92,
  // Skills must be an array of strings for basic agents
  skills: ["Skill 1", "Skill 2", "Skill 3"], // Will be searchable
  primaryColor: "bg-emerald-600",
  secondaryColor: "from-emerald-500 to-green-600",
  // Extended fields...
};
```

### 2. Add to Agent Data Source

Add your agent to the appropriate data source:

```typescript
// In client/src/data/agents/index.ts
export const agents = [
  existingAgent1,
  existingAgent2,
  // Add your new agent here
  newAgent,
];
```

### 3. For Extended Agents

If your agent uses the `ExtendedAgent` interface with skills as objects, convert them to strings for the marketplace view:

```typescript
// When using agent in AgentMarketplace.tsx
const marketplaceAgent: Agent = {
  id: extendedAgent.id,
  name: extendedAgent.name,
  category: extendedAgent.category,
  description: extendedAgent.description,
  avatar: extendedAgent.avatar,
  rating: extendedAgent.rating,
  reviews: extendedAgent.reviews,
  level: extendedAgent.level,
  compatibility: extendedAgent.compatibility,
  // Convert skill objects to strings
  skills: extendedAgent.skills.map(skill => skill.name),
  primaryColor: extendedAgent.primaryColor,
  secondaryColor: extendedAgent.secondaryColor,
};
```

### 4. Search Engine Considerations

Remember these key points for search functionality:

1. **String Matching**: The search engine performs case-insensitive substring matching
2. **Field Coverage**: All primary agent fields are searched
3. **Skills Format**: Ensure skills are provided in a format the search can process:
   - For `Agent` interface: Array of strings
   - For `ExtendedAgent` interface: Map skill objects to strings before using in search context
4. **Re-rendering**: The search filter uses useMemo for performance - the dependency array includes filters.search and trendingAgents

## Testing New Agent Searchability

After adding a new agent, test its searchability by:

1. Navigate to the Agent Marketplace
2. Try searching by:
   - The agent's name
   - Words in the agent's description
   - The agent's category
   - Each of the agent's skills
   - The agent's level

## Troubleshooting

If your new agent doesn't appear in search results:

1. Check the agent data structure to ensure it follows the `Agent` interface
2. Verify the agent is properly added to the agents data source
3. Check the console for any errors in the filter function
4. Ensure skills are correctly formatted for filtering
5. Verify the agent is included in the filtered data display logic in all tabs

## Technical Implementation Reference

Search filter implementation (in AgentMarketplace.tsx):

```jsx
const filteredAgents = useMemo(() => {
  return trendingAgents.filter(agent => {
    if (!filters.search.trim()) return true;
    
    const searchLower = filters.search.toLowerCase();
    
    return (
      agent.name.toLowerCase().includes(searchLower) || 
      agent.description.toLowerCase().includes(searchLower) || 
      agent.skills.some(skill => typeof skill === 'string' 
        ? skill.toLowerCase().includes(searchLower)
        : false) ||
      agent.category.toLowerCase().includes(searchLower) ||
      agent.level.toLowerCase().includes(searchLower)
    );
  });
}, [filters.search, trendingAgents]);
```