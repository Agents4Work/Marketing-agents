# Architecture Overview

## Overview

This repository contains an AI Marketing Automation Platform, a full-stack web application that allows users to create, manage, and automate marketing campaigns using AI agents. The platform is designed to replace traditional marketing teams with AI-powered agents that can perform various marketing tasks such as content creation, SEO optimization, ad management, and analytics.

## System Architecture

The application follows a modern full-stack architecture with the following components:

### Frontend

- **Technology**: React with TypeScript
- **UI Framework**: Custom components with Shadcn UI and Tailwind CSS
- **State Management**: React Query for data fetching and caching
- **Routing**: Wouter for client-side routing
- **Animation**: Framer Motion for UI animations

### Backend

- **Technology**: Node.js with Express.js and TypeScript
- **API Design**: RESTful API endpoints
- **Database Access**: Drizzle ORM for database operations
- **File Structure**: Server-side code in the `/server` directory with modular organization

### Database

- **Technology**: PostgreSQL (via Drizzle ORM)
- **Schema Management**: Drizzle ORM with schema definitions in `/shared/schema.ts`
- **Migration Strategy**: Drizzle Kit for handling schema migrations

### Shared Code

- **Location**: `/shared` directory
- **Purpose**: Contains code shared between frontend and backend, primarily schema definitions

## Key Components

### Frontend Components

1. **Pages**
   - Home page with marketing content
   - Dashboard for authenticated users
   - AI Team management interface
   - Content Hub for generating content
   - Various AI tool interfaces (Analyzer, Planner, Knowledge Base)
   - Workflow editor for campaign creation

2. **UI Components**
   - Marketing-focused components (Hero, Features, Testimonials)
   - Dashboard components (Sidebar, Header)
   - AI agent visualization and configuration
   - Content generation interfaces

3. **Canvas/Workflow Editor**
   - Node-based workflow editor using ReactFlow
   - Agent nodes representing different AI capabilities
   - Connection system for defining agent interactions

### Backend Components

1. **API Routes**
   - User management
   - Campaign management
   - AI agent configuration
   - OpenAI integration for content generation

2. **Storage Layer**
   - Database abstraction with interface for data operations
   - In-memory storage implementation for development/testing

3. **External Integrations**
   - OpenAI API for AI content generation and analysis

## Data Model

The application uses a relational data model with the following key entities:

1. **Users**
   - Basic user information (ID, email, display name)
   - Authentication details

2. **Campaigns**
   - Marketing campaigns owned by users
   - Campaign metadata and workflow configuration

3. **Agents**
   - AI agent definitions with types and configurations
   - Agent appearance and behavior settings

4. **Workflows**
   - Visual representation of AI agent connections
   - Node and edge definitions for workflow graphs

## Data Flow

1. **Authentication Flow**
   - Currently using a simplified mock authentication system
   - Designed to be replaced with proper authentication (likely Firebase Auth)

2. **Campaign Creation Flow**
   - User creates a campaign on the frontend
   - Frontend sends campaign data to backend API
   - Backend stores campaign in database
   - User can edit workflow by adding agents and connections
   - Workflow is saved and can be executed

3. **Content Generation Flow**
   - User provides prompts or requirements
   - Frontend sends request to backend API
   - Backend calls OpenAI API with enhanced prompts
   - Generated content is returned to frontend
   - User can edit and use the content

## External Dependencies

### Frontend Dependencies

- **React**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library based on Radix UI
- **Framer Motion**: Animation library
- **React Query**: Data fetching and caching
- **Wouter**: Lightweight routing
- **ReactFlow**: Workflow visualization

### Backend Dependencies

- **Express**: Web framework
- **Drizzle ORM**: Database ORM
- **OpenAI**: AI content generation
- **Zod**: Schema validation

## Deployment Strategy

The application is configured for deployment with the following characteristics:

1. **Development Environment**
   - Vite for frontend development server
   - Express server with hot module reloading
   - In-memory database for quick iteration

2. **Production Build**
   - Vite build for frontend assets
   - Express server for backend API and serving static files
   - PostgreSQL database connection via environment variables

3. **Configuration**
   - Environment variables for API keys and database connections
   - Theme configuration via JSON

4. **Hosting**
   - Set up for Cloud Run deployment (based on Replit configuration)
   - Port configuration for exposing the application

## Future Considerations

1. **Authentication Implementation**
   - The current authentication system is a placeholder
   - Firebase Authentication integration is partially implemented but not complete

2. **Database Migration**
   - Database schema is defined but may need migration scripts for production

3. **AI Agent Extensibility**
   - The system is designed to support adding new AI agent types
   - Additional OpenAI capabilities can be integrated

4. **Scalability**
   - The application may need additional caching layers for production scale
   - Database connection pooling would be required for high traffic