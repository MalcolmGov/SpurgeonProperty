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
  adminLoginSchema,
  agentLoginSchema,
  agentRegistrationSchema
} from "@shared/schema";
import { getNeighborhoodAnalytics, neighborhoodService } from "./neighborhood-service";
import { openaiService, type PropertyDetails } from "./openai-service";
import { anthropicService } from "./anthropic-service";
import { aiChatbotService } from "./ai-chatbot-service";
import { adminAuthService, requireAdminAuth, redirectIfAuthenticated } from "./admin-auth";
import { agentAuthService, requireAgentAuth } from "./agent-auth";
import { extractSpurgeonProperties } from "./spurgeon-extractor";
import { importSampleProperties } from "./sample-properties";
import { emailService } from "./email-service";
import { socialAdGenerator } from "./social-ad-generator";
import { registerMonitoringRoutes } from "./routes/admin-monitoring";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import AdmZip from "adm-zip";
import { spawn } from "child_process";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djmjg0eox',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log("Cloudinary configured:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djmjg0eox',
  api_key_set: !!process.env.CLOUDINARY_API_KEY,
  api_secret_set: !!process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads (now using memory storage for Object Storage)
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for video files
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = /\.(jpeg|jpg|png|gif|webp)$/i;
    const allowedVideoTypes = /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i;
    const allowedZipTypes = /\.(zip)$/i;
    const extname = path.extname(file.originalname).toLowerCase();
    
    // Check for image files
    const isImage = allowedImageTypes.test(extname) && 
                   /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    
    // Check for video files
    const isVideo = allowedVideoTypes.test(extname) && 
                   /^video\/(mp4|avi|quicktime|x-msvideo|x-flv|webm|x-matroska)$/i.test(file.mimetype);
    
    // Check for ZIP files - simplified to only check file extension
    const isZip = allowedZipTypes.test(extname);
    
    if (isImage || isVideo || isZip) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP), video files (MP4, AVI, MOV, WMV, FLV, WebM, MKV) or ZIP files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());
  
  // Serve static uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const result = await emailService.testEmailConnection();
      if (result.success) {
        res.json({ 
          success: true, 
          message: `Test email sent successfully via ${result.provider}`,
          provider: result.provider
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: `Email test failed: ${result.error}`,
          provider: result.provider
        });
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Unknown error testing email'
      });
    }
  });

  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const {
        search,
        propertyType,
        listingType,
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
        propertyType: (propertyType && propertyType !== "all") ? propertyType as string : undefined,
        listingType: (listingType && listingType !== "all") ? listingType as string : undefined,
        minPrice: minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms as string) : undefined,
        bathrooms: bathrooms ? parseFloat(bathrooms as string) : undefined,
        city: (city && city !== "all") ? city as string : undefined,
        status: (status && status !== "all") ? status as string : undefined,
        featured: featured === "true" ? true : featured === "false" ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      console.log('Properties API filters:', filters);
      const properties = await storage.getProperties(filters);
      console.log(`Properties API returned ${properties.length} results for listingType: ${filters.listingType}`);
      res.json(properties);
    } catch (error) {
      console.error('Properties API error:', error);
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
  app.post("/api/upload", upload.any(), async (req, res) => {
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
            // Verify the ZIP file exists and is readable
            if (!fs.existsSync(file.path)) {
              console.error("ZIP file not found:", file.path);
              continue;
            }
            
            const fileStats = fs.statSync(file.path);
            if (fileStats.size === 0) {
              console.error("ZIP file is empty:", file.path);
              continue;
            }
            
            // Try to read the ZIP file
            const zipBuffer = fs.readFileSync(file.path);
            const zip = new AdmZip(zipBuffer);
            const zipEntries = zip.getEntries();
            
            if (zipEntries.length === 0) {
              console.error("ZIP file contains no entries");
              continue;
            }
            
            for (const entry of zipEntries) {
              if (!entry.isDirectory) {
                const entryExtension = path.extname(entry.entryName).toLowerCase();
                const allowedImageTypes = /\.(jpeg|jpg|png|gif|webp)$/;
                
                if (allowedImageTypes.test(entryExtension)) {
                  try {
                    // Extract image from ZIP
                    const imageBuffer = entry.getData();
                    if (imageBuffer && imageBuffer.length > 0) {
                      try {
                        // Upload to Cloudinary
                        const uploadResult = await new Promise<any>((resolve, reject) => {
                          cloudinary.uploader.upload_stream(
                            {
                              folder: 'spurgeon-properties',
                              resource_type: 'image'
                            },
                            (error, result) => {
                              if (error) reject(error);
                              else resolve(result);
                            }
                          ).end(imageBuffer);
                        });
                        
                        processedUrls.push(uploadResult.secure_url);
                        console.log("Uploaded to Cloudinary:", uploadResult.secure_url);
                      } catch (cloudinaryError) {
                        console.error("Cloudinary upload failed, using local fallback:", cloudinaryError);
                        // Fallback to local filesystem
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                        const filename = `property-${uniqueSuffix}${entryExtension}`;
                        const imagePath = path.join(uploadDir, filename);
                        fs.writeFileSync(imagePath, imageBuffer);
                        processedUrls.push(`/uploads/${filename}`);
                      }
                    }
                  } catch (extractError) {
                    console.error("Error extracting file:", entry.entryName, extractError);
                  }
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
        } else if (file.mimetype.startsWith('image/')) {
          // Upload image to Cloudinary
          try {
            const uploadResult = await cloudinary.uploader.upload(file.path, {
              folder: 'spurgeon-properties',
              resource_type: 'image'
            });
            processedUrls.push(uploadResult.secure_url);
            console.log("Uploaded image to Cloudinary:", uploadResult.secure_url);
            // Clean up temp file
            fs.unlinkSync(file.path);
          } catch (cloudinaryError) {
            console.error("Cloudinary upload failed, using local fallback:", cloudinaryError);
            processedUrls.push(`/uploads/${file.filename}`);
          }
        } else if (file.mimetype.startsWith('video/')) {
          // Upload video to Cloudinary
          try {
            const uploadResult = await cloudinary.uploader.upload(file.path, {
              folder: 'spurgeon-properties',
              resource_type: 'video'
            });
            processedUrls.push(uploadResult.secure_url);
            console.log("Uploaded video to Cloudinary:", uploadResult.secure_url);
            // Clean up temp file
            fs.unlinkSync(file.path);
          } catch (cloudinaryError) {
            console.error("Cloudinary upload failed, using local fallback:", cloudinaryError);
            processedUrls.push(`/uploads/${file.filename}`);
          }
        }
      }
      
      
      if (processedUrls.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid images found in uploaded files"
        });
      }
      
      // Separate images and videos
      const imageUrls = processedUrls.filter(url => {
        const ext = path.extname(url).toLowerCase();
        return /\.(jpeg|jpg|png|gif|webp)$/i.test(ext);
      });
      
      const videoUrls = processedUrls.filter(url => {
        const ext = path.extname(url).toLowerCase();
        return /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(ext);
      });

      res.json({
        success: true,
        message: `Successfully processed ${imageUrls.length} image(s) and ${videoUrls.length} video(s)`,
        imageUrls,
        videoUrls,
        urls: processedUrls // Keep backward compatibility
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload files",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Serve images from Object Storage
  app.get("/storage/:filename", async (req, res) => {
    const storage = await getObjectStorage();
    if (!storage) {
      return res.status(503).json({ error: 'Object Storage not available' });
    }
    
    try {
      const { filename } = req.params;
      const result = await storage.downloadAsBytes(filename);
      
      if (result.ok) {
        // Determine content type based on file extension
        const ext = path.extname(filename).toLowerCase();
        const contentTypeMap: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.mp4': 'video/mp4',
          '.avi': 'video/x-msvideo',
          '.mov': 'video/quicktime',
          '.webm': 'video/webm'
        };
        
        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.send(Buffer.from(result.value));
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error) {
      console.error("Error serving file from Object Storage:", error);
      res.status(500).json({ error: 'Failed to retrieve file' });
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
      console.log('Creating property with data:', JSON.stringify(req.body, null, 2));
      console.log('Images in request:', req.body.images);
      
      // Set default price to "POA" if empty or not provided
      if (!req.body.price || req.body.price.trim() === '') {
        req.body.price = 'POA';
      }
      
      const validatedData = insertPropertySchema.parse(req.body);
      console.log('Validated data images:', validatedData.images);
      
      const property = await storage.createProperty(validatedData);
      console.log('Created property with images:', property.images);
      
      res.status(201).json(property);
    } catch (error) {
      console.error('Property creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Updating property ${id} with data:`, JSON.stringify(req.body, null, 2));
      console.log(`Images being updated for property ${id}:`, req.body.images);
      
      // Set default price to "POA" if empty or not provided during update
      if (req.body.price !== undefined && (!req.body.price || req.body.price.trim() === '')) {
        req.body.price = 'POA';
      }
      
      const validatedData = insertPropertySchema.partial().parse(req.body);
      console.log(`Validated update data for property ${id}:`, validatedData.images);
      
      const property = await storage.updateProperty(id, validatedData);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      console.log(`Updated property ${id} with images:`, property.images);
      res.json(property);
    } catch (error) {
      console.error(`Property ${req.params.id} update error:`, error);
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

  // Leads routes - optimized for performance
  app.get("/api/leads", async (req, res) => {
    try {
      const { status, agentId, propertyId, limit = "20", offset = "0" } = req.query;
      
      const filters = {
        status: status as string,
        agentId: agentId ? parseInt(agentId as string) : undefined,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        limit: Math.min(parseInt(limit as string), 50), // Cap at 50 for performance
        offset: parseInt(offset as string)
      };

      console.log('Leads API request with filters:', filters);
      const startTime = Date.now();
      const leads = await storage.getLeads(filters);
      const totalTime = Date.now() - startTime;
      console.log(`Leads API completed in ${totalTime}ms, returned ${leads.length} results`);
      
      res.json(leads);
    } catch (error) {
      console.error('Leads API error:', error);
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
      
      // Get property and agent details for email notifications
      let propertyTitle: string | undefined;
      let agentName: string | undefined;
      let agentEmail: string | undefined;
      let propertyImage: string | undefined;
      
      if (validatedData.propertyId) {
        try {
          const property = await storage.getProperty(validatedData.propertyId);
          if (property) {
            propertyTitle = property.title;
            // Get the first image from the property's images array
            if (property.images && property.images.length > 0) {
              propertyImage = property.images[0];
              // Ensure full URL for email display - use Replit domain for external access
              if (propertyImage && !propertyImage.startsWith('http')) {
                // Use the Replit domain for external email access
                const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
                if (replitDomain) {
                  propertyImage = `https://${replitDomain}${propertyImage}`;
                } else {
                  // Fallback to request host
                  propertyImage = `${req.protocol}://${req.get('host')}${propertyImage}`;
                }
              }

            }
            if (property.agentId) {
              const agent = await storage.getAgent(property.agentId);
              if (agent) {
                agentName = agent.name;
                agentEmail = agent.email;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching property/agent details:', error);
        }
      }
      
      // Send email notifications
      try {
        await emailService.sendLeadNotification({
          type: 'NEW_LEAD',
          leadName: validatedData.name,
          leadEmail: validatedData.email,
          leadPhone: validatedData.phone || undefined,
          propertyTitle,
          message: validatedData.message || undefined,
          source: validatedData.source || undefined,
          agentName,
          agentEmail,
          propertyId: validatedData.propertyId || undefined,
          propertyImage
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the lead creation if email fails
      }
      
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

  // Email test endpoint
  app.post("/api/admin/test-email", requireAdminAuth, async (req, res) => {
    try {
      const testNotification = {
        type: 'NEW_LEAD' as const,
        leadName: 'Test Lead',
        leadEmail: 'test@example.com',
        leadPhone: '+27 12 345 6789',
        propertyTitle: 'Test Property',
        message: 'This is a test email notification from the Spurgeon Property system.',
        source: 'Admin Test',
        agentName: 'Test Agent',
        agentEmail: 'agent@example.com'
      };

      const success = await emailService.sendLeadNotification(testNotification);
      
      if (success) {
        res.json({ message: 'Test email sent successfully' });
      } else {
        res.status(500).json({ message: 'Email service not configured or failed to send' });
      }
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ message: 'Failed to send test email' });
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

  // Agent management routes (admin protected)
  app.get("/api/admin/agents", requireAdminAuth, async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.post("/api/admin/agents", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = agentRegistrationSchema.parse(req.body);
      
      // Check if email already exists
      const emailExists = await agentAuthService.emailExists(validatedData.email);
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const agent = await agentAuthService.registerAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      console.error("Error creating agent:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  app.put("/api/admin/agents/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log('Updating agent ID:', id);
      console.log('Request body:', req.body);
      
      const validatedData = agentRegistrationSchema.partial().parse(req.body);
      console.log('Validated data:', validatedData);
      
      const agent = await agentAuthService.updateAgent(id, validatedData);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      console.log('Agent updated successfully:', agent);
      res.json(agent);
    } catch (error) {
      console.error("Error updating agent:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update agent" });
    }
  });

  app.delete("/api/admin/agents/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAgent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // Agent authentication routes
  app.post("/api/agent/login", async (req, res) => {
    try {
      const validatedData = agentLoginSchema.parse(req.body);
      const result = await agentAuthService.loginAgent(validatedData);
      
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session cookie
      res.cookie('agent_session', result.sessionId, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ agent: result.agent, sessionId: result.sessionId });
    } catch (error) {
      console.error("Error logging in agent:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/agent/logout", requireAgentAuth, async (req: any, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.agent_session;
      if (sessionId) {
        await agentAuthService.logout(sessionId);
      }
      res.clearCookie('agent_session');
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error logging out agent:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  app.get("/api/agent/profile", requireAgentAuth, async (req: any, res) => {
    try {
      res.json(req.agent);
    } catch (error) {
      console.error("Error fetching agent profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Agent enquiry management
  app.get("/api/agent/enquiries", requireAgentAuth, async (req: any, res) => {
    try {
      const agentId = req.agent.id;
      const enquiries = await storage.getAgentEnquiries(agentId);
      res.json(enquiries);
    } catch (error) {
      console.error("Error fetching agent enquiries:", error);
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });

  // Admin route to get enquiries for specific agent
  app.get("/api/agent/enquiries/:agentId", requireAdminAuth, async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      const enquiries = await storage.getAgentEnquiries(agentId);
      res.json(enquiries);
    } catch (error) {
      console.error("Error fetching agent enquiries:", error);
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });

  app.put("/api/agent/enquiries/:id/respond", requireAgentAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { response, status } = req.body;
      
      const enquiry = await storage.updateEnquiryResponse(id, {
        agentResponse: response,
        status: status || 'responded',
        respondedAt: new Date()
      });

      if (!enquiry) {
        return res.status(404).json({ message: "Enquiry not found" });
      }

      res.json(enquiry);
    } catch (error) {
      console.error("Error responding to enquiry:", error);
      res.status(500).json({ message: "Failed to respond to enquiry" });
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
      
      // Set default price to "POA" if empty or not provided
      if (!propertyData.price || propertyData.price.trim() === '') {
        propertyData.price = 'POA';
      }
      
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
      console.log('Admin registration attempt:', { 
        email: req.body.email, 
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role 
      });
      
      const validatedData = insertAdminUserSchema.parse(req.body);
      console.log('Validation passed for:', validatedData.email);
      
      // Check if email is authorized (debug logging)
      const isAuthorized = adminAuthService.isAuthorizedEmail(validatedData.email);
      console.log('Email authorization check:', { 
        email: validatedData.email, 
        isAuthorized 
      });
      
      if (!isAuthorized) {
        console.log('Registration rejected: Email not authorized');
        return res.status(403).json({ 
          message: "Email not authorized for admin access. Contact system administrator." 
        });
      }
      
      // Check if email already exists
      const emailExists = await adminAuthService.emailExists(validatedData.email);
      console.log('Email exists check:', { 
        email: validatedData.email, 
        exists: emailExists 
      });
      
      if (emailExists) {
        console.log('Registration rejected: Email already exists');
        return res.status(400).json({ message: "Email already registered" });
      }
      
      console.log('Proceeding with admin user creation...');
      const adminUser = await adminAuthService.registerAdmin(validatedData);
      console.log('Admin user created successfully:', { 
        id: adminUser.id, 
        email: adminUser.email 
      });
      
      // Remove sensitive data from response
      const { passwordHash, ...userResponse } = adminUser;
      res.status(201).json({ 
        message: "Admin user created successfully",
        user: userResponse 
      });
    } catch (error) {
      console.error('Admin registration error details:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        requestBody: req.body
      });
      
      if (error instanceof z.ZodError) {
        console.log('Zod validation errors:', error.errors);
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: error.errors,
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        });
      }
      if (error instanceof Error && error.message === "Email domain not authorized for admin access") {
        return res.status(403).json({ 
          message: "Email not authorized for admin access. Contact system administrator." 
        });
      }
      res.status(500).json({ 
        message: "Failed to create admin user",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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

  // Social Media Ad Generation
  app.post("/api/properties/:id/social-ad", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const { platform, size, style } = req.body;

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const adConfig = {
        platform: platform || 'facebook',
        size: size || 'square',
        style: style || 'modern'
      };

      const generatedAd = await socialAdGenerator.generatePropertyAd(property, adConfig);
      
      res.json(generatedAd);
    } catch (error) {
      console.error("Social ad generation error:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Provide helpful error message for quota issues
      if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        return res.status(200).json({
          error: "OpenAI API quota exceeded. Please check your OpenAI billing details.",
          demo: true,
          suggestion: "Add more credits to your OpenAI account to generate AI-powered ads."
        });
      }
      
      res.status(500).json({ 
        error: "Failed to generate social media ad",
        details: errorMessage 
      });
    }
  });

  // Generate hashtag suggestions
  app.get("/api/properties/:id/hashtags", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      const hashtags = socialAdGenerator.generateHashtagSuggestions(property);
      res.json({ hashtags });
    } catch (error) {
      console.error("Hashtag generation error:", error);
      res.status(500).json({ error: "Failed to generate hashtags" });
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

  // Python PDF Generation Endpoints
  
  // Create temp directory for PDF generation
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Generate property catalogue (HTML or Python PDF)
  app.post('/api/properties/catalogue', async (req, res) => {
    try {
      const { propertyIds, title = 'Property Catalogue', clientName, format = 'html' } = req.body;
      
      if (!propertyIds || !Array.isArray(propertyIds)) {
        return res.status(400).json({ error: 'Property IDs required' });
      }

      // Fetch properties
      const properties = await Promise.all(
        propertyIds.map((id: number) => storage.getProperty(id))
      );

      const validProperties = properties.filter(p => p !== null);
      
      if (validProperties.length === 0) {
        return res.status(404).json({ error: 'No valid properties found' });
      }

      // Handle Python PDF generation
      if (format === 'python-pdf') {
        // Generate PDF in uploads directory so it can be served as static file
        const uploadsDir = path.join(process.cwd(), 'uploads');
        const filename = `catalogue_${Date.now()}_professional.pdf`;
        const outputPath = path.join(uploadsDir, filename);
        
        console.log(`Generating Python catalogue PDF to: ${outputPath}`);
        
        const success = await generatePythonCataloguePDF(validProperties, outputPath, title, clientName);
        console.log(`Python PDF generation success: ${success}`);

        if (success && fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          console.log(`Generated PDF file size: ${stats.size} bytes`);
          
          if (stats.size === 0) {
            console.error('Generated PDF file is empty');
            res.status(500).json({ error: 'Generated PDF file is empty' });
            return;
          }
          
          // Return the file URL for download instead of streaming
          const fileUrl = `/uploads/${filename}`;
          res.json({ 
            success: true,
            message: 'Professional PDF catalogue generated successfully',
            downloadUrl: fileUrl,
            filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_professional.pdf`
          });
          
          // Schedule cleanup after 5 minutes
          setTimeout(() => {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
              console.log(`Cleaned up PDF file: ${filename}`);
            }
          }, 5 * 60 * 1000);
          
          return;
        } else {
          console.error(`PDF generation failed or file does not exist at: ${outputPath}`);
          res.status(500).json({ error: 'Failed to generate professional PDF catalogue' });
          return;
        }
      }

      // Default HTML response (for backward compatibility)
      res.status(200).json({ 
        message: 'Catalogue endpoint working', 
        properties: validProperties.length,
        format: format
      });
    } catch (error) {
      console.error('Error generating property catalogue:', error);
      res.status(500).json({ error: 'Failed to generate catalogue' });
    }
  });

  // Optimized Catalogue Generation API
  app.post('/api/properties/optimized-catalogue', async (req, res) => {
    try {
      const { propertyIds, title = 'Premium Property Catalogue', clientName = 'Valued Client' } = req.body;
      
      if (!propertyIds || !Array.isArray(propertyIds)) {
        return res.status(400).json({ error: 'Property IDs required' });
      }

      // Fetch properties with enhanced data processing
      const properties = await Promise.all(
        propertyIds.map(async (id: number) => {
          const property = await storage.getProperty(id);
          if (property) {
            // Process and enhance property data
            return {
              ...property,
              images: typeof property.images === 'string' ? JSON.parse(property.images || '[]') : (property.images || []),
              features: typeof property.features === 'string' ? JSON.parse(property.features || '[]') : (property.features || []),
              agent: {
                id: 9,
                name: "Peter Spurgeon",
                title: "Principal Real Estate Agent",
                phone: "084 208 9307",
                email: "Peter@spurgeonproperty.com",
                rating: 4.9
              }
            };
          }
          return null;
        })
      );

      const validProperties = properties.filter(p => p !== null);
      
      if (validProperties.length === 0) {
        return res.status(404).json({ error: 'No valid properties found' });
      }

      // Generate optimized catalogue
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const filename = `optimized_catalogue_${Date.now()}.pdf`;
      const outputPath = path.join(uploadsDir, filename);
      
      console.log(`Generating Optimized Catalogue PDF to: ${outputPath}`);
      
      const success = await generateOptimizedCatalogue(validProperties, outputPath, title, clientName);

      if (success && fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        
        if (stats.size === 0) {
          res.status(500).json({ error: 'Generated catalogue is empty' });
          return;
        }
        
        const fileUrl = `/uploads/${filename}`;
        res.json({ 
          success: true,
          message: 'Optimized property catalogue generated successfully',
          downloadUrl: fileUrl,
          filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_optimized.pdf`,
          propertyCount: validProperties.length,
          features: [
            'Professional cover page with Peter Spurgeon contact info',
            'Comprehensive table of contents',
            'Individual property pages with enhanced layouts',
            'High-quality image optimization',
            'Consistent branding throughout',
            'Contact information on every page'
          ]
        });
        
        // Cleanup after 15 minutes
        setTimeout(() => {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log(`Cleaned up optimized catalogue: ${filename}`);
          }
        }, 15 * 60 * 1000);
        
        return;
      } else {
        res.status(500).json({ error: 'Failed to generate optimized catalogue' });
        return;
      }
    } catch (error) {
      console.error('Error generating optimized catalogue:', error);
      res.status(500).json({ error: 'Failed to generate optimized catalogue' });
    }
  });

  // Enhanced PDF Generation with Peter Spurgeon Contact Info
  app.post('/api/properties/enhanced-pdf', async (req, res) => {
    try {
      const { propertyIds, title = 'Premium Property Showcase', clientName = 'Valued Client' } = req.body;
      
      if (!propertyIds || !Array.isArray(propertyIds)) {
        return res.status(400).json({ error: 'Property IDs required' });
      }

      // Fetch properties with agent information
      const properties = await Promise.all(
        propertyIds.map(async (id: number) => {
          const property = await storage.getProperty(id);
          if (property) {
            // Ensure Peter Spurgeon is set as the agent
            const enhancedProperty = {
              ...property,
              agent: {
                id: 9,
                name: "Peter Spurgeon",
                title: "Principal Real Estate Agent", 
                phone: "084 208 9307",
                email: "Peter@spurgeonproperty.com",
                rating: 4.9,
                avatar: null
              }
            };
            return enhancedProperty;
          }
          return null;
        })
      );

      const validProperties = properties.filter(p => p !== null);
      
      if (validProperties.length === 0) {
        return res.status(404).json({ error: 'No valid properties found' });
      }

      // Generate enhanced PDF in uploads directory
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const filename = `enhanced_catalogue_${Date.now()}.pdf`;
      const outputPath = path.join(uploadsDir, filename);
      
      console.log(`Generating Enhanced PDF with Peter Spurgeon contact info to: ${outputPath}`);
      
      const success = await generateEnhancedPDF(validProperties, outputPath, title, clientName);
      console.log(`Enhanced PDF generation success: ${success}`);

      if (success && fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`Generated Enhanced PDF file size: ${stats.size} bytes`);
        
        if (stats.size === 0) {
          console.error('Generated Enhanced PDF file is empty');
          res.status(500).json({ error: 'Generated Enhanced PDF file is empty' });
          return;
        }
        
        // Return the file URL for download
        const fileUrl = `/uploads/${filename}`;
        res.json({ 
          success: true,
          message: 'Enhanced PDF with Peter Spurgeon contact info generated successfully',
          downloadUrl: fileUrl,
          filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_enhanced.pdf`,
          contactInfo: {
            agent: "Peter Spurgeon",
            phone: "084 208 9307",
            email: "Peter@spurgeonproperty.com",
            website: "www.spurgeonproperty.com"
          }
        });
        
        // Schedule cleanup after 10 minutes
        setTimeout(() => {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log(`Cleaned up Enhanced PDF file: ${filename}`);
          }
        }, 10 * 60 * 1000);
        
        return;
      } else {
        console.error(`Enhanced PDF generation failed or file does not exist at: ${outputPath}`);
        res.status(500).json({ error: 'Failed to generate Enhanced PDF' });
        return;
      }
    } catch (error) {
      console.error('Error generating Enhanced PDF:', error);
      res.status(500).json({ error: 'Failed to generate Enhanced PDF' });
    }
  });

  // Helper function to generate Optimized Catalogue
  async function generateOptimizedCatalogue(properties: any[], outputPath: string, title: string, clientName?: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const catalogueData = {
          properties: properties.map(prop => ({
            ...prop,
            images: typeof prop.images === 'string' ? JSON.parse(prop.images || '[]') : (prop.images || []),
            features: typeof prop.features === 'string' ? JSON.parse(prop.features || '[]') : (prop.features || []),
          })),
          clientName: clientName || 'Valued Client',
          catalogueTitle: title || 'Premium Property Catalogue'
        };

        const tempDataPath = path.join(tempDir, `optimized_data_${Date.now()}.json`);
        fs.writeFileSync(tempDataPath, JSON.stringify(catalogueData, null, 2));
        
        const pythonScript = path.join(process.cwd(), 'optimized_catalogue_generator.py');
        const python = spawn('python', [pythonScript, tempDataPath, outputPath, title]);
        
        python.stdout.on('data', (data) => {
          console.log(`Optimized Catalogue Python stdout: ${data}`);
        });
        
        python.stderr.on('data', (data) => {
          console.error(`Optimized Catalogue Python stderr: ${data}`);
        });
        
        python.on('close', (code) => {
          if (fs.existsSync(tempDataPath)) {
            fs.unlinkSync(tempDataPath);
          }
          
          console.log(`Optimized Catalogue Python process exited with code ${code}`);
          resolve(code === 0 && fs.existsSync(outputPath));
        });
        
        python.on('error', (error) => {
          console.error('Optimized Catalogue Python process error:', error);
          if (fs.existsSync(tempDataPath)) {
            fs.unlinkSync(tempDataPath);
          }
          resolve(false);
        });
      } catch (error) {
        console.error('Optimized Catalogue generation setup error:', error);
        resolve(false);
      }
    });
  }

  // Helper function to generate Enhanced PDF with Peter Spurgeon contact info
  async function generateEnhancedPDF(properties: any[], outputPath: string, title: string, clientName?: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Prepare enhanced data structure for Python script
        const enhancedData = {
          properties: properties.map(prop => ({
            ...prop,
            images: typeof prop.images === 'string' ? JSON.parse(prop.images || '[]') : (prop.images || []),
            features: typeof prop.features === 'string' ? JSON.parse(prop.features || '[]') : (prop.features || []),
            agent: {
              id: 9,
              name: "Peter Spurgeon",
              title: "Principal Real Estate Agent",
              phone: "084 208 9307", 
              email: "Peter@spurgeonproperty.com",
              rating: 4.9
            }
          })),
          clientName: clientName || 'Valued Client',
          catalogueTitle: title || 'Premium Property Showcase',
          contactInfo: {
            agent: "Peter Spurgeon",
            phone: "084 208 9307",
            email: "Peter@spurgeonproperty.com",
            website: "www.spurgeonproperty.com",
            availability: "7 days a week • 8AM - 8PM"
          }
        };

        const tempDataPath = path.join(tempDir, `enhanced_data_${Date.now()}.json`);
        fs.writeFileSync(tempDataPath, JSON.stringify(enhancedData, null, 2));
        
        const pythonScript = path.join(process.cwd(), 'enhanced_property_pdf_generator.py');
        const python = spawn('python', [pythonScript, tempDataPath, outputPath, title]);
        
        python.stdout.on('data', (data) => {
          console.log(`Enhanced PDF Python stdout: ${data}`);
        });
        
        python.stderr.on('data', (data) => {
          console.error(`Enhanced PDF Python stderr: ${data}`);
        });
        
        python.on('close', (code) => {
          // Cleanup temp data file
          if (fs.existsSync(tempDataPath)) {
            fs.unlinkSync(tempDataPath);
          }
          
          console.log(`Enhanced PDF Python process exited with code ${code}`);
          resolve(code === 0 && fs.existsSync(outputPath));
        });
        
        python.on('error', (error) => {
          console.error('Enhanced PDF Python process error:', error);
          if (fs.existsSync(tempDataPath)) {
            fs.unlinkSync(tempDataPath);
          }
          resolve(false);
        });
      } catch (error) {
        console.error('Enhanced PDF generation setup error:', error);
        resolve(false);
      }
    });
  }

  // Helper function to generate Python catalogue PDF
  async function generatePythonCataloguePDF(properties: any[], outputPath: string, title: string, clientName?: string): Promise<boolean> {
    return new Promise((resolve) => {
      const pythonScript = path.join(process.cwd(), 'generate_catalogue_pdf.py');
      const tempDataPath = path.join(tempDir, `catalogue_data_${Date.now()}.json`);
      
      try {
        // Format properties for Python generator with proper type conversion
        const pythonData = properties.map(property => ({
          title: property.title || 'Property',
          price: parseFloat(String(property.price).replace(/[^0-9.]/g, '')) || 0,
          currency: 'ZAR',
          bedrooms: parseInt(String(property.bedrooms)) || 0,
          bathrooms: parseInt(String(property.bathrooms)) || 0,
          area: parseFloat(String(property.area || property.floorArea || 0)) || 0,
          description: property.description || '',
          features: Array.isArray(property.features) ? property.features : [],
          address: `${property.address || ''}, ${property.suburb || ''}, ${property.city || ''}, ${property.province || ''}`.replace(/^,\s*|,\s*$/g, ''),
          images: property.images?.map((img: string) => path.join(process.cwd(), 'uploads', img)) || [],
          agent: property.agent || {
            name: 'Spurgeon Property',
            title: 'Real Estate Agent',
            phone: '+27 11 123 4567',
            email: 'info@spurgeonproperty.com'
          }
        }));

        // Write catalogue data to temp file
        const catalogueData = {
          properties: pythonData,
          title,
          clientName
        };
        fs.writeFileSync(tempDataPath, JSON.stringify(catalogueData, null, 2));
        
        const python = spawn('python', [pythonScript, tempDataPath, outputPath]);
        
        let stdout = '';
        let stderr = '';
        
        python.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        python.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        python.on('close', (code) => {
          console.log(`Python script output: ${stdout}`);
          if (stderr) {
            console.error(`Python script errors: ${stderr}`);
          }
          
          // Cleanup temp data file
          if (fs.existsSync(tempDataPath)) {
            fs.unlinkSync(tempDataPath);
          }
          resolve(code === 0);
        });
        
        python.on('error', (error) => {
          console.error('Python process error:', error);
          if (fs.existsSync(tempDataPath)) {
            fs.unlinkSync(tempDataPath);
          }
          resolve(false);
        });
      } catch (error) {
        console.error('Python PDF generation setup error:', error);
        if (fs.existsSync(tempDataPath)) {
          fs.unlinkSync(tempDataPath);
        }
        resolve(false);
      }
    });
  }

  // Generate Python-based property catalogue PDF
  app.post('/api/properties/catalogue/python-pdf', async (req, res) => {
    try {
      const { propertyIds, title = 'Property Catalogue', clientName } = req.body;
      
      if (!propertyIds || !Array.isArray(propertyIds)) {
        return res.status(400).json({ error: 'Property IDs required' });
      }

      // Fetch properties
      const properties = await Promise.all(
        propertyIds.map((id: number) => storage.getProperty(id))
      );

      const validProperties = properties.filter(p => p !== null);
      
      if (validProperties.length === 0) {
        return res.status(404).json({ error: 'No valid properties found' });
      }

      // Generate catalogue PDF using Python
      const outputPath = path.join(tempDir, `python_catalogue_${Date.now()}.pdf`);
      console.log(`Generating Python catalogue PDF to: ${outputPath}`);
      
      const success = await generatePythonCataloguePDF(validProperties, outputPath, title, clientName);
      console.log(`Python PDF generation success: ${success}`);

      if (success && fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`Generated PDF file size: ${stats.size} bytes`);
        
        if (stats.size === 0) {
          console.error('Generated PDF file is empty');
          res.status(500).json({ error: 'Generated PDF file is empty' });
          return;
        }
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}_professional.pdf"`);
        res.setHeader('Content-Length', stats.size.toString());
        
        const fileStream = fs.createReadStream(outputPath);
        
        fileStream.on('error', (error) => {
          console.error('File stream error:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to stream PDF file' });
          }
        });
        
        fileStream.on('end', () => {
          console.log('PDF file stream completed');
          // Cleanup temp file after sending
          setTimeout(() => {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
              console.log('Cleaned up temp PDF file');
            }
          }, 1000);
        });
        
        fileStream.pipe(res);
      } else {
        console.error(`PDF generation failed or file does not exist at: ${outputPath}`);
        res.status(500).json({ error: 'Failed to generate professional PDF catalogue' });
      }
    } catch (error) {
      console.error('Python catalogue generation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Generate single property Python PDF
  app.post('/api/properties/:id/python-pdf', async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Format property data for Python generator
      const pythonData = {
        title: property.title,
        price: property.price,
        currency: 'ZAR',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        description: property.description,
        features: property.features || [],
        address: `${property.address}, ${property.suburb}, ${property.city}, ${property.province}`,
        images: property.images?.map((img: string) => path.join(process.cwd(), 'uploads', img)) || [],
        agent: property.agent
      };

      // Generate PDF using Python script
      const outputPath = path.join(tempDir, `python_property_${propertyId}.pdf`);
      const tempDataPath = path.join(tempDir, `property_data_${Date.now()}.json`);
      
      try {
        fs.writeFileSync(tempDataPath, JSON.stringify(pythonData, null, 2));
        
        const pythonScript = path.join(process.cwd(), 'generate_single_pdf.py');
        const python = spawn('python', [pythonScript, tempDataPath, outputPath]);
        
        python.on('close', (code) => {
          // Cleanup temp data file
          if (fs.existsSync(tempDataPath)) {
            fs.unlinkSync(tempDataPath);
          }
          
          if (code === 0 && fs.existsSync(outputPath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="property_${propertyId}_professional.pdf"`);
            
            const fileStream = fs.createReadStream(outputPath);
            fileStream.pipe(res);
            
            // Cleanup temp file after sending
            fileStream.on('end', () => {
              if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
              }
            });
          } else {
            res.status(500).json({ error: 'Failed to generate professional PDF' });
          }
        });
        
        python.on('error', (error) => {
          console.error('Python process error:', error);
          if (fs.existsSync(tempDataPath)) {
            fs.unlinkSync(tempDataPath);
          }
          res.status(500).json({ error: 'Python PDF generation failed' });
        });
      } catch (error) {
        console.error('Python PDF setup error:', error);
        if (fs.existsSync(tempDataPath)) {
          fs.unlinkSync(tempDataPath);
        }
        res.status(500).json({ error: 'Failed to prepare PDF data' });
      }
    } catch (error) {
      console.error('Property PDF generation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Professional Catalogue Generation Routes
  
  // Generate HTML catalogue for web viewing and social media
  app.post("/api/admin/catalogue/html", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      console.log('Generating HTML catalogue...');
      
      const { selectedProperties } = req.body;
      
      // Get properties data (either selected or all)
      let properties;
      if (selectedProperties && selectedProperties.length > 0) {
        console.log(`Generating catalogue for ${selectedProperties.length} selected properties`);
        properties = [];
        for (const id of selectedProperties) {
          const property = await storage.getProperty(id);
          if (property) {
            properties.push(property);
          }
        }
      } else {
        properties = await storage.getProperties();
      }
      
      console.log(`Found ${properties.length} properties for catalogue`);
      
      if (properties.length === 0) {
        return res.status(400).json({ error: "No properties available for catalogue generation" });
      }
      
      const propertiesData = properties.map(prop => {
        const data = { ...prop };
        if (typeof data.images === 'string') {
          try { data.images = JSON.parse(data.images); } catch (e) { data.images = []; }
        }
        if (typeof data.features === 'string') {
          try { data.features = JSON.parse(data.features); } catch (e) { data.features = []; }
        }
        return data;
      });
      
      const jsonFile = path.join(process.cwd(), 'temp_properties.json');
      await fs.promises.writeFile(jsonFile, JSON.stringify(propertiesData, null, 2));
      
      const pythonProcess = spawn('/home/runner/workspace/.pythonlibs/bin/python3', ['create_html_catalogue.py', jsonFile], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '', stderr = '';
      pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
      pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });
      
      pythonProcess.on('close', async (code) => {
        await fs.promises.unlink(jsonFile).catch(() => {});
        
        if (code === 0) {
          console.log('HTML catalogue generated successfully');
          
          // Read and send HTML file as download
          const htmlPath = path.join(process.cwd(), 'spurgeon_catalogue.html');
          if (fs.existsSync(htmlPath)) {
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', 'attachment; filename="spurgeon_property_catalogue.html"');
            
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            res.send(htmlContent);
          } else {
            res.status(500).json({ error: 'HTML catalogue file not found' });
          }
        } else {
          console.error('Python script failed:', stderr);
          res.status(500).json({ error: `Catalogue generation failed: ${stderr || stdout}` });
        }
      });
      
      pythonProcess.on('error', (error) => {
        res.status(500).json({ error: `Failed to start catalogue generation: ${error.message}` });
      });
      
    } catch (error) {
      console.error('Error generating HTML catalogue:', error);
      res.status(500).json({ error: "Failed to generate HTML catalogue" });
    }
  });
  
  // Generate optimized PDF catalogue using Python generator
  app.post("/api/properties/optimized-catalogue", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      console.log('Generating optimized PDF catalogue...');
      
      const { propertyIds, title, clientName } = req.body;
      
      // Get properties data
      let properties;
      if (propertyIds && propertyIds.length > 0) {
        properties = [];
        for (const id of propertyIds) {
          const property = await storage.getProperty(id);
          if (property) {
            properties.push(property);
          }
        }
      } else {
        properties = await storage.getProperties();
      }
      
      console.log(`Found ${properties.length} properties for optimized PDF catalogue`);
      
      if (properties.length === 0) {
        return res.status(400).json({ error: "No properties available for catalogue generation" });
      }
      
      // Prepare properties data for Python generator
      const propertiesData = properties.map(prop => {
        const data = { ...prop };
        if (typeof data.images === 'string') {
          try { data.images = JSON.parse(data.images); } catch (e) { data.images = []; }
        }
        if (typeof data.features === 'string') {
          try { data.features = JSON.parse(data.features); } catch (e) { data.features = []; }
        }
        return data;
      });
      
      // Write properties to temporary JSON file
      const jsonFile = path.join(process.cwd(), 'temp_properties_optimized.json');
      await fs.promises.writeFile(jsonFile, JSON.stringify(propertiesData, null, 2));
      
      // Generate optimized PDF using Python script
      const pythonProcess = spawn('/home/runner/workspace/.pythonlibs/bin/python3', [
        'optimized_catalogue_generator.py', 
        jsonFile,
        title || 'Premium Property Catalogue',
        clientName || 'Valued Client'
      ], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '', stderr = '';
      pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
      pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });
      
      pythonProcess.on('close', async (code) => {
        await fs.promises.unlink(jsonFile).catch(() => {});
        
        if (code === 0) {
          console.log('Optimized PDF catalogue generated successfully');
          
          // Extract filename from Python output
          const filenameMatch = stdout.match(/PDF saved to: (.+)/);
          const filename = filenameMatch ? filenameMatch[1] : 'optimized_catalogue.pdf';
          
          const pdfPath = path.join(process.cwd(), filename);
          if (fs.existsSync(pdfPath)) {
            const fileUrl = `/uploads/${path.basename(filename)}`;
            
            // Move file to uploads directory
            const uploadsPath = path.join(process.cwd(), 'uploads', path.basename(filename));
            fs.renameSync(pdfPath, uploadsPath);
            
            res.json({ 
              success: true,
              message: 'Optimized PDF catalogue generated successfully',
              downloadUrl: fileUrl,
              filename: path.basename(filename)
            });
          } else {
            res.status(500).json({ error: 'Optimized PDF catalogue file not found' });
          }
        } else {
          console.error('Python script failed:', stderr);
          res.status(500).json({ error: `Optimized catalogue generation failed: ${stderr || stdout}` });
        }
      });
      
      pythonProcess.on('error', (error) => {
        res.status(500).json({ error: `Failed to start optimized catalogue generation: ${error.message}` });
      });
      
    } catch (error) {
      console.error('Error generating optimized PDF catalogue:', error);
      res.status(500).json({ error: "Failed to generate optimized PDF catalogue" });
    }
  });

  // Generate PDF catalogue for professional sharing
  app.post("/api/admin/catalogue/pdf", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      console.log('Generating PDF catalogue...');
      
      const { selectedProperties } = req.body;
      
      // Get properties data (either selected or all)
      let properties;
      if (selectedProperties && selectedProperties.length > 0) {
        console.log(`Generating catalogue for ${selectedProperties.length} selected properties`);
        properties = [];
        for (const id of selectedProperties) {
          const property = await storage.getProperty(id);
          if (property) {
            properties.push(property);
          }
        }
      } else {
        properties = await storage.getProperties();
      }
      
      console.log(`Found ${properties.length} properties for PDF catalogue`);
      
      if (properties.length === 0) {
        return res.status(400).json({ error: "No properties available for catalogue generation" });
      }
      
      const propertiesData = properties.map(prop => {
        const data = { ...prop };
        if (typeof data.images === 'string') {
          try { data.images = JSON.parse(data.images); } catch (e) { data.images = []; }
        }
        if (typeof data.features === 'string') {
          try { data.features = JSON.parse(data.features); } catch (e) { data.features = []; }
        }
        // Fix data format issues for PDF generator
        if (!data.area && data.floorArea) {
          data.area = data.floorArea;
        }
        // Ensure area is a number or null
        if (data.area === 0 || !data.area) {
          data.area = null; // Will display as "Area not specified" in PDF
        }
        // Ensure price is a number for calculations
        if (typeof data.price === 'string') {
          data.price = parseFloat(data.price.replace(/[^0-9.]/g, '')) || 0;
        }
        console.log('Property data for PDF:', {
          id: data.id,
          title: data.title,
          price: data.price,
          area: data.area,
          propertyType: data.propertyType
        });
        return data;
      });
      
      const jsonFile = path.join(process.cwd(), 'temp_properties.json');
      await fs.promises.writeFile(jsonFile, JSON.stringify(propertiesData, null, 2));
      
      const pythonProcess = spawn('/home/runner/workspace/.pythonlibs/bin/python3', ['professional_catalogue_generator.py', jsonFile], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '', stderr = '';
      pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
      pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });
      
      pythonProcess.on('close', async (code) => {
        await fs.promises.unlink(jsonFile).catch(() => {});
        
        if (code === 0) {
          console.log('PDF catalogue generated successfully');
          res.json({ 
            success: true, 
            message: "PDF catalogue generated successfully",
            filename: "spurgeon_professional_catalogue.pdf",
            downloadUrl: "/spurgeon_professional_catalogue.pdf"
          });
        } else {
          console.error('Python script failed:', stderr);
          res.status(500).json({ error: `PDF generation failed: ${stderr || stdout}` });
        }
      });
      
      pythonProcess.on('error', (error) => {
        res.status(500).json({ error: `Failed to start PDF generation: ${error.message}` });
      });
      
    } catch (error) {
      console.error('Error generating PDF catalogue:', error);
      res.status(500).json({ error: "Failed to generate PDF catalogue" });
    }
  });

  // Serve generated catalogue files
  app.use('/spurgeon_catalogue.html', express.static(path.join(process.cwd(), 'spurgeon_catalogue.html')));
  app.use('/spurgeon_professional_catalogue.pdf', express.static(path.join(process.cwd(), 'spurgeon_professional_catalogue.pdf')));

  // Register monitoring routes
  registerMonitoringRoutes(app);
  


  return httpServer;
}
