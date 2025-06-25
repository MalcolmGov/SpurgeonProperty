# Spurgeon Property - Technical Stack Documentation

## Overview
Spurgeon Property is a full-stack TypeScript real estate platform built with modern web technologies. The application is designed for easy deployment across multiple hosting providers.

## Frontend Stack

### Core Framework
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Full type safety across the application
- **Vite** - Build tool and development server for fast HMR

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library for smooth interactions
- **Lucide React** - Icon library

### State Management & Data Fetching
- **TanStack Query (React Query v5)** - Server state management and caching
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation library

### Routing
- **Wouter** - Lightweight client-side routing

## Backend Stack

### Runtime & Framework
- **Node.js** - JavaScript runtime
- **TypeScript** - Type safety for backend code
- **Express.js** - Web application framework
- **TSX** - TypeScript execution environment

### Database
- **PostgreSQL** - Primary database (currently using Neon serverless)
- **Drizzle ORM** - Type-safe database toolkit
- **Drizzle Kit** - Database migrations and schema management

### Authentication & Security
- **bcrypt** - Password hashing
- **Custom session management** - Admin and agent authentication
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting

### File Handling
- **Multer** - File upload middleware for images and videos
- **ADM-ZIP** - ZIP file extraction for bulk image uploads

### Email Services
- **Nodemailer** - Email sending with Gmail SMTP
- **Custom email templates** - HTML email notifications

### AI Integration
- **OpenAI API** - GPT-4o for property descriptions and chatbot
- **Anthropic API** - Claude Sonnet for advanced conversational AI

### External APIs
- **Google Maps Places API** - Location services and neighborhood analytics
- **Google Maps JavaScript API** - Interactive maps (configured but not actively used)

## Development Tools

### Build & Bundling
- **Vite** - Frontend build tool with optimized production builds
- **ESBuild** - Fast JavaScript bundler for backend
- **PostCSS** - CSS processing with Tailwind

### Code Quality
- **TypeScript Compiler** - Type checking
- **ESLint** (configured) - Code linting
- **Prettier** (configured) - Code formatting

### Package Management
- **npm** - Node package manager

## Production Configuration

### Environment Variables Required
```
DATABASE_URL=postgresql://[connection-string]
OPENAI_API_KEY=sk-[your-openai-key]
ANTHROPIC_API_KEY=sk-ant-[your-anthropic-key]
GMAIL_USER=[notification-email]
GMAIL_PASS=[app-specific-password]
NODE_ENV=production
```

### Build Scripts
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/server.js --external:pg-native",
    "start": "node dist/server.js",
    "db:push": "drizzle-kit push"
  }
}
```

### Port Configuration
- **Development**: Port 5000 (frontend and backend served together)
- **Production**: Configurable via PORT environment variable

## Deployment Requirements

### Server Requirements
- **Node.js 18+** - Runtime environment
- **PostgreSQL 12+** - Database server
- **2GB RAM minimum** - For optimal performance
- **SSL Certificate** - Required for production

### Database Setup
1. PostgreSQL database with connection pooling
2. Run `npm run db:push` to create tables
3. Seed initial admin users via direct database insertion

### Build Process
1. Install dependencies: `npm install`
2. Build frontend: `npm run build:client`
3. Build backend: `npm run build:server`
4. Start production server: `npm start`

## Alternative Hosting Options

### Recommended Platforms

#### 1. **Vercel** (Frontend + Serverless Backend)
- Deploy frontend as static site
- Use Vercel Functions for API routes
- Connect to external PostgreSQL (Neon, Supabase, Railway)

#### 2. **Netlify** (Frontend + Serverless Backend)
- Static site deployment with Netlify Functions
- External database required

#### 3. **Railway**
- Full-stack deployment with integrated PostgreSQL
- Automatic SSL and custom domains
- Built-in CI/CD from GitHub

#### 4. **Render**
- Full-stack web service deployment
- Managed PostgreSQL available
- Automatic SSL and custom domains

#### 5. **DigitalOcean App Platform**
- Containerized deployment
- Managed database options
- Custom domains and SSL

#### 6. **AWS (Advanced)**
- EC2 + RDS for full control
- Elastic Beanstalk for managed deployment
- S3 + CloudFront for static assets

#### 7. **Google Cloud Platform**
- App Engine for backend
- Cloud SQL for PostgreSQL
- Cloud Storage for file uploads

#### 8. **Heroku** (Simple Option)
- Git-based deployment
- Heroku Postgres add-on
- Custom domains available

### Migration Considerations

1. **Database Migration**: Export/import PostgreSQL data
2. **Environment Variables**: Configure on new platform
3. **File Uploads**: May need cloud storage (AWS S3, Cloudinary)
4. **Domain Configuration**: Update DNS settings
5. **SSL Certificate**: Most platforms provide automatic SSL

### Cost Estimates (Monthly)
- **Railway**: $5-20 (starter to pro)
- **Render**: $7-25 (web service + database)
- **DigitalOcean**: $12-25 (app + managed database)
- **Vercel**: $20+ (Pro plan for serverless functions)
- **AWS**: $15-50+ (depending on usage)

## File Structure
```
├── client/src/          # React frontend application
├── server/              # Express backend application
├── shared/              # Shared TypeScript schemas and types
├── uploads/             # Local file upload storage
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── drizzle.config.ts    # Database configuration
└── tsconfig.json        # TypeScript configuration
```

The application is built with hosting flexibility in mind and can be adapted to most modern cloud platforms with minimal configuration changes.