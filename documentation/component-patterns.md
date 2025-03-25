# AI Marketing Platform Component Patterns

This document outlines best practices, common patterns, and known issues for the AI Marketing Platform frontend components.

## Agent Marketplace

### Components

#### PremiumAgentCard

1. **Multiple Implementations** - There are two versions of the PremiumAgentCard:
   - Standalone component: `client/src/components/PremiumAgentCard.tsx`
   - Inline component in `client/src/pages/AgentMarketplace.tsx`

2. **Quick Add Functionality**:
   - `handleQuickAdd` should include:
     - `e.stopPropagation()` to prevent triggering parent click events
     - Logic to store selected agents (e.g. localStorage or state)
     - Toast notification for user feedback
   
   ```typescript
   const handleQuickAdd = (e: React.MouseEvent) => {
     e.stopPropagation();
     
     // Add the agent to the team
     const teamAgents = JSON.parse(localStorage.getItem('teamAgents') || '[]');
     if (!teamAgents.includes(agent.id)) {
       teamAgents.push(agent.id);
       localStorage.setItem('teamAgents', JSON.stringify(teamAgents));
     }
     
     // Show success toast
     toast({
       title: "Agent Added to Team",
       description: `${agent.name} has been added to your team.`,
       variant: "default",
     });
   };
   ```

## UI Components

### Modern3DHeader

- Always provide `description` prop support in implementations
- Include consistent styling across different pages

### DOM Selection Methods

- Use reliable DOM selection methods with fallbacks:
  ```typescript
  // Example of reliable DOM selection with safety
  setTimeout(() => {
    const searchInput = document.querySelector('input[placeholder*="Search agents"]') as HTMLInputElement;
    if (searchInput) searchInput.focus();
  }, 100);
  ```

## Common Issues

### Focus Handling

- For elements that need focus after state changes, use a timeout:
  ```typescript
  // Give React time to update the DOM before focusing
  setTimeout(() => {
    const element = document.querySelector(selector);
    if (element) (element as HTMLElement).focus();
  }, 100);
  ```

### Component Consistency

- Before implementing a standalone or inline component, check if it already exists
- Use the same patterns across similar components for consistency
- If a component exists in multiple places, consider consolidating to avoid duplication

### Event Propagation

- Always use `e.stopPropagation()` in nested click handlers to prevent unintended parent triggers
- Test click handlers in nested components thoroughly

## Best Practices

### Local Storage

- When using localStorage:
  1. Always parse with default value: `JSON.parse(localStorage.getItem('key') || '[]')`
  2. Check if values already exist before adding them
  3. Handle potential parsing errors with try/catch

### Toast Notifications

- Use consistent toast patterns for user feedback:
  ```typescript
  toast({
    title: "Action Complete",
    description: "Details about what happened",
    variant: "default", // or "success", "error", etc.
  });
  ```

### Component Props

- Use consistent prop naming across similar components
- Document required vs optional props with TypeScript interfaces
- Provide sensible defaults for optional props