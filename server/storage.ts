import { users, type User, type InsertUser, type Campaign, type InsertCampaign, type Workflow, type InsertWorkflow, type Agent, type InsertAgent, type ContentItem, type InsertContentItem } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByUserId(userId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflowsByCampaignId(campaignId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  
  // Content Hub methods
  getContentItem(id: number): Promise<ContentItem | undefined>;
  getContentItemsByUserId(userId: number): Promise<ContentItem[]>;
  getContentItemsByType(userId: number, contentType: string): Promise<ContentItem[]>;
  getContentItemsByCategory(userId: number, category: string): Promise<ContentItem[]>;
  getContentItemsByTag(userId: number, tag: string): Promise<ContentItem[]>;
  createContentItem(content: InsertContentItem): Promise<ContentItem>;
  updateContentItem(id: number, content: Partial<InsertContentItem>): Promise<ContentItem | undefined>;
  deleteContentItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private workflows: Map<number, Workflow>;
  private agents: Map<number, Agent>;
  private contentItems: Map<number, ContentItem>;
  private currentUserId: number;
  private currentCampaignId: number;
  private currentWorkflowId: number;
  private currentAgentId: number;
  private currentContentItemId: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.workflows = new Map();
    this.agents = new Map();
    this.contentItems = new Map();
    this.currentUserId = 1;
    this.currentCampaignId = 1;
    this.currentWorkflowId = 1;
    this.currentAgentId = 1;
    this.currentContentItemId = 1;
    
    // Initialize with default user
    this.initializeDefaultUser();
    
    // Initialize with default agents
    this.initializeDefaultAgents();
  }
  
  private initializeDefaultContentItems(userId: number) {
    const defaultContentItems: InsertContentItem[] = [
      {
        userId: userId,
        title: "How AI is Transforming Digital Marketing",
        content: "Artificial intelligence is revolutionizing how businesses approach digital marketing strategies...",
        contentType: "blog",
        category: "ai-marketing",
        tags: ["AI", "digital marketing", "technology"],
        status: "published",
        metadata: {
          wordCount: 1250,
          readTime: "5 min",
          seoScore: 92
        }
      },
      {
        userId: userId,
        title: "10 Social Media Trends for 2025",
        content: "The social media landscape continues to evolve at a rapid pace...",
        contentType: "social",
        category: "trends",
        tags: ["social media", "trends", "marketing"],
        status: "published",
        metadata: {
          wordCount: 950,
          readTime: "4 min",
          platforms: ["Instagram", "TikTok", "LinkedIn"]
        }
      },
      {
        userId: userId,
        title: "Email Marketing Campaign Template",
        content: "Subject: Special Offer Just For You!\n\nHello {customer.firstName},\n\nWe're excited to share our latest...",
        contentType: "email",
        category: "templates",
        tags: ["email", "campaigns", "templates"],
        status: "draft",
        metadata: {
          template: "promotional",
          subject: "Special Offer Just For You!",
          avgOpenRate: 28.5
        }
      },
      {
        userId: userId,
        title: "Product Launch Press Release",
        content: "FOR IMMEDIATE RELEASE\n\n[Company Name] Announces Revolutionary New Product...",
        contentType: "press-release",
        category: "product-launches",
        tags: ["press release", "product launch", "PR"],
        status: "draft",
        metadata: {
          releaseDate: "2025-04-15",
          contactPerson: "Marketing Director",
          priority: "high"
        }
      },
      {
        userId: userId,
        title: "Facebook Ad Campaign: Summer Collection",
        content: "Headline: Summer Styles Now 30% Off\nDescription: Limited time offer on our new summer collection...",
        contentType: "ad",
        category: "facebook",
        tags: ["ad", "facebook", "summer", "promotion"],
        status: "published",
        metadata: {
          budget: 500,
          audience: "Women 25-45",
          ctr: 2.8,
          cpc: 0.42
        }
      }
    ];
    
    defaultContentItems.forEach(contentItem => {
      this.createContentItem(contentItem);
    });
  }
  
  private initializeDefaultUser() {
    // Crear un usuario por defecto con el UID específico que necesitamos
    const defaultUser: InsertUser = {
      uid: "hHu8ZABjCPUBxhiWxSA6Z8A2pJ12", // UID específico que está buscando el cliente
      email: "admin@aimarketingplatform.com",
      displayName: "AI Marketing Admin",
      photoURL: null
    };
    
    // También crear el usuario de desarrollo para compatibilidad
    const devUser: InsertUser = {
      uid: "dev-user-123",
      email: "dev@example.com",
      displayName: "Development User",
      photoURL: null
    };
    
    // Crear el usuario por defecto
    this.createUser(defaultUser)
      .then(user => {
        // Create a default campaign for this user
        this.createDefaultCampaignForUser(user.id);
        
        // Create default content items for this user
        this.initializeDefaultContentItems(user.id);
        
        console.log("Created default user with UID:", defaultUser.uid);
      })
      .catch(err => {
        console.error("Failed to initialize default user:", err);
      });
      
    // Crear el usuario de desarrollo
    this.createUser(devUser)
      .then(devUserCreated => {
        console.log("Created development user with UID:", devUser.uid);
      })
      .catch(err => {
        console.error("Failed to initialize development user:", err);
      });
  }
  
  private async createDefaultCampaignForUser(userId: number) {
    try {
      // Create a default campaign
      const defaultCampaign: InsertCampaign = {
        userId: userId,
        name: "Welcome Campaign",
        description: "Your first AI marketing campaign",
        status: "active",
        workflowData: {
          title: "Getting Started Workflow",
          description: "A simple workflow to get you started with AI marketing",
          version: "1.0.0"
        }
      };
      
      const campaign = await this.createCampaign(defaultCampaign);
      
      // Create a default workflow for this campaign
      const defaultWorkflow: InsertWorkflow = {
        campaignId: campaign.id,
        name: "Content Generation Workflow",
        nodes: {
          node1: {
            id: "node1",
            type: "trigger",
            position: { x: 250, y: 100 },
            data: { label: "Start", type: "trigger", configuration: {} }
          },
          node2: {
            id: "node2",
            type: "agent",
            position: { x: 250, y: 200 },
            data: { 
              label: "Content Creation", 
              type: "copywriting",
              configuration: { 
                contentType: "Blog Post",
                tone: "Professional"
              }
            }
          },
          node3: {
            id: "node3",
            type: "agent",
            position: { x: 250, y: 300 },
            data: { 
              label: "SEO Optimization", 
              type: "seo",
              configuration: { 
                keywords: ["marketing", "automation", "AI"],
                optimizationLevel: 3
              }
            }
          },
          node4: {
            id: "node4",
            type: "output",
            position: { x: 250, y: 400 },
            data: { label: "Publish", type: "output", configuration: {} }
          }
        },
        edges: {
          edge1: {
            id: "edge1",
            source: "node1",
            target: "node2",
            type: "default",
            animated: true
          },
          edge2: {
            id: "edge2",
            source: "node2",
            target: "node3",
            type: "default",
            animated: true
          },
          edge3: {
            id: "edge3",
            source: "node3",
            target: "node4",
            type: "default",
            animated: true
          }
        }
      };
      
      await this.createWorkflow(defaultWorkflow);
    } catch (err) {
      console.error("Failed to create default campaign:", err);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.uid === uid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      createdAt: now,
      displayName: insertUser.displayName || null,
      photoURL: insertUser.photoURL || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.userId === userId,
    );
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const now = new Date();
    const campaign: Campaign = { 
      ...insertCampaign, 
      id, 
      createdAt: now,
      updatedAt: now,
      status: insertCampaign.status || "draft",
      description: insertCampaign.description || null,
      workflowData: insertCampaign.workflowData || null
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, campaignData: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = await this.getCampaign(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { 
      ...campaign, 
      ...campaignData,
      updatedAt: new Date()
    };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async getWorkflowsByCampaignId(campaignId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(
      (workflow) => workflow.campaignId === campaignId,
    );
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentWorkflowId++;
    const now = new Date();
    const workflow: Workflow = { 
      ...insertWorkflow, 
      id, 
      createdAt: now,
      updatedAt: now,
      nodes: insertWorkflow.nodes || {},
      edges: insertWorkflow.edges || {}
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, workflowData: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const workflow = await this.getWorkflow(id);
    if (!workflow) return undefined;
    
    const updatedWorkflow = { 
      ...workflow, 
      ...workflowData,
      updatedAt: new Date()
    };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }

  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.currentAgentId++;
    const agent: Agent = { 
      ...insertAgent, 
      id,
      description: insertAgent.description || null,
      configuration: insertAgent.configuration || {},
      icon: insertAgent.icon || null,
      color: insertAgent.color || null
    };
    this.agents.set(id, agent);
    return agent;
  }

  private initializeDefaultAgents() {
    const defaultAgents: InsertAgent[] = [
      {
        type: "seo",
        name: "SEO Agent",
        description: "Optimize content for search engines",
        icon: "search",
        color: "blue",
        configuration: {
          keywords: [],
          targetAudience: "General",
          contentType: "Blog Post",
          optimizationLevel: 3,
          mode: "autonomous"
        }
      },
      {
        type: "copywriting",
        name: "Copywriting Agent",
        description: "Create persuasive text content",
        icon: "pencil",
        color: "green",
        configuration: {
          contentType: "Blog Post",
          tone: "Professional",
          length: "Medium",
          mode: "autonomous"
        }
      },
      {
        type: "ads",
        name: "Ads Manager",
        description: "Create and optimize advertising campaigns",
        icon: "pie-chart",
        color: "purple",
        configuration: {
          platform: "Google Ads",
          budget: 500,
          objective: "Conversions",
          mode: "autonomous"
        }
      },
      {
        type: "creative",
        name: "Image & Creative",
        description: "Generate visual content for marketing",
        icon: "image",
        color: "pink",
        configuration: {
          style: "Professional",
          size: "1024x1024",
          format: "JPG",
          mode: "autonomous"
        }
      },
      {
        type: "email",
        name: "Email Marketing",
        description: "Craft and optimize email campaigns",
        icon: "mail",
        color: "yellow",
        configuration: {
          frequency: "Weekly",
          type: "Newsletter",
          subject: "Auto-generated",
          mode: "autonomous"
        }
      },
      {
        type: "analytics",
        name: "Analytics & Reports",
        description: "Measure results and generate insights",
        icon: "bar-chart",
        color: "indigo",
        configuration: {
          metrics: ["Impressions", "Clicks", "Conversions"],
          reportFrequency: "Weekly",
          mode: "autonomous"
        }
      },
      {
        type: "social",
        name: "Social Media",
        description: "Manage social media content and campaigns",
        icon: "message-circle",
        color: "orange",
        configuration: {
          platforms: ["Twitter", "Instagram", "LinkedIn"],
          postingFrequency: "Daily",
          contentMix: "Text and Images",
          mode: "autonomous"
        }
      }
    ];

    defaultAgents.forEach(agent => {
      this.createAgent(agent);
    });
  }

  // Content Hub methods implementation
  async getContentItem(id: number): Promise<ContentItem | undefined> {
    return this.contentItems.get(id);
  }

  async getContentItemsByUserId(userId: number): Promise<ContentItem[]> {
    return Array.from(this.contentItems.values()).filter(
      (content) => content.userId === userId
    );
  }

  async getContentItemsByType(userId: number, contentType: string): Promise<ContentItem[]> {
    return Array.from(this.contentItems.values()).filter(
      (content) => content.userId === userId && content.contentType === contentType
    );
  }

  async getContentItemsByCategory(userId: number, category: string): Promise<ContentItem[]> {
    return Array.from(this.contentItems.values()).filter(
      (content) => content.userId === userId && content.category === category
    );
  }

  async getContentItemsByTag(userId: number, tag: string): Promise<ContentItem[]> {
    return Array.from(this.contentItems.values()).filter(
      (content) => content.userId === userId && content.tags?.includes(tag)
    );
  }

  async createContentItem(insertContent: InsertContentItem): Promise<ContentItem> {
    const id = this.currentContentItemId++;
    const now = new Date();
    const content: ContentItem = {
      ...insertContent,
      id,
      createdAt: now,
      updatedAt: now,
      title: insertContent.title || "",
      description: insertContent.description || null,
      content: insertContent.content || "",
      status: insertContent.status || "draft",
      contentType: insertContent.contentType || "general",
      category: insertContent.category || null,
      tags: insertContent.tags || [],
      metadata: insertContent.metadata || {}
    };
    this.contentItems.set(id, content);
    return content;
  }

  async updateContentItem(id: number, contentData: Partial<InsertContentItem>): Promise<ContentItem | undefined> {
    const content = await this.getContentItem(id);
    if (!content) return undefined;
    
    const updatedContent = {
      ...content,
      ...contentData,
      updatedAt: new Date()
    };
    this.contentItems.set(id, updatedContent);
    return updatedContent;
  }

  async deleteContentItem(id: number): Promise<boolean> {
    return this.contentItems.delete(id);
  }
}

export const storage = new MemStorage();
