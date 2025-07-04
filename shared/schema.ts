import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  additionalInfo: text("additional_info"),
  price: text("price").notNull().default("POA"),
  address: text("address").notNull(),
  suburb: text("suburb").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  propertyType: text("property_type").notNull(), // house, apartment, townhouse, flat, cluster_home, farm, vacant_land
  listingType: text("listing_type").notNull().default("sale"), // sale, rent
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: text("bathrooms").notNull(),
  area: integer("area").notNull(), // square meters
  lotSize: text("lot_size"),
  yearBuilt: integer("year_built"),
  parking: text("parking"),
  features: jsonb("features").$type<string[]>().default([]),
  images: jsonb("images").$type<string[]>().default([]),
  featuredImage: text("featured_image"), // Primary image for property cards
  videos: jsonb("videos").$type<string[]>().default([]),
  videoUrls: jsonb("video_urls").$type<string[]>().default([]), // External video URLs (YouTube, Vimeo, etc.)
  status: text("status").notNull().default("active"), // active, pending, sold, rented
  agentId: integer("agent_id"),
  featured: boolean("featured").default(false),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  avatar: text("avatar"), // URL to uploaded photo
  bio: text("bio"),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  // Enhanced professional details
  title: text("title"), // Job title (e.g., "Senior Property Consultant")
  licenseNumber: text("license_number"), // Real estate license number
  yearsExperience: integer("years_experience").default(0),
  languages: jsonb("languages").$type<string[]>().default([]), // Languages spoken
  education: text("education"), // Educational background
  certifications: jsonb("certifications").$type<string[]>().default([]), // Professional certifications
  officeLocation: text("office_location"), // Office/branch location
  workingHours: text("working_hours"), // Working hours (e.g., "Mon-Fri 9AM-6PM")
  linkedinUrl: text("linkedin_url"), // LinkedIn profile
  personalWebsite: text("personal_website"), // Personal website
  // Performance metrics
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalSales: integer("total_sales").default(0),
  totalListings: integer("total_listings").default(0),
  averageResponseTime: integer("avg_response_time_hours").default(24), // in hours
  // Status and authentication
  password: text("password").notNull(),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentSessions = pgTable("agent_sessions", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  sessionId: text("session_id").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  propertyId: integer("property_id"),
  agentId: integer("agent_id"),
  source: text("source").default("website"), // website, referral, social
  status: text("status").default("new"), // new, contacted, qualified, closed
  priority: text("priority").default("medium"), // low, medium, high
  notes: text("notes"),
  agentResponse: text("agent_response"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  propertyId: integer("property_id").notNull(),
  type: text("type").notNull(), // viewing, info_request, offer
  scheduledDate: timestamp("scheduled_date"),
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: text("user_id"), // Optional user identification
  userPreferences: jsonb("user_preferences").$type<{
    budgetMin?: number;
    budgetMax?: number;
    preferredAreas?: string[];
    propertyTypes?: string[];
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    lifestyle?: string[];
  }>().default({}),
  conversationContext: jsonb("conversation_context").$type<{
    lastSearch?: any;
    propertyViewed?: number[];
    interests?: string[];
    stage?: string; // browsing, serious_buyer, viewing_scheduled
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => chatSessions.sessionId).notNull(),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<{
    propertyIds?: number[];
    searchFilters?: any;
    intent?: string;
    confidence?: number;
    suggestions?: string[];
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema validation
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  price: z.string().optional(), // Make price optional in forms, will default to "POA" if empty
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  rating: true,
  totalSales: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
});

export const insertAgentSessionSchema = createInsertSchema(agentSessions).omit({
  id: true,
  createdAt: true,
});

export const agentLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const agentRegistrationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  bio: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  // Enhanced professional details
  title: z.string().optional(),
  licenseNumber: z.string().optional(),
  yearsExperience: z.number().min(0).default(0),
  languages: z.array(z.string()).default([]),
  education: z.string().optional(),
  certifications: z.array(z.string()).default([]),
  officeLocation: z.string().optional(),
  workingHours: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  personalWebsite: z.string().url().optional().or(z.literal("")),
  avatar: z.string().optional(), // Will be set during photo upload
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type AgentSession = typeof agentSessions.$inferSelect;
export type InsertAgentSession = z.infer<typeof insertAgentSessionSchema>;
export type AgentLogin = z.infer<typeof agentLoginSchema>;
export type AgentRegistration = z.infer<typeof agentRegistrationSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Extended types for API responses
export type PropertyWithAgent = Property & {
  agent?: Agent;
};

// Relations
export const propertiesRelations = relations(properties, ({ one }) => ({
  agent: one(agents, {
    fields: [properties.agentId],
    references: [agents.id],
  }),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  properties: many(properties),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  property: one(properties, {
    fields: [leads.propertyId],
    references: [properties.id],
  }),
  agent: one(agents, {
    fields: [leads.agentId],
    references: [agents.id],
  }),
  inquiries: many(inquiries),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  lead: one(leads, {
    fields: [inquiries.leadId],
    references: [leads.id],
  }),
}));

export type LeadWithProperty = Lead & {
  property?: Property;
  agent?: Agent;
};

// Admin Users table for back office authentication
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin session storage for authentication
export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  adminUserId: integer("admin_user_id").notNull().references(() => adminUsers.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin auth schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  passwordHash: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Admin types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
