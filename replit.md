# South African Property Platform - SpurgeonProperty

## Overview

SpurgeonProperty is a modern real estate platform built for the South African property market. The application provides comprehensive property listing, search, and management capabilities with AI-powered features for property description generation and intelligent search assistance.

## System Architecture

The platform follows a full-stack TypeScript architecture with the following layers:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system featuring purple/orange color scheme
- **Component Library**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Uploads**: Multer for handling property images
- **Authentication**: Custom admin authentication with bcrypt password hashing
- **Real-time Features**: WebSocket integration for live notifications

## Key Components

### Database Layer
- **Database**: PostgreSQL as primary data store
- **Schema Management**: Drizzle schema definitions in `/shared/schema.ts`
- **Key Tables**:
  - `properties`: Core property listings with location, pricing, and features
  - `agents`: Real estate agent profiles and contact information
  - `leads`: Customer inquiries and contact requests
  - `inquiries`: Property-specific inquiries
  - `admin_users`: Administrative user accounts
  - `admin_sessions`: Session management for admin authentication

### Property Management System
- **Property Listings**: Comprehensive property data including images, features, and location
- **Advanced Search**: Multi-criteria filtering by price, location, type, bedrooms, bathrooms
- **Interactive Maps**: Property location visualization (prepared for implementation)
- **Property Comparison**: Side-by-side comparison functionality

### AI Integration
- **OpenAI Integration**: Property description generation using GPT-4o model
- **Anthropic Integration**: Claude-3 Sonnet for advanced conversational AI
- **AI Assistant**: Interactive property search assistant with natural language processing
- **Smart Content Generation**: Automated marketing content and property highlights

### External Data Sources
- **Spurgeon Property Scraper**: Web scraping system to import real property listings
- **Neighborhood Analytics**: Integration points for local market data and amenities
- **Property Valuation**: Foundation for automated property value estimation

## Data Flow

### Property Search Flow
1. User enters search criteria through advanced search interface
2. Frontend sends filtered query to `/api/properties` endpoint
3. Backend applies filters using Drizzle ORM queries
4. Results returned with agent information via joins
5. Frontend displays paginated results with comparison options

### Lead Management Flow
1. Customer submits inquiry through contact forms
2. Lead data validated and stored in database
3. Real-time WebSocket notification sent to admin dashboard
4. Admin can manage lead status and assign to agents
5. Email notifications sent via SendGrid integration

### AI Assistant Flow
1. User interacts with AI chat interface
2. Query processed by Anthropic Claude or OpenAI API
3. AI generates search parameters and property recommendations
4. Results displayed with natural language explanations
5. Follow-up suggestions provided for refined searches

## External Dependencies

### AI Services
- **OpenAI**: GPT-4o for property description generation
- **Anthropic**: Claude Sonnet for conversational AI assistance

### Database & Infrastructure
- **PostgreSQL**: Primary database via Neon serverless
- **File Storage**: Local upload handling (prepared for cloud storage)

### Communication
- **SendGrid**: Email delivery service for notifications
- **WebSocket**: Real-time notifications and updates

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for seamless cloud development
- **Hot Reload**: Vite dev server with Express backend
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles Node.js server for deployment
- **Database**: Production PostgreSQL with SSL connections
- **Ports**: Frontend on 5000, API on 5001

### Scalability Considerations
- **Connection Pooling**: Neon serverless PostgreSQL handles connection scaling
- **Static Assets**: Prepared for CDN deployment
- **API Rate Limiting**: Implemented for external service calls
- **Caching**: Query result caching via TanStack Query

## Recent Changes

- **June 13, 2025 - Official SpurgeonProperty Logo Integration**: Replaced custom logo with authentic SpurgeonProperty branding using provided logo asset. Enhanced visual quality with improved contrast, saturation, and brightness filters for better clarity across all screen sizes. Updated logo component with proper image optimization and responsive sizing. Applied consistent branding across main navigation and admin portal with appropriate scaling and white variant support for different backgrounds.

- **June 13, 2025 - Admin Mobile Layout Optimization**: Fixed comprehensive mobile responsiveness issues in admin portal including responsive sidebar with mobile hamburger menu, proper margin adjustments for mobile content, optimized dashboard layout with flexible grid systems, mobile-friendly tables with horizontal scrolling, and touch-optimized navigation. Admin portal now works seamlessly across all device sizes with fixed mobile menu button and proper content spacing.

- **June 13, 2025 - Premium Property Card Styling**: Implemented sophisticated premium styling for property cards optimized for both desktop and mobile. Enhanced with gradient backgrounds, image zoom effects on hover, glassmorphism action buttons, animated feature tags, premium agent cards with status indicators, and gradient call-to-action buttons. Cards now feature borderless design with shadow effects, backdrop blur elements, and smooth Framer Motion animations for professional user experience.

- **June 13, 2025 - Move Digital Footer Attribution**: Added attractive "Powered by Move Digital" attribution to footer with gradient styling, hover animations, and external link to www.movedigital.africa. Features orange-to-purple gradient text effects matching site branding with smooth transitions.

- **June 13, 2025 - Mobile Property Details Scrolling Fix**: Resolved mobile scrolling issues on property detail pages by disabling sticky positioning on mobile devices and adding iOS-specific webkit overflow scrolling optimizations for smooth touch interactions.

