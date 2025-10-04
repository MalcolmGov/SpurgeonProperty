# Spurgeon Property - South African Real Estate Platform

## Overview

Spurgeon Property is a comprehensive real estate platform tailored for the South African market. It facilitates property listing, search, and management, incorporating AI-powered features for description generation and search assistance. The platform includes restricted admin access, video upload capabilities, and a robust agent management system. Its vision is to be the premier digital gateway for property transactions in South Africa, leveraging technology to enhance user experience and streamline operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The platform employs a full-stack TypeScript architecture.

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, custom purple/orange design system
- **Component Library**: Radix UI primitives, shadcn/ui
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST APIs
- **Database ORM**: Drizzle ORM
- **File Storage**: Replit Object Storage (with local filesystem fallback)
- **File Uploads**: Multer
- **Authentication**: Custom admin authentication with bcrypt
- **Real-time Features**: WebSocket integration

### Database
- **Database**: PostgreSQL
- **Key Tables**: `properties`, `agents`, `leads`, `inquiries`, `admin_users`, `admin_sessions`

### Key Features
- **Property Management**: Listings with images/videos, advanced search, comparison (planned).
- **AI Integration**: OpenAI (GPT-4o) for description generation, Anthropic (Claude-3 Sonnet) for conversational AI, intelligent search assistance.
- **Security**: Whitelist-based admin access control (4 authorized emails), secure session management.
- **UI/UX**: Purple/orange color scheme, gradient styling, modern component design, mobile-responsive layouts, intuitive navigation.
- **Content Generation**: Professional PDF and HTML catalogue generation for marketing materials, social media image generator with optimized layouts.
- **Monitoring**: Enterprise-grade monitoring and alerting for system performance and business analytics.

## External Dependencies

- **AI Services**:
    - OpenAI (GPT-4o)
    - Anthropic (Claude Sonnet)
- **Database & Infrastructure**:
    - PostgreSQL (via Neon serverless)
- **Communication**:
    - SendGrid (for email delivery)
    - Nodemailer (for Gmail SMTP)
    - WebSocket
- **APIs**:
    - Google Maps Places API (for neighborhood analytics)
    - MortgageMax application portal
- **Other**:
    - ReportLab (Python library for PDF generation)
    - adm-zip (for ZIP file processing)

## File Storage Configuration

### Current Setup
The application uses **Replit Object Storage** for persistent file storage with automatic fallback to local filesystem:

- **Production (Deployed)**: Files uploaded to local filesystem are lost on redeploy (ephemeral storage)
- **Development**: Falls back to local filesystem when Object Storage is not configured
- **With Object Storage**: Files persist across deployments and are accessible in both development and production

### Enabling Object Storage (Production Fix)

To enable persistent file storage that survives deployments:

1. **Enable Object Storage in Replit Workspace**:
   - Open the Replit workspace
   - Navigate to "App Storage" or "Object Storage" tab
   - Click "Enable Object Storage" for your Repl

2. **Verify Configuration**:
   - Check that `.replit` file contains `[objectStorage]` section
   - The bucket ID will be automatically configured
   - No code changes needed - the application will automatically use Object Storage

3. **Migrate Existing Files** (if needed):
   - Re-upload any property images through the admin interface
   - Old images in local filesystem will be lost on next deploy
   - New uploads will automatically use Object Storage

### File Upload Flow
1. User uploads images/videos via admin property form
2. Files are saved to Object Storage (or local filesystem as fallback)
3. URLs are stored in database as `/storage/{filename}` or `/uploads/{filename}`
4. Images are served via `/storage/:filename` endpoint (Object Storage) or `/uploads/:filename` (static middleware)