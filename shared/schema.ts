import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  workflowData: jsonb("workflow_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  configuration: jsonb("configuration"),
  icon: text("icon"),
  color: text("color"),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  name: text("name").notNull(),
  nodes: jsonb("nodes"),
  edges: jsonb("edges"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversation memory for AI agents
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").references(() => agents.id),
  title: text("title").notNull(),
  summary: text("summary"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual messages within a conversation
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(), // user, assistant, system, function, etc.
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  tokenCount: integer("token_count"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Content items for AI Content Hub
export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // blog, email, social, etc.
  category: varchar("category", { length: 50 }), // content-type, marketing-function, funnel-stage
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published, archived
  metadata: jsonb("metadata"), // Store additional properties like tone, style, language
  tags: text("tags").array(), // Array of tags for organization
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  uid: true,
  email: true,
  displayName: true,
  photoURL: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  userId: true,
  name: true,
  description: true,
  status: true,
  workflowData: true,
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  type: true,
  name: true,
  description: true,
  configuration: true,
  icon: true,
  color: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).pick({
  campaignId: true,
  name: true,
  nodes: true,
  edges: true,
});

export const insertContentItemSchema = createInsertSchema(contentItems).pick({
  userId: true,
  title: true,
  description: true,
  content: true,
  contentType: true,
  category: true,
  status: true,
  metadata: true,
  tags: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export type InsertContentItem = z.infer<typeof insertContentItemSchema>;
export type ContentItem = typeof contentItems.$inferSelect;

export type WorkflowNode = {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    type: string;
    configuration: Record<string, any>;
  };
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
};
