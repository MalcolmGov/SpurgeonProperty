import type { Express } from "express";
import type { Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage-simple";
import { 
  insertPropertySchema, 
  insertLeadSchema, 
  insertInquirySchema,
  insertAgentSchema,
  insertAdminUserSchema,
  adminLoginSchema
} from "@shared/schema";
import { getNeighborhoodAnalytics, neighborhoodService } from "./neighborhood-service";
import { openaiService, type PropertyDetails } from "./openai-service";
import { anthropicService } from "./anthropic-service";
import { aiChatbotService } from "./ai-chatbot-service";
import { adminAuthService, requireAdminAuth, redirectIfAuthenticated } from "./admin-auth";
import { extractSpurgeonProperties } from "./spurgeon-extractor";
import { importSampleProperties } from "./sample-properties";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import AdmZip from "adm-zip";

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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for ZIP files
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = /\.(jpeg|jpg|png|gif|webp)$/i;
    const allowedZipTypes = /\.(zip)$/i;
    const extname = path.extname(file.originalname).toLowerCase();
    
    // Check for image files
    const isImage = allowedImageTypes.test(extname) && 
                   /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    
    // Check for ZIP files with multiple possible MIME types
    const isZip = allowedZipTypes.test(extname) && 
                 (file.mimetype === 'application/zip' || 
                  file.mimetype === 'application/x-zip-compressed' ||
                  file.mimetype === 'application/octet-stream');
    

    
    if (isImage || isZip) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) or ZIP files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());
  
  // Serve static uploaded files
  app.use('/uploads', express.static(uploadDir));



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
  app.post("/api/import-spurgeon-properties", async (req, res) => {
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

  // File upload endpoint for property images (supports ZIP files)
  app.post("/api/upload", upload.array('images', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No files uploaded" 
        });
      }

      const processedUrls: string[] = [];
      
      for (const file of files) {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (fileExtension === '.zip') {
          // Process ZIP file
          try {
            const zip = new AdmZip(file.path);
            const zipEntries = zip.getEntries();
            
            for (const entry of zipEntries) {
              if (!entry.isDirectory) {
                const entryExtension = path.extname(entry.entryName).toLowerCase();
                const allowedImageTypes = /\.(jpeg|jpg|png|gif|webp)$/;
                
                if (allowedImageTypes.test(entryExtension)) {
                  // Extract image from ZIP
                  const imageBuffer = entry.getData();
                  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                  const filename = `property-${uniqueSuffix}${entryExtension}`;
                  const imagePath = path.join(uploadDir, filename);
                  
                  // Write extracted image to uploads directory
                  fs.writeFileSync(imagePath, imageBuffer);
                  processedUrls.push(`/uploads/${filename}`);
                }
              }
            }
            
            // Clean up ZIP file
            fs.unlinkSync(file.path);
            
          } catch (zipError) {
            console.error("ZIP processing error:", zipError);
            // If ZIP processing fails, clean up and continue
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          }
        } else {
          // Regular image file
          processedUrls.push(`/uploads/${file.filename}`);
        }
      }
      
      if (processedUrls.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid images found in uploaded files"
        });
      }
      
      res.json({
        success: true,
        message: `Successfully processed ${processedUrls.length} image(s)`,
        urls: processedUrls
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload images",
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

  // Google Maps API powered routes
  app.get("/api/neighborhood/analytics", async (req, res) => {
    try {
      const { latitude, longitude, suburb, city } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      
      const analytics = await neighborhoodService.getNeighborhoodAnalytics(
        lat, 
        lng, 
        suburb as string || '', 
        city as string || ''
      );
      
      res.json(analytics);
    } catch (error) {
      console.error('Neighborhood analytics error:', error);
      res.status(500).json({ message: "Failed to fetch neighborhood analytics" });
    }
  });

  app.post("/api/geocode/address", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ message: "Address is required" });
      }
      
      const result = await neighborhoodService.geocodeAddress(address);
      
      if (!result) {
        return res.status(404).json({ message: "Address not found" });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({ message: "Failed to geocode address" });
    }
  });

  app.get("/api/geocode/reverse", async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      
      const result = await neighborhoodService.reverseGeocode(lat, lng);
      
      if (!result) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      res.status(500).json({ message: "Failed to reverse geocode location" });
    }
  });

  // Enhanced property creation with geocoding
  app.post("/api/properties/geocoded", async (req, res) => {
    try {
      const propertyData = req.body;
      
      // Auto-geocode if coordinates are missing
      if (!propertyData.latitude || !propertyData.longitude) {
        const fullAddress = `${propertyData.address}, ${propertyData.suburb}, ${propertyData.city}, ${propertyData.province}`;
        const geocodedResult = await neighborhoodService.geocodeAddress(fullAddress);
        
        if (geocodedResult) {
          propertyData.latitude = geocodedResult.latitude.toString();
          propertyData.longitude = geocodedResult.longitude.toString();
        }
      }
      
      const validatedData = insertPropertySchema.parse(propertyData);
      const property = await storage.createProperty(validatedData);
      
      res.status(201).json(property);
    } catch (error) {
      console.error('Geocoded property creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  // Neighborhood analytics route (legacy)
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

  // AI Chatbot Assistant endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, sessionId, userId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Invalid message format" });
      }

      const chatResponse = await aiChatbotService.processChat({
        message: message.trim(),
        sessionId,
        userId
      });

      res.json(chatResponse);
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ 
        response: "I'm experiencing some technical difficulties right now. Please try again in a moment.",
        intent: "error",
        sessionId: req.body.sessionId || "fallback",
        confidence: 0.1,
        suggestions: [
          "Find properties in my budget",
          "Tell me about neighborhoods", 
          "Calculate mortgage options",
          "What should I know about buying?"
        ]
      });
    }
  });

  // Chat session history endpoint
  app.get("/api/ai/chat/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const history = await aiChatbotService.getSessionHistory(sessionId);
      res.json(history);
    } catch (error) {
      console.error('Chat history error:', error);
      res.status(500).json({ 
        error: "Failed to fetch chat history",
        history: []
      });
    }
  });

  // Update user preferences endpoint
  app.put("/api/ai/chat/preferences/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const preferences = req.body;
      
      await aiChatbotService.updateUserPreferences(sessionId, preferences);
      res.json({ success: true });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ 
        error: "Failed to update preferences"
      });
    }
  });

  // Admin Authentication Routes
  app.post("/api/admin/register", async (req, res) => {
    try {
      const validatedData = insertAdminUserSchema.parse(req.body);
      
      // Check if email already exists
      const emailExists = await adminAuthService.emailExists(validatedData.email);
      if (emailExists) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const adminUser = await adminAuthService.registerAdmin(validatedData);
      
      // Remove sensitive data from response
      const { passwordHash, ...userResponse } = adminUser;
      res.status(201).json({ 
        message: "Admin user created successfully",
        user: userResponse 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", errors: error.errors });
      }
      if (error instanceof Error && error.message === "Email domain not authorized for admin access") {
        return res.status(403).json({ 
          message: "Not Authorized to access the portal" 
        });
      }
      console.error('Admin registration error:', error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const validatedData = adminLoginSchema.parse(req.body);
      
      const loginResult = await adminAuthService.loginAdmin(validatedData);
      if (!loginResult) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const { user, sessionId } = loginResult;
      
      // Set session cookie
      res.cookie('adminSession', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Remove sensitive data from response
      const { passwordHash, ...userResponse } = user;
      res.json({ 
        message: "Login successful",
        user: userResponse 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      if (error instanceof Error && error.message === "Email domain not authorized for admin access") {
        return res.status(403).json({ 
          message: "Not Authorized to access the portal" 
        });
      }
      console.error('Admin login error:', error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/admin/logout", requireAdminAuth, async (req, res) => {
    try {
      const sessionId = req.cookies?.adminSession;
      if (sessionId) {
        await adminAuthService.logout(sessionId);
      }
      
      res.clearCookie('adminSession');
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  app.get("/api/admin/me", requireAdminAuth, async (req, res) => {
    try {
      const user = (req as any).adminUser;
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error('Admin user fetch error:', error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Property import endpoint
  app.post("/api/admin/import-properties", requireAdminAuth, async (req, res) => {
    try {
      console.log('Starting property import...');
      const result = await importSampleProperties();
      
      if (result.success) {
        res.json({ 
          message: `Successfully imported ${result.count} properties`,
          count: result.count
        });
      } else {
        res.status(500).json({ 
          message: result.message || "Failed to import properties"
        });
      }
    } catch (error) {
      console.error('Property import error:', error);
      res.status(500).json({ 
        message: "Failed to import properties",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Protected Admin Routes (require authentication)
  app.get("/api/admin/dashboard/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
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
