# Spurgeon Property Platform - Technical Specification for Quotation

## Project Overview
A comprehensive full-stack property management platform for the South African real estate market with AI integration, admin management, and advanced property search capabilities.

## Live Platform
- **Production URL**: https://spurgeon-property--malcolm36.replit.app
- **Custom Domain**: www.spurgeonproperty.co.za (SSL pending)
- **Admin Portal**: /admin/login
- **Test Credentials Available**: Contact for demo access

## Technical Stack Requirements

### Frontend Technologies
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with custom design system
- **Component Library**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **UI Animations**: Framer Motion for smooth transitions
- **Maps Integration**: React Leaflet for property location visualization
- **Color Scheme**: Purple/orange branding theme

### Backend Technologies
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js REST API
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Custom admin authentication with bcrypt
- **File Uploads**: Multer for property images/videos (up to 100MB)
- **Real-time**: WebSocket integration for live notifications
- **Email Service**: Nodemailer with Gmail SMTP
- **Security**: Helmet.js, CORS, rate limiting, compression

### AI Integration Requirements
- **OpenAI Integration**: GPT-4o for property description generation
- **Anthropic Integration**: Claude Sonnet for conversational AI
- **Image Generation**: DALL-E 3 for social media ads
- **Features**: Property search assistant, automated content generation

### External Services Integration
- **Google Maps API**: Places API for neighborhood analytics
- **Email Notifications**: Gmail SMTP for lead notifications
- **Social Media**: Automated ad generation for Facebook, Instagram, LinkedIn, Twitter

## Database Schema & Features

### Core Data Models
1. **Properties Table** (22 fields)
   - Basic info: title, description, price, address, coordinates
   - Property details: type, bedrooms, bathrooms, area, features
   - Media: images array, featured image, videos array
   - Status: active, pending, sold, rented
   - Agent assignment and view tracking

2. **Agents Table** (13 fields)
   - Contact info: name, email, phone, avatar
   - Professional details: bio, specialties, license number
   - Performance tracking: years experience, languages

3. **Leads Table** (12 fields)
   - Customer info: name, email, phone, message
   - Lead management: status, priority, source, agent assignment
   - Property association and inquiry tracking

4. **Admin Users Table** (9 fields)
   - Authentication: email, password hash, role
   - Profile: first name, last name, status
   - Session management with secure cookies

### Key Functionality Requirements

#### Property Management System
- **Property Listings**: Complete CRUD operations
- **Advanced Search**: Multi-criteria filtering (price, location, type, bedrooms, bathrooms)
- **Image/Video Upload**: Multiple file upload with ZIP support
- **Featured Image Selection**: Star-based featured image system
- **Property Status Management**: SOLD/RENTED overlays
- **Agent Assignment**: Property-agent relationship management

#### Lead Management System
- **Contact Forms**: Property-specific and general inquiries
- **Lead Assignment**: Agent assignment with real-time updates
- **Status Tracking**: Lead progression management
- **Email Notifications**: Automated notifications to owners/agents
- **WhatsApp Integration**: Direct messaging with property details

#### Admin Portal Features
- **Restricted Access**: Whitelist-based authentication (4 authorized emails)
- **Dashboard Analytics**: Property, lead, and agent statistics
- **Property Management**: Add, edit, delete properties with media
- **Lead Management**: View, assign, update lead status
- **Agent Management**: Manage agent profiles and assignments
- **Export Functionality**: CSV export of properties data

#### User-Facing Features
- **Homepage**: Hero section, featured properties, search functionality
- **Property Search**: Advanced filters with real-time results
- **Property Details**: Gallery, features, neighborhood analytics, contact forms
- **Interactive Maps**: Property location visualization
- **Responsive Design**: Mobile-optimized across all pages
- **Theme Support**: Light/dark mode toggle

#### AI-Powered Features
- **Property Assistant**: Conversational AI for property search
- **Smart Descriptions**: Automated property description generation
- **Social Media Ads**: Automated ad generation with property details
- **Neighborhood Insights**: AI-enhanced location analytics

## Performance & Security Requirements

### Performance Standards
- **API Response Times**: <200ms for standard queries
- **Page Load Times**: <3 seconds initial load
- **Image Optimization**: Responsive images with lazy loading
- **Database Optimization**: Indexed queries with connection pooling

### Security Implementation
- **Authentication**: Secure admin sessions with bcrypt (12 rounds)
- **Rate Limiting**: 100 requests/15min general, 50/15min API
- **Security Headers**: Helmet.js implementation
- **CORS Configuration**: Proper cross-origin handling
- **Input Validation**: Zod schemas for all forms and API endpoints

