# Spurgeon Property - South African Real Estate Platform

A comprehensive full-stack property management platform built for the South African real estate market, featuring intelligent performance tracking, AI-powered search assistance, and advanced property catalogue generation.

## 🏠 Live Demo

- **Production Site**: [www.spurgeonproperty.co.za](https://www.spurgeonproperty.co.za)
- **Development Site**: [spurgeon-property--malcolm36.replit.app](https://spurgeon-property--malcolm36.replit.app)

## 🚀 Features

### Core Functionality
- **Complete Property Management**: Create, edit, and manage property listings with comprehensive details
- **Advanced Search & Filtering**: Multi-criteria search by price, location, type, bedrooms, bathrooms
- **Agent Management**: Dedicated agent profiles with contact information and assignment system
- **Lead Generation**: Contact forms with automated email notifications and lead tracking
- **Admin Dashboard**: Secure admin portal with authentication and comprehensive management tools

### Advanced Features
- **AI-Powered Assistant**: OpenAI and Anthropic integration for intelligent property search
- **Google Maps Integration**: Interactive maps with neighborhood analytics and location services
- **Property Status Management**: Active, Sold, Rented status with visual indicators
- **Featured Properties**: Spotlight system for premium listings
- **Mobile-Responsive Design**: Optimized for all devices with touch-friendly interfaces
- **Email Notifications**: Automated notifications via Gmail/SendGrid integration
- **PDF Generation**: Professional property listing PDFs using Python ReportLab
- **Video Support**: Property video uploads and streaming capabilities

### Recent Updates
- **Sale/Rental Badges**: Consistent blue badges for rentals, green badges for sales
- **POA (Price on Application)**: Automatic fallback when sale price is not specified
- **Enhanced Featured Properties**: Increased homepage display from 3 to 9 properties
- **Improved Mobile Experience**: Touch-optimized interactions and responsive layouts

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized production builds
- **Tailwind CSS** with custom design system (purple/orange branding)
- **Radix UI** primitives with shadcn/ui components
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing
- **Framer Motion** for smooth animations and transitions

### Backend
- **Node.js** with Express.js REST API
- **TypeScript** for full-stack type safety
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** via Neon serverless database
- **Multer** for file uploads (images and videos)
- **bcrypt** for secure password hashing
- **WebSocket** integration for real-time notifications

### AI & External Services
- **OpenAI GPT-4** for property description generation
- **Anthropic Claude** for conversational AI assistance
- **Google Maps API** for location services and neighborhood analytics
- **SendGrid/Gmail** for email notifications
- **Python ReportLab** for professional PDF generation

## 🏗️ Architecture

### Database Schema
- **Properties**: Core property listings with images, features, and location data
- **Agents**: Real estate agent profiles and contact information
- **Leads**: Customer inquiries and contact requests
- **Admin Users**: Administrative accounts with session management

### Security Features
- **Admin Access Control**: Whitelist-based authentication for authorized users only
- **Session Management**: Secure admin sessions with bcrypt password hashing
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key (optional, for AI features)
- Anthropic API key (optional, for AI assistant)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/spurgeon-property.git
   cd spurgeon-property
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📋 Environment Variables

### Required
```env
DATABASE_URL=postgresql://username:password@localhost:5432/spurgeon_property
NODE_ENV=development
```

### Optional (for full functionality)
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
GOOGLE_MAPS_API_KEY=your-google-maps-key
SENDGRID_API_KEY=your-sendgrid-key
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                 # Express.js backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle database schema
└── uploads/               # File uploads directory
```

## 📱 Admin Dashboard

Access the admin portal at `/admin` with authorized credentials:
- peter@spurgeonproperty.com
- veruschkia@spurgeonproperty.com
- reshma.kila@evogroup.co.za
- malcolmgov24@gmail.com

### Admin Features
- Property management (create, edit, delete)
- Lead management and agent assignment
- Analytics and reporting
- User management
- System monitoring

## 🌍 Deployment

### Replit Deployment (Current)
The application is currently deployed on Replit with automatic scaling and SSL.

### Alternative Deployment Options
- **Vercel**: Excellent for full-stack applications
- **Railway**: Great for PostgreSQL applications
- **Netlify**: Good for static sites with serverless functions
- **DigitalOcean**: VPS option with more control

### Custom Domain Setup
DNS configuration for www.spurgeonproperty.co.za is already complete with proper CNAME records.

## 📊 Performance

- **API Response Times**: 40-150ms average
- **Database Queries**: Optimized with proper indexing
- **Frontend Bundle**: Optimized with code splitting
- **Image Optimization**: Automatic compression and resizing

## 🔒 Security

- **Authentication**: Secure admin login with session management
- **Authorization**: Role-based access control
- **Data Validation**: Comprehensive input validation with Zod
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **Rate Limiting**: API protection against abuse

## 📈 Analytics & Monitoring

- **Performance Monitoring**: Response time tracking
- **Error Logging**: Comprehensive error tracking
- **Business Analytics**: Lead conversion tracking
- **Health Checks**: Automated system health monitoring

## 🤝 Contributing

This is a proprietary project for Spurgeon Property. For authorized contributors:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For technical support or inquiries:
- **Developer**: malcolmgov24@gmail.com
- **Owner**: peter@spurgeonproperty.com
- **Documentation**: See `replit.md` for comprehensive project details

## 📄 License

This project is proprietary software owned by Spurgeon Property. All rights reserved.

## 🏆 Acknowledgments

- Built with modern React and TypeScript
- Styled with Tailwind CSS and Radix UI
- Powered by PostgreSQL and Drizzle ORM
- AI features by OpenAI and Anthropic
- Maps and location services by Google Maps API

---

**Spurgeon Property** - Your Gateway to Premium Properties in South Africa