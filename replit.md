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

### Current Setup (January 2025)
The application uses **local filesystem storage** for images and videos:

- **Development**: ✅ Images stored in `/uploads/` folder - works perfectly
- **Production**: ✅ Images stored in `/uploads/` folder - works perfectly
- **⚠️ Limitation**: Production images are **ephemeral** - they are deleted on every deployment/republish

### Known Issues
- **Replit Object Storage**: Discovered to be non-functional (uploads succeed but data not persisted - downloads return 1 byte null data)
- **Cloudinary**: SDK installed, credentials configured, setup **postponed** for future implementation

### File Upload Flow (Current)
1. User uploads ZIP file or images via admin property form
2. Files extracted and saved to local `/uploads/` directory
3. Image URLs stored in database as `/uploads/{filename}`
4. Images served via Express static middleware from `/uploads/` path

### Future Migration Path (When Ready)
**Option 1: Cloudinary (Recommended)**
- SDK: Already installed (`cloudinary` package)
- Credentials: Already configured in secrets
- Benefits: Permanent storage, global CDN, image transformations
- Setup: Code ready, just needs activation

**Option 2: AWS S3 / Supabase Storage**
- Alternative cloud storage solutions
- Requires new SDK installation and configuration

### Migration Impact
⚠️ **Important**: When migrating to permanent storage, all existing `/uploads/` images will need to be:
1. Re-uploaded through admin interface, OR
2. Manually migrated via script