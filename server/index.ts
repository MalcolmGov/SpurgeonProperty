import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { testDatabaseConnection } from "./database.js";
import { performanceMonitor } from "./performance";

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://spurgeonproperty.com', 'https://www.spurgeonproperty.com']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // More restrictive for API routes
  message: { error: 'API rate limit exceeded' },
});

app.use(limiter);
app.use('/api/', apiLimiter);

// Compression middleware
app.use(compression());

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Serve static files from client/public directory
app.use(express.static('client/public'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // Log performance metrics
    performanceMonitor.logRequest(req, res, duration);
    
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function startServer() {
  try {
    // Test database connection before starting server
    await testDatabaseConnection();
    
    const server = await registerRoutes(app);
    
    // Share the server instance with the app for WebSocket access
    (app as any).httpServer = server;

    // Global error handler with detailed logging
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      // Log error details for monitoring
      console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`, {
        status,
        message,
        stack: err.stack,
        body: req.body,
        query: req.query,
        headers: req.headers,
        ip: req.ip
      });
      
      // Send appropriate response based on environment
      if (process.env.NODE_ENV === 'production') {
        res.status(status).json({ 
          error: status >= 500 ? 'Internal Server Error' : message,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(status).json({ 
          error: message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Setup vite in development or serve static files in production
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    const port = 5000;
    
    return new Promise<void>((resolve, reject) => {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, (err?: Error) => {
        if (err) {
          console.error(`Failed to start server on port ${port}:`, err);
          reject(err);
        } else {
          log(`serving on port ${port}`);
          resolve();
        }
      });
      
      server.on('error', (err) => {
        console.error('Server error:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch((error) => {
  console.error('Startup failed:', error);
  process.exit(1);
});