### SEO & Analytics
- **Meta Tags**: Comprehensive meta descriptions and Open Graph
- **Structured Data**: Real estate JSON-LD markup
- **Sitemap Generation**: Dynamic XML sitemap
- **Analytics Integration**: Performance and business metrics tracking

## Content & Data Requirements

### Property Data (Current: 22 properties)
- **Property Types**: House, Apartment, Townhouse, Villa, Estate, Farm, Land, Commercial
- **Listing Types**: Sale and rental properties
- **Price Range**: R350,000 - R45,000,000
- **Locations**: Cape Town, Johannesburg, Sandton, Paulshof, Bellville
- **Media**: High-quality images, property videos, virtual tours

### Team Data (Current: 3 agents)
- **Reshma Kila**: Real Estate Agent, Cape Town
- **Veruschkia Barnard**: Senior Real Estate Agent, Johannesburg  
- **Spurgeon Peter**: Managing Director, Cape Town

### Lead Management (Current: 27 leads)
- **Lead Sources**: Contact forms, property inquiries, phone calls
- **Lead Types**: Viewing requests, information requests, price negotiations
- **Status Management**: New, contacted, qualified, converted

## Deployment & Infrastructure

### Hosting Requirements
- **Production Environment**: Cloud hosting with auto-scaling
- **Database**: PostgreSQL with SSL connections
- **File Storage**: Image/video storage with CDN capability
- **SSL Certificate**: Custom domain SSL support
- **Backup Strategy**: Automated daily backups

### Environment Variables Required
- DATABASE_URL (PostgreSQL connection)
- OPENAI_API_KEY (GPT-4o access)
- ANTHROPIC_API_KEY (Claude Sonnet access)
- GMAIL_USER/GMAIL_PASS (Email notifications)
- GOOGLE_MAPS_API_KEY (Maps and places data)

## Project Scope & Deliverables

### Phase 1: Core Platform (Essential)
- Property management system with admin portal
- User-facing property search and listings
- Basic lead management and contact forms
- Responsive design and mobile optimization
- Database setup and basic authentication

### Phase 2: Advanced Features (Important)
- AI property assistant integration
- Advanced search and filtering
- Email notification system
- WhatsApp integration
- Property image/video management

### Phase 3: Business Intelligence (Enhanced)
- Analytics dashboard
- Performance monitoring
- SEO optimization
- Social media ad generation
- Advanced reporting features

## Technical Complexity Factors

### High Complexity Elements
- AI integration (OpenAI + Anthropic APIs)
- Real-time WebSocket notifications
- Advanced property search with multiple filters
- Image/video upload with file processing
- Google Maps integration with places data

### Medium Complexity Elements
- Admin authentication and role management
- Email notification system
- WhatsApp API integration
- Property status management
- Export functionality

### Standard Complexity Elements
- CRUD operations for properties/leads/agents
- Form validation and error handling
- Responsive UI design
- Basic filtering and pagination
- File upload handling

## Quality Assurance Requirements

### Testing Requirements
- Unit tests for core business logic
- Integration tests for API endpoints
- End-to-end testing for user workflows
- Mobile responsiveness testing
- Cross-browser compatibility

### Documentation Requirements
- API documentation
- Database schema documentation
- Deployment guide
- User manual for admin portal
- Technical maintenance guide

## Estimated Development Time

### Total Development Estimate: 8-12 weeks
- **Phase 1 (Core)**: 4-6 weeks
- **Phase 2 (Advanced)**: 3-4 weeks  
- **Phase 3 (Business Intelligence)**: 1-2 weeks

### Team Requirements
- 1 Full-Stack Developer (React + Node.js + TypeScript)
- 1 UI/UX Designer (Tailwind CSS + Responsive Design)
- 1 DevOps Engineer (Database + Deployment + Security)
- Optional: 1 AI Integration Specialist

## Additional Considerations

### Ongoing Maintenance
- Regular security updates
- AI model updates and optimization
- Database performance monitoring
- Content management and updates
- Feature enhancements based on user feedback

### Scalability Planning
- Database optimization for growing property listings
- CDN implementation for media files
- API rate limiting and caching strategies
- Horizontal scaling capabilities

---

**Note**: This specification represents a production-ready real estate platform currently serving live traffic. The system includes enterprise-grade features, AI integration, and comprehensive property management capabilities suitable for a professional real estate business.

**Contact**: For technical questions, demo access, or clarifications about any requirements, please reach out with specific inquiries.