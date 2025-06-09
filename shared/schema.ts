import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  address: text("address").notNull(),
  suburb: text("suburb").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  propertyType: text("property_type").notNull(), // house, apartment, townhouse, flat, cluster_home, farm, vacant_land
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }).notNull(),
  area: integer("area").notNull(), // square meters
  lotSize: text("lot_size"),
  yearBuilt: integer("year_built"),
  parking: text("parking"),
  features: jsonb("features").$type<string[]>().default([]),
  images: jsonb("images").$type<string[]>().default([]),
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
  avatar: text("avatar"),
  bio: text("bio"),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalSales: integer("total_sales").default(0),
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

// Schema validation
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  rating: true,
  totalSales: true,
  createdAt: true,
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

// Types
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

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
