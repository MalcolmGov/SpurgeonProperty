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

export class MemStorage implements IStorage {
  private properties: Map<number, Property> = new Map();
  private agents: Map<number, Agent> = new Map();
  private leads: Map<number, Lead> = new Map();
  private inquiries: Map<number, Inquiry> = new Map();
  private currentPropertyId = 1;
  private currentAgentId = 1;
  private currentLeadId = 1;
  private currentInquiryId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed agents
    const sampleAgents: InsertAgent[] = [
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@propertyhub.com",
        phone: "(555) 123-4567",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b830?w=400",
        bio: "Experienced luxury property specialist with 8+ years in Beverly Hills market.",
        specialties: ["Luxury Homes", "Beverly Hills", "Investment Properties"],
        rating: "4.9",
        totalSales: 125
      },
      {
        name: "Mike Chen",
        email: "mike.chen@propertyhub.com",
        phone: "(555) 234-5678",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        bio: "Commercial and residential expert specializing in modern properties.",
        specialties: ["Modern Homes", "Condos", "First-Time Buyers"],
        rating: "4.8",
        totalSales: 98
      },
      {
        name: "Emily Rodriguez",
        email: "emily.rodriguez@propertyhub.com",
        phone: "(555) 345-6789",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        bio: "Family home specialist helping clients find their perfect neighborhood.",
        specialties: ["Family Homes", "Suburban Properties", "School Districts"],
        rating: "4.9",
        totalSales: 87
      }
    ];

    sampleAgents.forEach(agent => this.createAgent(agent));

    // Seed properties
    const sampleProperties: InsertProperty[] = [
      {
        title: "Modern Family Estate",
        description: "Welcome to this stunning modern family estate located in the prestigious Beverly Hills neighborhood. This exquisite property features contemporary architecture with clean lines, floor-to-ceiling windows, and an open-concept design that seamlessly blends indoor and outdoor living.",
        price: "850000",
        address: "1234 Sunset Boulevard",
        city: "Beverly Hills",
        state: "CA",
        zipCode: "90210",
        propertyType: "house",
        bedrooms: 4,
        bathrooms: "3.0",
        area: 2800,
        lotSize: "0.25 acres",
        yearBuilt: 2019,
        parking: "2-car garage",
        features: ["Hardwood floors", "Gourmet kitchen", "Master suite", "Private pool", "Smart home"],
        images: [
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
          "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
        ],
        status: "active",
        agentId: 1,
        featured: true
      },
      {
        title: "Downtown Luxury Condo",
        description: "Sophisticated downtown living at its finest. This luxury condominium offers panoramic city views, premium finishes, and access to world-class amenities.",
        price: "425000",
        address: "567 Manhattan Avenue",
        city: "Manhattan",
        state: "NY",
        zipCode: "10001",
        propertyType: "condo",
        bedrooms: 2,
        bathrooms: "2.0",
        area: 1200,
        yearBuilt: 2021,
        parking: "Valet parking",
        features: ["City views", "Luxury finishes", "Concierge", "Gym access", "Rooftop terrace"],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
        ],
        status: "active",
        agentId: 2,
        featured: true
      },
      {
        title: "Cozy Family Home",
        description: "Perfect starter home in a family-friendly neighborhood. Features a spacious backyard, updated kitchen, and close proximity to top-rated schools.",
        price: "320000",
        address: "890 Oak Street",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        propertyType: "house",
        bedrooms: 3,
        bathrooms: "2.0",
        area: 1800,
        lotSize: "0.15 acres",
        yearBuilt: 2015,
        parking: "2-car driveway",
        features: ["Updated kitchen", "Spacious yard", "Near schools", "Move-in ready"],
        images: [
          "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800"
        ],
        status: "active",
        agentId: 3,
        featured: true
      },
      {
        title: "Modern Townhouse",
        description: "Contemporary townhouse with sleek design and premium amenities. Open floor plan with high ceilings and abundant natural light.",
        price: "675000",
        address: "456 West Hollywood Blvd",
        city: "West Hollywood",
        state: "CA",
        zipCode: "90069",
        propertyType: "house",
        bedrooms: 3,
        bathrooms: "2.5",
        area: 2100,
        yearBuilt: 2020,
        parking: "2-car garage",
        features: ["Open floor plan", "High ceilings", "Modern design", "Natural light"],
        images: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
        ],
        status: "active",
        agentId: 1
      }
    ];

    sampleProperties.forEach(property => this.createProperty(property));

    // Seed some leads
    const sampleLeads: InsertLead[] = [
      {
        name: "John Davis",
        email: "john.davis@email.com",
        phone: "(555) 987-6543",
        message: "Interested in the Modern Family Estate. Would like to schedule a viewing.",
        propertyId: 1,
        agentId: 1,
        status: "new",
        priority: "high"
      },
      {
        name: "Maria Garcia",
        email: "maria.garcia@email.com",
        phone: "(555) 876-5432",
        message: "Looking for a downtown condo with city views. Budget around $400-500k.",
        propertyId: 2,
        agentId: 2,
        status: "contacted",
        priority: "medium"
      }
    ];

    sampleLeads.forEach(lead => this.createLead(lead));
  }

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
    let filteredProperties = Array.from(this.properties.values());

    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredProperties = filteredProperties.filter(p => 
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.address.toLowerCase().includes(search) ||
          p.city.toLowerCase().includes(search)
        );
      }

      if (filters.propertyType) {
        filteredProperties = filteredProperties.filter(p => p.propertyType === filters.propertyType);
      }

      if (filters.minPrice !== undefined) {
        filteredProperties = filteredProperties.filter(p => parseFloat(p.price) >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        filteredProperties = filteredProperties.filter(p => parseFloat(p.price) <= filters.maxPrice!);
      }

      if (filters.bedrooms !== undefined) {
        filteredProperties = filteredProperties.filter(p => p.bedrooms >= filters.bedrooms!);
      }

      if (filters.bathrooms !== undefined) {
        filteredProperties = filteredProperties.filter(p => parseFloat(p.bathrooms) >= filters.bathrooms!);
      }

      if (filters.city) {
        filteredProperties = filteredProperties.filter(p => 
          p.city.toLowerCase() === filters.city!.toLowerCase()
        );
      }

      if (filters.status) {
        filteredProperties = filteredProperties.filter(p => p.status === filters.status);
      }

      if (filters.featured !== undefined) {
        filteredProperties = filteredProperties.filter(p => p.featured === filters.featured);
      }

      if (filters.offset) {
        filteredProperties = filteredProperties.slice(filters.offset);
      }

      if (filters.limit) {
        filteredProperties = filteredProperties.slice(0, filters.limit);
      }
    }

    // Add agent information
    return filteredProperties.map(property => ({
      ...property,
      agent: property.agentId ? this.agents.get(property.agentId) : undefined
    }));
  }

  async getProperty(id: number): Promise<PropertyWithAgent | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;

    return {
      ...property,
      agent: property.agentId ? this.agents.get(property.agentId) : undefined
    };
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const newProperty: Property = {
      ...property,
      id,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.properties.set(id, newProperty);
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined> {
    const existing = this.properties.get(id);
    if (!existing) return undefined;

    const updated: Property = {
      ...existing,
      ...property,
      updatedAt: new Date()
    };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  async incrementPropertyViews(id: number): Promise<void> {
    const property = this.properties.get(id);
    if (property) {
      property.views = (property.views || 0) + 1;
      this.properties.set(id, property);
    }
  }

  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const id = this.currentAgentId++;
    const newAgent: Agent = {
      ...agent,
      id,
      rating: agent.rating || "0",
      totalSales: agent.totalSales || 0,
      createdAt: new Date()
    };
    this.agents.set(id, newAgent);
    return newAgent;
  }

  async updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined> {
    const existing = this.agents.get(id);
    if (!existing) return undefined;

    const updated: Agent = {
      ...existing,
      ...agent
    };
    this.agents.set(id, updated);
    return updated;
  }

  async getLeads(filters?: {
    status?: string;
    agentId?: number;
    propertyId?: number;
    limit?: number;
    offset?: number;
  }): Promise<LeadWithProperty[]> {
    let filteredLeads = Array.from(this.leads.values());

    if (filters) {
      if (filters.status) {
        filteredLeads = filteredLeads.filter(l => l.status === filters.status);
      }
      if (filters.agentId) {
        filteredLeads = filteredLeads.filter(l => l.agentId === filters.agentId);
      }
      if (filters.propertyId) {
        filteredLeads = filteredLeads.filter(l => l.propertyId === filters.propertyId);
      }
      if (filters.offset) {
        filteredLeads = filteredLeads.slice(filters.offset);
      }
      if (filters.limit) {
        filteredLeads = filteredLeads.slice(0, filters.limit);
      }
    }

    return filteredLeads.map(lead => ({
      ...lead,
      property: lead.propertyId ? this.properties.get(lead.propertyId) : undefined,
      agent: lead.agentId ? this.agents.get(lead.agentId) : undefined
    }));
  }

  async getLead(id: number): Promise<LeadWithProperty | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;

    return {
      ...lead,
      property: lead.propertyId ? this.properties.get(lead.propertyId) : undefined,
      agent: lead.agentId ? this.agents.get(lead.agentId) : undefined
    };
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leads.set(id, newLead);
    return newLead;
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    const existing = this.leads.get(id);
    if (!existing) return undefined;

    const updated: Lead = {
      ...existing,
      ...lead,
      updatedAt: new Date()
    };
    this.leads.set(id, updated);
    return updated;
  }

  async getInquiries(leadId?: number): Promise<Inquiry[]> {
    let inquiries = Array.from(this.inquiries.values());
    if (leadId) {
      inquiries = inquiries.filter(i => i.leadId === leadId);
    }
    return inquiries;
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.currentInquiryId++;
    const newInquiry: Inquiry = {
      ...inquiry,
      id,
      createdAt: new Date()
    };
    this.inquiries.set(id, newInquiry);
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
    const allProperties = Array.from(this.properties.values());
    const allLeads = Array.from(this.leads.values());
    const allAgents = Array.from(this.agents.values());

    return {
      totalProperties: allProperties.length,
      activeProperties: allProperties.filter(p => p.status === "active").length,
      totalLeads: allLeads.length,
      newLeads: allLeads.filter(l => l.status === "new").length,
      totalAgents: allAgents.length,
      recentSales: allProperties.filter(p => p.status === "sold").length
    };
  }
}

export const storage = new MemStorage();
