import { db } from './db';
import { properties, agents, leads, inquiries } from '@shared/schema';
import { eq, and, or, like, gte, lte, desc, asc } from 'drizzle-orm';
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
    suburb?: string;
    city?: string;
    province?: string;
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
    suburb?: string;
    city?: string;
    province?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PropertyWithAgent[]> {
    try {
      let query = `
        SELECT 
          p.*,
          a.id as agent_id,
          a.name as agent_name,
          a.email as agent_email,
          a.phone as agent_phone,
          a.avatar as agent_avatar,
          a.bio as agent_bio,
          a.specialties as agent_specialties,
          a.rating as agent_rating,
          a.total_sales as agent_total_sales,
          a.created_at as agent_created_at
        FROM properties p
        LEFT JOIN agents a ON p.agent_id = a.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.search) {
        query += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex})`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters?.propertyType) {
        query += ` AND p.property_type = $${paramIndex}`;
        params.push(filters.propertyType);
        paramIndex++;
      }

      if (filters?.minPrice) {
        query += ` AND p.price >= $${paramIndex}`;
        params.push(filters.minPrice);
        paramIndex++;
      }

      if (filters?.maxPrice) {
        query += ` AND p.price <= $${paramIndex}`;
        params.push(filters.maxPrice);
        paramIndex++;
      }

      if (filters?.bedrooms) {
        query += ` AND p.bedrooms = $${paramIndex}`;
        params.push(filters.bedrooms);
        paramIndex++;
      }

      if (filters?.bathrooms) {
        query += ` AND p.bathrooms = $${paramIndex}`;
        params.push(filters.bathrooms);
        paramIndex++;
      }

      if (filters?.city) {
        query += ` AND p.city ILIKE $${paramIndex}`;
        params.push(`%${filters.city}%`);
        paramIndex++;
      }

      if (filters?.suburb) {
        query += ` AND p.suburb ILIKE $${paramIndex}`;
        params.push(`%${filters.suburb}%`);
        paramIndex++;
      }

      if (filters?.status && filters.status !== "any") {
        query += ` AND p.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.featured !== undefined) {
        query += ` AND p.featured = $${paramIndex}`;
        params.push(filters.featured);
        paramIndex++;
      }

      query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex}`;
      params.push(filters?.limit || 20);
      paramIndex++;

      query += ` OFFSET $${paramIndex}`;
      params.push(filters?.offset || 0);

      const result = await pool.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price.toString(),
        address: row.address,
        suburb: row.suburb,
        city: row.city,
        province: row.province,
        postalCode: row.postal_code,
        latitude: row.latitude,
        longitude: row.longitude,
        propertyType: row.property_type,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms.toString(),
        area: row.area,
        lotSize: row.lot_size,
        yearBuilt: row.year_built,
        parking: row.parking,
        features: row.features || [],
        images: row.images || [],
        status: row.status,
        agentId: row.agent_id,
        featured: row.featured,
        views: row.views,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        agent: row.agent_id ? {
          id: row.agent_id,
          name: row.agent_name,
          email: row.agent_email,
          phone: row.agent_phone,
          avatar: row.agent_avatar,
          bio: row.agent_bio,
          specialties: row.agent_specialties || [],
          rating: row.agent_rating,
          totalSales: row.agent_total_sales,
          createdAt: row.agent_created_at
        } : undefined
      }));
    } catch (error) {
      console.error('Database error in getProperties:', error);
      return [];
    }
  }

  async getProperty(id: number): Promise<PropertyWithAgent | undefined> {
    try {
      const query = `
        SELECT 
          p.*,
          a.id as agent_id,
          a.name as agent_name,
          a.email as agent_email,
          a.phone as agent_phone,
          a.avatar as agent_avatar,
          a.bio as agent_bio,
          a.specialties as agent_specialties,
          a.rating as agent_rating,
          a.total_sales as agent_total_sales,
          a.created_at as agent_created_at
        FROM properties p
        LEFT JOIN agents a ON p.agent_id = a.id
        WHERE p.id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) return undefined;
      
      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: row.price.toString(),
        address: row.address,
        suburb: row.suburb,
        city: row.city,
        province: row.province,
        postalCode: row.postal_code,
        latitude: row.latitude,
        longitude: row.longitude,
        propertyType: row.property_type,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms.toString(),
        area: row.area,
        lotSize: row.lot_size,
        yearBuilt: row.year_built,
        parking: row.parking,
        features: row.features || [],
        images: row.images || [],
        status: row.status,
        agentId: row.agent_id,
        featured: row.featured,
        views: row.views,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        agent: row.agent_id ? {
          id: row.agent_id,
          name: row.agent_name,
          email: row.agent_email,
          phone: row.agent_phone,
          avatar: row.agent_avatar,
          bio: row.agent_bio,
          specialties: row.agent_specialties || [],
          rating: row.agent_rating,
          totalSales: row.agent_total_sales,
          createdAt: row.agent_created_at
        } : undefined
      };
    } catch (error) {
      console.error('Database error in getProperty:', error);
      return undefined;
    }
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const query = `
      INSERT INTO properties (
        title, description, price, address, suburb, city, province, postal_code,
        property_type, bedrooms, bathrooms, area, lot_size, year_built, parking,
        features, images, status, agent_id, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;
    
    const values = [
      property.title,
      property.description,
      property.price,
      property.address,
      property.suburb,
      property.city,
      property.province,
      property.postalCode,
      property.propertyType,
      property.bedrooms,
      property.bathrooms,
      property.area,
      property.lotSize,
      property.yearBuilt,
      property.parking,
      JSON.stringify(property.features || []),
      JSON.stringify(property.images || []),
      property.status,
      property.agentId,
      property.featured
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      address: row.address,
      suburb: row.suburb,
      city: row.city,
      province: row.province,
      postalCode: row.postal_code,
      propertyType: row.property_type,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      area: row.area,
      lotSize: row.lot_size,
      yearBuilt: row.year_built,
      parking: row.parking,
      features: row.features || [],
      images: row.images || [],
      status: row.status,
      agentId: row.agent_id,
      featured: row.featured,
      views: row.views,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(property).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'postalCode' ? 'postal_code' : 
                     key === 'propertyType' ? 'property_type' :
                     key === 'lotSize' ? 'lot_size' :
                     key === 'yearBuilt' ? 'year_built' :
                     key === 'agentId' ? 'agent_id' : key;
        
        if (key === 'features' || key === 'images') {
          updateFields.push(`${dbKey} = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${dbKey} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    });

    updateFields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    values.push(id);

    const query = `
      UPDATE properties 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      address: row.address,
      suburb: row.suburb,
      city: row.city,
      province: row.province,
      postalCode: row.postal_code,
      propertyType: row.property_type,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      area: row.area,
      lotSize: row.lot_size,
      yearBuilt: row.year_built,
      parking: row.parking,
      features: row.features || [],
      images: row.images || [],
      status: row.status,
      agentId: row.agent_id,
      featured: row.featured,
      views: row.views,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM properties WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async incrementPropertyViews(id: number): Promise<void> {
    await pool.query('UPDATE properties SET views = COALESCE(views, 0) + 1 WHERE id = $1', [id]);
  }

  async getAgents(): Promise<Agent[]> {
    const result = await pool.query('SELECT * FROM agents ORDER BY name');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      bio: row.bio,
      specialties: row.specialties || [],
      rating: row.rating,
      totalSales: row.total_sales,
      createdAt: row.created_at
    }));
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const result = await pool.query('SELECT * FROM agents WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      bio: row.bio,
      specialties: row.specialties || [],
      rating: row.rating,
      totalSales: row.total_sales,
      createdAt: row.created_at
    };
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const query = `
      INSERT INTO agents (name, email, phone, avatar, bio, specialties, rating, total_sales)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      agent.name,
      agent.email,
      agent.phone,
      agent.avatar,
      agent.bio,
      JSON.stringify(agent.specialties || []),
      agent.rating,
      agent.totalSales
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      bio: row.bio,
      specialties: row.specialties || [],
      rating: row.rating,
      totalSales: row.total_sales,
      createdAt: row.created_at
    };
  }

  async updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(agent).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'totalSales' ? 'total_sales' : key;
        
        if (key === 'specialties') {
          updateFields.push(`${dbKey} = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${dbKey} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    });

    values.push(id);

    const query = `
      UPDATE agents 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      bio: row.bio,
      specialties: row.specialties || [],
      rating: row.rating,
      totalSales: row.total_sales,
      createdAt: row.created_at
    };
  }

  async getLeads(filters?: {
    status?: string;
    agentId?: number;
    propertyId?: number;
    limit?: number;
    offset?: number;
  }): Promise<LeadWithProperty[]> {
    // Optimized query - select only needed columns and use ID-based ordering for better performance
    let query = `
      SELECT 
        l.id, l.name, l.email, l.phone, l.message, l.inquiry_type, 
        l.status, l.priority, l.property_id, l.agent_id, l.created_at,
        p.title as property_title,
        a.name as agent_name, a.avatar as agent_avatar
      FROM leads l
      LEFT JOIN properties p ON l.property_id = p.id
      LEFT JOIN agents a ON l.agent_id = a.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND l.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.agentId) {
      query += ` AND l.agent_id = $${paramIndex}`;
      params.push(filters.agentId);
      paramIndex++;
    }

    if (filters?.propertyId) {
      query += ` AND l.property_id = $${paramIndex}`;
      params.push(filters.propertyId);
      paramIndex++;
    }

    // Use ID-based ordering for better performance with indexes
    query += ` ORDER BY l.id DESC LIMIT $${paramIndex}`;
    params.push(filters?.limit || 20);
    paramIndex++;

    query += ` OFFSET $${paramIndex}`;
    params.push(filters?.offset || 0);

    console.log('Optimized leads query executing');
    const startTime = Date.now();
    const result = await pool.query(query, params);
    const queryTime = Date.now() - startTime;
    console.log(`Leads query completed in ${queryTime}ms, returned ${result.rows.length} results`);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      inquiryType: row.inquiry_type,
      status: row.status,
      priority: row.priority,
      propertyId: row.property_id,
      agentId: row.agent_id,
      createdAt: row.created_at,
      property: row.property_title ? {
        id: row.property_id,
        title: row.property_title,
        address: row.property_address || '',
        price: row.property_price || 0
      } : undefined,
      agent: row.agent_name ? {
        id: row.agent_id,
        name: row.agent_name,
        avatar: row.agent_avatar
      } : undefined
    }));
  }

  async getLead(id: number): Promise<LeadWithProperty | undefined> {
    const query = `
      SELECT 
        l.*,
        p.title as property_title,
        p.address as property_address,
        p.price as property_price,
        a.name as agent_name
      FROM leads l
      LEFT JOIN properties p ON l.property_id = p.id
      LEFT JOIN agents a ON l.agent_id = a.id
      WHERE l.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      inquiryType: row.inquiry_type,
      status: row.status,
      priority: row.priority,
      propertyId: row.property_id,
      agentId: row.agent_id,
      createdAt: row.created_at,
      property: row.property_title ? {
        id: row.property_id,
        title: row.property_title,
        address: row.property_address,
        price: row.property_price
      } : undefined,
      agent: row.agent_name ? {
        id: row.agent_id,
        name: row.agent_name
      } : undefined
    };
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const query = `
      INSERT INTO leads (name, email, phone, message, source, status, priority, property_id, agent_id, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      lead.name,
      lead.email,
      lead.phone,
      lead.message,
      lead.source || 'website',
      lead.status || 'new',
      lead.priority || 'medium',
      lead.propertyId || null,
      lead.agentId || null,
      lead.notes || null
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      propertyId: row.property_id,
      agentId: row.agent_id,
      source: row.source,
      status: row.status,
      priority: row.priority,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(lead).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'propertyId' ? 'property_id' :
                     key === 'agentId' ? 'agent_id' : key;
        
        updateFields.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) return undefined;

    values.push(id);

    const query = `
      UPDATE leads 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      propertyId: row.property_id,
      agentId: row.agent_id,
      source: row.source,
      status: row.status,
      priority: row.priority,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async getInquiries(leadId?: number): Promise<Inquiry[]> {
    let query = 'SELECT * FROM inquiries';
    const params: any[] = [];
    
    if (leadId) {
      query += ' WHERE lead_id = $1';
      params.push(leadId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      message: row.message,
      response: row.response,
      leadId: row.lead_id,
      createdAt: row.created_at
    }));
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const query = `
      INSERT INTO inquiries (type, message, response, lead_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      inquiry.type,
      inquiry.message,
      inquiry.response,
      inquiry.leadId
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      type: row.type,
      message: row.message,
      response: row.response,
      leadId: row.lead_id,
      createdAt: row.created_at
    };
  }

  async getStats(): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalLeads: number;
    newLeads: number;
    totalAgents: number;
    recentSales: number;
  }> {
    const queries = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM properties'),
      pool.query("SELECT COUNT(*) as count FROM properties WHERE status = 'active'"),
      pool.query('SELECT COUNT(*) as count FROM leads'),
      pool.query("SELECT COUNT(*) as count FROM leads WHERE status = 'new'"),
      pool.query('SELECT COUNT(*) as count FROM agents'),
      pool.query("SELECT COUNT(*) as count FROM properties WHERE status = 'sold' AND created_at >= NOW() - INTERVAL '30 days'")
    ]);

    return {
      totalProperties: parseInt(queries[0].rows[0].count),
      activeProperties: parseInt(queries[1].rows[0].count),
      totalLeads: parseInt(queries[2].rows[0].count),
      newLeads: parseInt(queries[3].rows[0].count),
      totalAgents: parseInt(queries[4].rows[0].count),
      recentSales: parseInt(queries[5].rows[0].count)
    };
  }
}

export const storage = new DatabaseStorage();