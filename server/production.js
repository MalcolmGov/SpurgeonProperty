import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from "pg";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database setup with proper error handling
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set. Did you forget to provision a database?");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection established successfully');
  } catch (err) {
    console.error('Database connection failed:', err);
    throw new Error(`Failed to connect to database: ${err.message}`);
  }
}

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(join(__dirname, '..', 'dist', 'client')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic API endpoints for properties
app.get('/api/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'client', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    // Test database connection first
    await testDatabaseConnection();
    
    const server = createServer(app);
    const port = process.env.PORT || 5001;
    
    // Setup WebSocket server
    const wss = new WebSocketServer({ server });
    
    wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });
    
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        pool.end(() => {
          console.log('Server stopped');
          process.exit(0);
        });
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();