import { db } from './db';
import { properties, agents, leads, inquiries } from '@shared/schema';
import { eq, and, or, like, gte, lte, desc, asc, count } from 'drizzle-orm';
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
      const whereConditions = [];

      if (filters?.search) {
        whereConditions.push(
          or(
            like(properties.title, `%${filters.search}%`),
            like(properties.description, `%${filters.search}%`),
            like(properties.address, `%${filters.search}%`)
          )
        );
      }

      if (filters?.propertyType) {
        whereConditions.push(eq(properties.propertyType, filters.propertyType));
      }

      if (filters?.bedrooms) {
        whereConditions.push(eq(properties.bedrooms, filters.bedrooms));
      }

      if (filters?.city) {
        whereConditions.push(eq(properties.city, filters.city));
      }

      if (filters?.status) {
        whereConditions.push(eq(properties.status, filters.status));
      }

      if (filters?.featured !== undefined) {
        whereConditions.push(eq(properties.featured, filters.featured));
      }

      let query = db
        .select({
          property: properties,
          agent: agents
        })
        .from(properties)
        .leftJoin(agents, eq(properties.agentId, agents.id));

      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }

      query = query.orderBy(desc(properties.createdAt));

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.offset(filters.offset);
      }

      const results = await query;

      return results.map(row => ({
        ...row.property,
        agent: row.agent || undefined
      }));
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Failed to fetch properties');
    }
  }

  async getProperty(id: number): Promise<PropertyWithAgent | undefined> {
    try {
      const result = await db
        .select({
          property: properties,
          agent: agents
        })
        .from(properties)
        .leftJoin(agents, eq(properties.agentId, agents.id))
        .where(eq(properties.id, id))
        .limit(1);

      if (result.length === 0) return undefined;

      return {
        ...result[0].property,
        agent: result[0].agent
      };
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Failed to fetch property');
    }
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    try {
      console.log('Creating property:', property.title);
      const result = await db.insert(properties).values(property).returning();
      console.log('Property created successfully with ID:', result[0].id);
      return result[0];
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error('Failed to create property');
    }
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    try {
      const result = await db
        .update(properties)
        .set({ ...property, updatedAt: new Date() })
        .where(eq(properties.id, id))
        .returning();

      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating property:', error);
      throw new Error('Failed to update property');
    }
  }

  async deleteProperty(id: number): Promise<boolean> {
    try {
      const result = await db.delete(properties).where(eq(properties.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  async incrementPropertyViews(id: number): Promise<void> {
    try {
      await db.execute(`UPDATE properties SET views = views + 1 WHERE id = ${id}`);
    } catch (error) {
      console.error('Error incrementing property views:', error);
    }
  }

  async getAgents(): Promise<Agent[]> {
    try {
      return await db.select().from(agents).orderBy(asc(agents.name));
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw new Error('Failed to fetch agents');
    }
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    try {
      const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw new Error('Failed to fetch agent');
    }
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    try {
      const result = await db.insert(agents).values(agent).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new Error('Failed to create agent');
    }
  }

  async updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined> {
    try {
      const result = await db
        .update(agents)
        .set(agent)
        .where(eq(agents.id, id))
        .returning();

      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw new Error('Failed to update agent');
    }
  }

  async getLeads(filters?: {
    status?: string;
    agentId?: number;
    propertyId?: number;
    limit?: number;
    offset?: number;
  }): Promise<LeadWithProperty[]> {
    try {
      let query = db
        .select({
          lead: leads,
          property: properties,
          agent: agents
        })
        .from(leads)
        .leftJoin(properties, eq(leads.propertyId, properties.id))
        .leftJoin(agents, eq(leads.agentId, agents.id));

      const conditions = [];

      if (filters?.status) {
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
        ...row.lead,
        property: row.property,
        agent: row.agent
      }));
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new Error('Failed to fetch leads');
    }
  }

  async getLead(id: number): Promise<LeadWithProperty | undefined> {
    try {
      const result = await db
        .select({
          lead: leads,
          property: properties,
          agent: agents
        })
        .from(leads)
        .leftJoin(properties, eq(leads.propertyId, properties.id))
        .leftJoin(agents, eq(leads.agentId, agents.id))
        .where(eq(leads.id, id))
        .limit(1);

      if (result.length === 0) return undefined;

      return {
        ...result[0].lead,
        property: result[0].property,
        agent: result[0].agent
      };
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw new Error('Failed to fetch lead');
    }
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    try {
      const result = await db.insert(leads).values(lead).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead');
    }
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    try {
      const result = await db
        .update(leads)
        .set({ ...lead, updatedAt: new Date() })
        .where(eq(leads.id, id))
        .returning();

      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error('Failed to update lead');
    }
  }

  async getInquiries(leadId?: number): Promise<Inquiry[]> {
    try {
      let query = db.select().from(inquiries);

      if (leadId) {
        query = query.where(eq(inquiries.leadId, leadId));
      }

      return await query.orderBy(desc(inquiries.createdAt));
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      throw new Error('Failed to fetch inquiries');
    }
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    try {
      const result = await db.insert(inquiries).values(inquiry).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating inquiry:', error);
      throw new Error('Failed to create inquiry');
    }
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
        totalPropertiesResult,
        activePropertiesResult,
        totalLeadsResult,
        newLeadsResult,
        totalAgentsResult,
        recentSalesResult
      ] = await Promise.all([
        db.select({ count: count() }).from(properties),
        db.select({ count: count() }).from(properties).where(eq(properties.status, 'active')),
        db.select({ count: count() }).from(leads),
        db.select({ count: count() }).from(leads).where(eq(leads.status, 'new')),
        db.select({ count: count() }).from(agents),
        db.select({ count: count() }).from(properties).where(eq(properties.status, 'sold'))
      ]);

      return {
        totalProperties: totalPropertiesResult[0].count,
        activeProperties: activePropertiesResult[0].count,
        totalLeads: totalLeadsResult[0].count,
        newLeads: newLeadsResult[0].count,
        totalAgents: totalAgentsResult[0].count,
        recentSales: recentSalesResult[0].count
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error('Failed to fetch statistics');
    }
  }
}

export const storage = new DatabaseStorage();