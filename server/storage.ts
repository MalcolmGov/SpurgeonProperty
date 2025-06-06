import { 
  properties, 
  agents, 
  leads, 
  inquiries,
  type Property, 
  type Agent, 
  type Lead, 
  type Inquiry,
  type InsertProperty, 
  type InsertAgent, 
  type InsertLead, 
  type InsertInquiry,
  type PropertyWithAgent,
  type LeadWithProperty
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, gte, lte, desc, asc, or } from "drizzle-orm";

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
      let query = db
        .select()
        .from(properties)
        .leftJoin(agents, eq(properties.agentId, agents.id));

      const conditions = [];
      
      if (filters?.search) {
        conditions.push(
          or(
            ilike(properties.title, `%${filters.search}%`),
            ilike(properties.description, `%${filters.search}%`),
            ilike(properties.address, `%${filters.search}%`)
          )
        );
      }
      if (filters?.propertyType && filters.propertyType !== "any") {
        conditions.push(eq(properties.propertyType, filters.propertyType));
      }
      if (filters?.minPrice) {
        conditions.push(gte(properties.price, filters.minPrice.toString()));
      }
      if (filters?.maxPrice) {
        conditions.push(lte(properties.price, filters.maxPrice.toString()));
      }
      if (filters?.bedrooms) {
        conditions.push(eq(properties.bedrooms, filters.bedrooms));
      }
      if (filters?.bathrooms) {
        conditions.push(eq(properties.bathrooms, filters.bathrooms.toString()));
      }
      if (filters?.city) {
        conditions.push(ilike(properties.city, `%${filters.city}%`));
      }
      if (filters?.status && filters.status !== "any") {
        conditions.push(eq(properties.status, filters.status));
      }
      if (filters?.featured !== undefined) {
        conditions.push(eq(properties.featured, filters.featured));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const results = await query
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
    const [result] = await db
      .select()
      .from(properties)
      .leftJoin(agents, eq(properties.agentId, agents.id))
      .where(eq(properties.id, id));

    if (!result) return undefined;

    return {
      ...result.properties,
      agent: result.agents || undefined
    };
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db
      .insert(properties)
      .values(property)
      .returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning();
    return result.length > 0;
  }

  async incrementPropertyViews(id: number): Promise<void> {
    // Get current property to increment views
    const currentProperty = await this.getProperty(id);
    if (currentProperty) {
      await db
        .update(properties)
        .set({ 
          views: (currentProperty.views || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(properties.id, id));
    }
  }

  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db
      .insert(agents)
      .values(agent)
      .returning();
    return newAgent;
  }

  async updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [updated] = await db
      .update(agents)
      .set(agent)
      .where(eq(agents.id, id))
      .returning();
    return updated || undefined;
  }

  async getLeads(filters?: {
    status?: string;
    agentId?: number;
    propertyId?: number;
    limit?: number;
    offset?: number;
  }): Promise<LeadWithProperty[]> {
    let query = db
      .select()
      .from(leads)
      .leftJoin(properties, eq(leads.propertyId, properties.id))
      .leftJoin(agents, eq(leads.agentId, agents.id));

    const conditions = [];
    if (filters?.status && filters.status !== "any") {
      conditions.push(eq(leads.status, filters.status));
    }
    if (filters?.agentId) {
      conditions.push(eq(leads.agentId, filters.agentId));
    }
    if (filters?.propertyId) {
      conditions.push(eq(leads.propertyId, filters.propertyId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(leads.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;
    return results.map(row => ({
      ...row.leads,
      property: row.properties || undefined,
      agent: row.agents || undefined
    }));
  }

  async getLead(id: number): Promise<LeadWithProperty | undefined> {
    const [result] = await db
      .select()
      .from(leads)
      .leftJoin(properties, eq(leads.propertyId, properties.id))
      .leftJoin(agents, eq(leads.agentId, agents.id))
      .where(eq(leads.id, id));

    if (!result) return undefined;

    return {
      ...result.leads,
      property: result.properties || undefined,
      agent: result.agents || undefined
    };
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db
      .insert(leads)
      .values(lead)
      .returning();
    return newLead;
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updated] = await db
      .update(leads)
      .set({ ...lead, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated || undefined;
  }

  async getInquiries(leadId?: number): Promise<Inquiry[]> {
    if (leadId) {
      return await db.select().from(inquiries).where(eq(inquiries.leadId, leadId));
    }
    return await db.select().from(inquiries);
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db
      .insert(inquiries)
      .values(inquiry)
      .returning();
    return newInquiry;
  }

  async getStats(): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalLeads: number;
    newLeads: number;
    totalAgents: number;
    recentSales: number;
  }> {
    // Using SQL aggregation functions for accurate counts
    const statsQueries = await Promise.all([
      db.select({ count: properties.id }).from(properties),
      db.select({ count: properties.id }).from(properties).where(eq(properties.status, 'active')),
      db.select({ count: leads.id }).from(leads),
      db.select({ count: leads.id }).from(leads).where(eq(leads.status, 'new')),
      db.select({ count: agents.id }).from(agents),
      db.select({ count: properties.id }).from(properties).where(eq(properties.status, 'sold'))
    ]);

    return {
      totalProperties: statsQueries[0].length,
      activeProperties: statsQueries[1].length,
      totalLeads: statsQueries[2].length,
      newLeads: statsQueries[3].length,
      totalAgents: statsQueries[4].length,
      recentSales: statsQueries[5].length,
    };
  }
}

export const storage = new DatabaseStorage();