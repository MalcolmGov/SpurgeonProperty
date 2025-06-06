import { db } from "./db";
import { properties, agents, leads, inquiries } from "@shared/schema";
import { eq, and, or, ilike, gte, lte, desc } from "drizzle-orm";
import type { 
  Property, 
  InsertProperty, 
  Agent, 
  InsertAgent, 
  Lead, 
  InsertLead, 
  Inquiry, 
  InsertInquiry,
  PropertyWithAgent,
  LeadWithProperty 
} from "@shared/schema";

export interface IStorage {
  // Properties
  getProperties(filters?: {
    search?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    city?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PropertyWithAgent[]>;
  getProperty(id: number): Promise<PropertyWithAgent | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  incrementPropertyViews(id: number): Promise<void>;

  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined>;

  // Leads
  getLeads(filters?: {
    status?: string;
    agentId?: number;
    propertyId?: number;
    limit?: number;
    offset?: number;
  }): Promise<LeadWithProperty[]>;
  getLead(id: number): Promise<LeadWithProperty | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;

  // Inquiries
  getInquiries(leadId?: number): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;

  // Analytics
  getStats(): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalLeads: number;
    newLeads: number;
    totalAgents: number;
    recentSales: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getProperties(filters?: {
    search?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    city?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PropertyWithAgent[]> {
    try {
      // Start with basic query
      let queryBuilder = db
        .select()
        .from(properties)
        .leftJoin(agents, eq(properties.agentId, agents.id));

      // Apply filters one by one
      const whereConditions = [];

      if (filters?.search) {
        whereConditions.push(
          or(
            ilike(properties.title, `%${filters.search}%`),
            ilike(properties.description, `%${filters.search}%`),
            ilike(properties.address, `%${filters.search}%`)
          )
        );
      }

      if (filters?.propertyType && filters.propertyType !== "any") {
        whereConditions.push(eq(properties.propertyType, filters.propertyType));
      }

      if (filters?.minPrice) {
        whereConditions.push(gte(properties.price, filters.minPrice.toString()));
      }

      if (filters?.maxPrice) {
        whereConditions.push(lte(properties.price, filters.maxPrice.toString()));
      }

      if (filters?.bedrooms) {
        whereConditions.push(eq(properties.bedrooms, filters.bedrooms));
      }

      if (filters?.bathrooms) {
        whereConditions.push(eq(properties.bathrooms, filters.bathrooms.toString()));
      }

      if (filters?.city) {
        whereConditions.push(ilike(properties.city, `%${filters.city}%`));
      }

      if (filters?.status && filters.status !== "any") {
        whereConditions.push(eq(properties.status, filters.status));
      }

      if (filters?.featured !== undefined) {
        whereConditions.push(eq(properties.featured, filters.featured));
      }

      // Apply where conditions if any exist
      if (whereConditions.length > 0) {
        queryBuilder = queryBuilder.where(and(...whereConditions));
      }

      // Apply ordering and pagination
      const results = await queryBuilder
        .orderBy(desc(properties.createdAt))
        .limit(filters?.limit || 20)
        .offset(filters?.offset || 0);

      return results.map(row => ({
        ...row.properties,
        agent: row.agents || undefined
      }));
    } catch (error) {
      console.error('Database error in getProperties:', error);
      return [];
    }
  }

  async getProperty(id: number): Promise<PropertyWithAgent | undefined> {
    try {
      const result = await db
        .select()
        .from(properties)
        .leftJoin(agents, eq(properties.agentId, agents.id))
        .where(eq(properties.id, id))
        .limit(1);

      if (result.length === 0) return undefined;

      const row = result[0];
      return {
        ...row.properties,
        agent: row.agents || undefined
      };
    } catch (error) {
      console.error('Database error in getProperty:', error);
      return undefined;
    }
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(property).returning();
    return result[0];
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const updateData = { ...property, updatedAt: new Date() };
    const result = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, id))
      .returning();
    return result[0] || undefined;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning();
    return result.length > 0;
  }

  async incrementPropertyViews(id: number): Promise<void> {
    await db
      .update(properties)
      .set({ views: properties.views + 1 })
      .where(eq(properties.id, id));
  }

  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    return result[0] || undefined;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const result = await db.insert(agents).values(agent).returning();
    return result[0];
  }

  async updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined> {
    const result = await db
      .update(agents)
      .set(agent)
      .where(eq(agents.id, id))
      .returning();
    return result[0] || undefined;
  }

  async getLeads(filters?: {
    status?: string;
    agentId?: number;
    propertyId?: number;
    limit?: number;
    offset?: number;
  }): Promise<LeadWithProperty[]> {
    try {
      let queryBuilder = db
        .select()
        .from(leads)
        .leftJoin(properties, eq(leads.propertyId, properties.id))
        .leftJoin(agents, eq(leads.agentId, agents.id));

      const whereConditions = [];

      if (filters?.status && filters.status !== "all") {
        whereConditions.push(eq(leads.status, filters.status));
      }

      if (filters?.agentId) {
        whereConditions.push(eq(leads.agentId, filters.agentId));
      }

      if (filters?.propertyId) {
        whereConditions.push(eq(leads.propertyId, filters.propertyId));
      }

      if (whereConditions.length > 0) {
        queryBuilder = queryBuilder.where(and(...whereConditions));
      }

      const results = await queryBuilder
        .orderBy(desc(leads.createdAt))
        .limit(filters?.limit || 20)
        .offset(filters?.offset || 0);

      return results.map(row => ({
        ...row.leads,
        property: row.properties || undefined,
        agent: row.agents || undefined
      }));
    } catch (error) {
      console.error('Database error in getLeads:', error);
      return [];
    }
  }

  async getLead(id: number): Promise<LeadWithProperty | undefined> {
    try {
      const result = await db
        .select()
        .from(leads)
        .leftJoin(properties, eq(leads.propertyId, properties.id))
        .leftJoin(agents, eq(leads.agentId, agents.id))
        .where(eq(leads.id, id))
        .limit(1);

      if (result.length === 0) return undefined;

      const row = result[0];
      return {
        ...row.leads,
        property: row.properties || undefined,
        agent: row.agents || undefined
      };
    } catch (error) {
      console.error('Database error in getLead:', error);
      return undefined;
    }
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    const result = await db
      .update(leads)
      .set(lead)
      .where(eq(leads.id, id))
      .returning();
    return result[0] || undefined;
  }

  async getInquiries(leadId?: number): Promise<Inquiry[]> {
    if (leadId) {
      return await db.select().from(inquiries).where(eq(inquiries.leadId, leadId));
    }
    return await db.select().from(inquiries);
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const result = await db.insert(inquiries).values(inquiry).returning();
    return result[0];
  }

  async getStats(): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalLeads: number;
    newLeads: number;
    totalAgents: number;
    recentSales: number;
  }> {
    try {
      const [
        totalProperties,
        activeProperties,
        totalLeads,
        newLeads,
        totalAgents
      ] = await Promise.all([
        db.select().from(properties),
        db.select().from(properties).where(eq(properties.status, 'active')),
        db.select().from(leads),
        db.select().from(leads).where(eq(leads.status, 'new')),
        db.select().from(agents)
      ]);

      return {
        totalProperties: totalProperties.length,
        activeProperties: activeProperties.length,
        totalLeads: totalLeads.length,
        newLeads: newLeads.length,
        totalAgents: totalAgents.length,
        recentSales: 0 // Placeholder for now
      };
    } catch (error) {
      console.error('Database error in getStats:', error);
      return {
        totalProperties: 0,
        activeProperties: 0,
        totalLeads: 0,
        newLeads: 0,
        totalAgents: 0,
        recentSales: 0
      };
    }
  }
}

export const storage = new DatabaseStorage();