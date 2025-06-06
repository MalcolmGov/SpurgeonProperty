import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-simple";
import { 
  insertPropertySchema, 
  insertLeadSchema, 
  insertInquirySchema,
  insertAgentSchema 
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Image upload route
  app.post("/api/upload", upload.array('images', 10), (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const imageUrls = files.map(file => `/uploads/${file.filename}`);
      res.json({ 
        success: true,
        urls: imageUrls,
        message: `Successfully uploaded ${files.length} image(s)`
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to upload files. Please try again." 
      });
    }
  });

  // Open Graph image generator
  app.get("/api/og-image/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Generate SVG for Open Graph image
      const svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg)"/>
          <rect x="60" y="60" width="1080" height="510" fill="white" rx="12"/>
          
          <!-- Property Title -->
          <text x="120" y="140" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#1f2937">
            ${property.title.substring(0, 50)}${property.title.length > 50 ? '...' : ''}
          </text>
          
          <!-- Location -->
          <text x="120" y="200" font-family="Arial, sans-serif" font-size="28" fill="#6b7280">
            📍 ${property.suburb}, ${property.city}
          </text>
          
          <!-- Price -->
          <text x="120" y="260" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#059669">
            R${parseInt(property.price).toLocaleString('en-ZA')}
          </text>
          
          <!-- Property Details -->
          <text x="120" y="320" font-family="Arial, sans-serif" font-size="24" fill="#374151">
            🛏️ ${property.bedrooms} Beds  •  🛁 ${property.bathrooms} Baths  •  📐 ${property.area}sqm
          </text>
          
          <!-- Property Type -->
          <text x="120" y="380" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">
            ${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
          </text>
          
          <!-- Branding -->
          <text x="120" y="480" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#1e40af">
            Spurgeon Property
          </text>
          <text x="120" y="520" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">
            South Africa's Premier Real Estate Platform
          </text>
        </svg>
      `;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(svg);
    } catch (error) {
      console.error('OG Image generation error:', error);
      res.status(500).json({ message: "Failed to generate image" });
    }
  });

  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const {
        search,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        city,
        status,
        featured,
        limit = "20",
        offset = "0"
      } = req.query;

      const filters = {
        search: search as string,
        propertyType: propertyType as string,
        minPrice: minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms as string) : undefined,
        bathrooms: bathrooms ? parseFloat(bathrooms as string) : undefined,
        city: city as string,
        status: status as string,
        featured: featured === "true" ? true : featured === "false" ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/featured", async (req, res) => {
    try {
      const properties = await storage.getProperties({ featured: true, limit: 6 });
      res.json(properties);
    } catch (error) {
      console.error('Featured properties error:', error);
      res.status(500).json({ message: "Failed to fetch featured properties" });
    }
  });

  app.get("/api/properties/search", async (req, res) => {
    try {
      const { q: search } = req.query;
      const filters = { search: search as string, limit: 20 };
      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error('Property search error:', error);
      res.status(500).json({ message: "Failed to search properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // First try to get from database
      try {
        const property = await storage.getProperty(id);
        if (property) {
          await storage.incrementPropertyViews(id);
          return res.json(property);
        }
      } catch (dbError) {
        console.log('Database query failed, using direct query:', dbError);
      }

      // Fallback to direct database query
      const { db } = await import("./db");
      const { properties, agents } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const result = await db
        .select({
          properties: properties,
          agents: agents
        })
        .from(properties)
        .leftJoin(agents, eq(properties.agentId, agents.id))
        .where(eq(properties.id, id))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ message: "Property not found" });
      }

      const row = result[0];
      const property = {
        ...row.properties,
        agent: row.agents || undefined
      };

      res.json(property);
    } catch (error) {
      console.error('Property fetch error:', error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(id, validatedData);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProperty(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Agents routes
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAgent(id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  // Leads routes
  app.get("/api/leads", async (req, res) => {
    try {
      const { status, agentId, propertyId, limit = "50", offset = "0" } = req.query;
      
      const filters = {
        status: status as string,
        agentId: agentId ? parseInt(agentId as string) : undefined,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const leads = await storage.getLeads(filters);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(id, validatedData);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // Inquiries routes
  app.get("/api/inquiries", async (req, res) => {
    try {
      const { leadId } = req.query;
      const inquiries = await storage.getInquiries(
        leadId ? parseInt(leadId as string) : undefined
      );
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inquiry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  // Placeholder image endpoint
  app.get("/api/placeholder/:width/:height", (req, res) => {
    const width = parseInt(req.params.width) || 400;
    const height = parseInt(req.params.height) || 300;
    
    const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#F3F4F6"/>
      <path d="m${width * 0.4375} ${height * 0.4667} ${width * 0.125} ${height * 0.1667} ${width * 0.0625} -${height * 0.0833} ${width * 0.125} ${height * 0.1667}V${height * 0.6}H${width * 0.4375}V${height * 0.4667}Z" fill="#E5E7EB"/>
      <circle cx="${width * 0.45}" cy="${height * 0.4}" r="${width * 0.025}" fill="#E5E7EB"/>
      <text x="${width * 0.5}" y="${height * 0.517}" fill="#9B9B9B" font-family="sans-serif" font-size="14" text-anchor="middle">Property Image</text>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(svg);
  });

  // Analytics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
