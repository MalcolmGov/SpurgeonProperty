import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage-working";
import { 
  insertPropertySchema, 
  insertLeadSchema, 
  insertInquirySchema,
  insertAgentSchema 
} from "@shared/schema";
import { getNeighborhoodAnalytics } from "./neighborhood-service";
import { openaiService, type PropertyDetails } from "./openai-service";
import { anthropicService } from "./anthropic-service";
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

  // Import authentic Spurgeon Property listings
  app.post("/api/import-spurgeon-properties", async (req: Request, res: Response) => {
    try {
      const { importSpurgeonProperties } = await import('./property-data-importer');
      console.log('Importing authentic Spurgeon Property listings...');
      
      const result = await importSpurgeonProperties();
      
      res.json({
        success: result.success,
        message: result.message,
        propertiesImported: result.count
      });
    } catch (error) {
      console.error("Property import error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to import properties",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Increment view count
      await storage.incrementPropertyViews(id);
      
      res.json(property);
    } catch (error) {
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
      
      // Broadcast to all connected admin clients via WebSocket
      const wss = ((req.app as any).httpServer as any).wss;
      if (wss) {
        const notification = {
          type: 'NEW_LEAD',
          data: lead,
          message: `New ${validatedData.source || 'property inquiry'} lead from ${validatedData.name}`,
          timestamp: new Date().toISOString(),
          priority: validatedData.priority || 'medium'
        };
        
        wss.clients.forEach((client: any) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
          }
        });
      }
      
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

  // Neighborhood analytics route
  app.get("/api/neighborhood-analytics", getNeighborhoodAnalytics);

  // AI Property Description Generator routes
  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const propertyDetails: PropertyDetails = req.body;
      
      // Validate required fields
      if (!propertyDetails.propertyType || !propertyDetails.address || !propertyDetails.suburb || !propertyDetails.city || !propertyDetails.province) {
        return res.status(400).json({ message: "Missing required property details" });
      }

      const generatedContent = await openaiService.generatePropertyDescription(propertyDetails);
      res.json(generatedContent);
    } catch (error) {
      console.error("Error generating property description:", error);
      res.status(500).json({ message: "Failed to generate property description" });
    }
  });

  app.post("/api/ai/enhance-description", async (req, res) => {
    try {
      const { description, propertyDetails } = req.body;
      
      if (!description || !propertyDetails) {
        return res.status(400).json({ message: "Missing description or property details" });
      }

      const enhancedDescription = await openaiService.enhancePropertyDescription(description, propertyDetails);
      res.json({ description: enhancedDescription });
    } catch (error) {
      console.error("Error enhancing property description:", error);
      res.status(500).json({ message: "Failed to enhance property description" });
    }
  });

  app.post("/api/ai/generate-marketing", async (req, res) => {
    try {
      const propertyDetails: PropertyDetails = req.body;
      
      if (!propertyDetails.propertyType || !propertyDetails.suburb || !propertyDetails.city) {
        return res.status(400).json({ message: "Missing required property details for marketing content" });
      }

      const marketingContent = await openaiService.generateMarketingContent(propertyDetails);
      res.json(marketingContent);
    } catch (error) {
      console.error("Error generating marketing content:", error);
      res.status(500).json({ message: "Failed to generate marketing content" });
    }
  });

  // AI Chat Assistant endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context, conversationHistory } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Invalid message format" });
      }

      const chatResponse = await anthropicService.processChat({
        message: message.trim(),
        context,
        conversationHistory
      });

      res.json(chatResponse);
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ 
        response: "I'm experiencing some technical difficulties right now. Please try again in a moment.",
        intent: "error",
        suggestions: [
          "Find properties in my budget",
          "Tell me about neighborhoods", 
          "Calculate mortgage options",
          "What should I know about buying?"
        ]
      });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Admin client connected to WebSocket');
    
    ws.on('close', () => {
      console.log('Admin client disconnected from WebSocket');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Store WebSocket server reference for broadcasting
  (httpServer as any).wss = wss;
  
  return httpServer;
}