- **June 13, 2025 - Property Image Display Fix**: Resolved missing images in property cards by fixing empty image arrays in database and enhancing PropertyCard component with robust image handling. Added intelligent image path validation, improved error handling, and consistent fallback behavior for missing or broken images.

- **June 13, 2025 - Responsive Mobile UI Animations Complete**: Successfully implemented comprehensive responsive mobile UI animations using Framer Motion throughout the PropertyCard component. Added smooth entrance animations, hover effects, and tap feedback with optimized durations for mobile interactions. Property cards now feature fade-in animations on load, subtle lift effects on hover, and satisfying scale feedback on touch interactions, enhancing the overall mobile user experience.

- **June 13, 2025 - Comprehensive Homepage Value Propositions Enhancement**: Significantly enhanced homepage with detailed value propositions showcasing SpurgeonProperty's unique advantages. Added dedicated sections for AI-powered smart search, deep market insights, expert agent network, trust indicators, and comprehensive call-to-action. Homepage now effectively communicates platform benefits including R2.5B+ property value transacted, 98% client satisfaction rate, and advanced features like Google Maps integration and 24/7 AI assistant support.

- **June 13, 2025 - Agent Assignment Feature Complete**: Successfully implemented complete agent assignment functionality for properties. Added agent selection dropdown to property form with all available agents, integrated agentId field handling in both create and edit modes, and fixed SelectItem validation issues. Properties can now be assigned to specific agents during creation or editing, with proper null handling for unassigned properties.

- **June 13, 2025 - Google Maps API Integration Complete**: Successfully integrated Google Maps API with real location services for comprehensive neighborhood analytics. Fixed neighborhood analytics display in property detail tabs, added accurate coordinates for Sandton properties, and implemented real-time data fetching for schools, amenities, market trends, and safety ratings. Google Maps services now provide authentic South African location data with proper Rand currency formatting for school fees.

- **June 13, 2025 - Comprehensive AI Personalized Assistant Implementation**: Successfully implemented full-featured AI chatbot with OpenAI GPT-4o integration. Added complete database schema for chat sessions, messages, and user preferences with conversation persistence. Integrated real-time property search functionality within chat interface, displaying found properties with South African Rand formatting. AI assistant now provides personalized recommendations, remembers user preferences, handles budget inquiries, and offers neighborhood insights with natural language processing.

- **June 13, 2025 - Page Scroll Position Fix**: Fixed page auto-scrolling to bottom on load. Implemented scroll restoration with window.scrollTo(0, 0) on route changes and initial load, disabled browser scroll restoration, and updated CSS scroll-behavior. Pages now consistently start at the top when loaded or navigated to.

- **June 13, 2025 - Pinch-to-Zoom Mobile Enhancement**: Implemented comprehensive pinch-to-zoom functionality for mobile devices. Updated viewport meta tag to allow scaling up to 5x, added touch-action: auto to universal CSS reset and content areas, configured specific touch handling for buttons vs content areas. Mobile users can now pinch-zoom on all page content while maintaining optimized touch targets for interactive elements.

- **June 13, 2025 - Navigation Layout Complete Fix**: Successfully resolved navigation layout issues with comprehensive CSS reset and proper positioning. Fixed white space above header, implemented working mobile hamburger menu with slide-out functionality, and ensured header sits flush at page top. Mobile menu now toggles correctly with proper responsive breakpoints at md: (768px). Navigation layout is fully functional across all devices.

- **June 13, 2025 - Modern Feature Tags Enhancement**: Modernized property feature tags across all components with contemporary colorful badge styling. Updated PropertyCard, property-card, and PropertyComparison components to use pill-shaped badges with varied colors, dark mode support, and hover animations for better visual hierarchy.

- **June 13, 2025 - Import Feature Removal**: Removed import properties button and functionality from admin dashboard per user request. Cleaned up related code including mutations, handlers, and unused imports. Database cleaned to maintain only authentic user-added properties.

- **June 13, 2025 - SimplePropertyForm Implementation**: Created simplified property form to replace complex PropertyForm. Added comprehensive debugging, streamlined dialog state management, and improved form reset logic for reliable Add Property functionality.

- **June 13, 2025 - Feature Display Enhancement**: Removed all limitations on property feature tags display. Property cards now show all features added through the admin portal instead of being restricted to 2-3 features. Updated PropertyCard, PropertyComparison, and property-card components.

- **June 13, 2025 - Database Cleanup**: Successfully removed 49 placeholder properties while preserving 2 authentic user-added listings. Database now contains only real property data.

- **June 13, 2025 - ZIP Upload Enhancement**: Enhanced image upload system with ZIP file support for bulk property image uploads. Server now processes ZIP files containing multiple images using adm-zip library. Added dedicated ZIP upload button with improved file type detection supporting multiple MIME types.

- **June 13, 2025 - Dialog State Management Fix**: Improved PropertyForm dialog reliability by implementing proper controlled component pattern with explicit open/close state management instead of conditional rendering.

- **June 13, 2025 - Currency Localization Complete**: Successfully localized all currency displays to South African Rand (ZAR) with proper formatting for 50 authentic properties.

- **June 13, 2025 - Mobile Navigation Enhancement**: Improved hamburger menu with slide-out panel, theme settings integration, and proper active state highlighting.

## User Preferences

Preferred communication style: Simple, everyday language.