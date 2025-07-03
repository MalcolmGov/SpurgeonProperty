# Spurgeon Property - GitHub Backup Instructions

## Project Overview
This is a comprehensive backup guide for the Spurgeon Property platform - a full-stack real estate management system built with React, Node.js, TypeScript, and PostgreSQL.

## Prerequisites
1. GitHub account
2. Git installed locally (or use GitHub Desktop)
3. Access to your Replit project files

## Method 1: Direct Upload to GitHub (Recommended for beginners)

### Step 1: Create New Repository
1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Repository name: `spurgeon-property-platform`
4. Description: `Professional real estate management platform for South African market`
5. Set to **Public** or **Private** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we'll upload existing files)
7. Click "Create repository"

### Step 2: Download Project Files
Since Git operations are restricted in this Replit environment, download these key files manually:

**Core Application Files:**
- `package.json` - Dependencies and scripts
- `package-lock.json` - Exact dependency versions
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Styling configuration
- `drizzle.config.ts` - Database configuration
- `components.json` - UI component configuration
- `replit.md` - Project documentation and architecture

**Source Code Directories:**
- `client/` - Frontend React application
- `server/` - Backend Node.js/Express API
- `shared/` - Shared TypeScript types and schemas

**Python PDF System:**
- `property_pdf_generator.py` - Professional PDF generation system
- `enhanced_property_pdf_generator.py` - Enhanced PDF generator
- `generate_catalogue_pdf.py` - Catalogue generation script
- `generate_single_pdf.py` - Single property PDF script
- `demo_pdf_generation.py` - Demo and testing script

**Documentation:**
- All `.md` files in root directory (deployment guides, specifications, etc.)

### Step 3: Upload to GitHub
1. On your new repository page, click "uploading an existing file"
2. Drag and drop or select all downloaded files
3. Ensure folder structure is maintained (client/, server/, shared/)
4. Add commit message: "Initial commit - Spurgeon Property platform"
5. Click "Commit changes"

## Method 2: Command Line Git (For experienced users)

If you have a local development environment:

```bash
# Clone the empty repository
git clone https://github.com/yourusername/spurgeon-property-platform.git
cd spurgeon-property-platform

# Copy all your project files to this directory
# (maintain the folder structure: client/, server/, shared/)

# Initialize Git tracking
git add .
git commit -m "Initial commit - Spurgeon Property platform"
git branch -M main
git push -u origin main
```

## Method 3: Using GitHub Desktop

1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Sign in with your GitHub account
3. Click "Clone a repository from the Internet"
4. Select your `spurgeon-property-platform` repository
5. Choose local folder location
6. Copy all project files into the cloned folder
7. GitHub Desktop will detect changes
8. Add commit message and click "Commit to main"
9. Click "Push origin"

## Important Files to Include

### Essential Configuration Files:
```
├── package.json                    # Node.js dependencies
├── package-lock.json               # Dependency lock file
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Build configuration
├── tailwind.config.ts              # Styling config
├── drizzle.config.ts               # Database config
├── components.json                 # UI components
└── replit.md                       # Project documentation
```

### Source Code Structure:
```
├── client/                         # Frontend React app
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Route pages
│   │   ├── hooks/                 # Custom hooks
│   │   ├── lib/                   # Utilities
│   │   └── main.tsx               # Entry point
├── server/                         # Backend Node.js
│   ├── routes.ts                  # API endpoints
│   ├── storage.ts                 # Database operations
│   └── vite.ts                    # Server setup
├── shared/                         # Shared code
│   └── schema.ts                  # Database schema
└── uploads/                        # Property images (optional)
```

### Python PDF Generation System:
```
├── property_pdf_generator.py       # Main PDF generator
├── enhanced_property_pdf_generator.py  # Enhanced version
├── generate_catalogue_pdf.py       # Catalogue script
├── generate_single_pdf.py          # Single property script
└── demo_pdf_generation.py          # Demo/testing
```

## Environment Variables to Document

Create a `.env.example` file with:
```
# Database
DATABASE_URL=your_postgresql_connection_string

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Email
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# Development
NODE_ENV=production
```

## .gitignore File

Create a `.gitignore` file:
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# uploads directory (contains user uploaded images)
uploads/
temp/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Cache directories
.cache/

# Replit specific
.replit
replit.nix
```

## Repository Description

Use this description for your GitHub repository:

**Title:** Spurgeon Property - Professional Real Estate Platform

**Description:**
```
A comprehensive full-stack property management platform built for the South African real estate market. Features include:

🏠 Property Listings & Management
🔍 Advanced Search & Filtering  
🗺️ Interactive Maps & Location Analytics
🤖 AI-Powered Property Assistant
📱 Mobile-Responsive Design
📊 Admin Dashboard & Analytics
📧 Lead Management & Email Notifications
📄 Professional PDF Catalogue Generation
🎨 Modern UI with Purple/Orange Branding

Tech Stack: React, TypeScript, Node.js, Express, PostgreSQL, Drizzle ORM, Tailwind CSS, OpenAI, Anthropic Claude, Python ReportLab

Deployed on Replit with custom domain: www.spurgeonproperty.co.za
```

## Next Steps After Backup

1. **Set up branch protection** (Settings → Branches)
2. **Add collaborators** if needed (Settings → Manage access)
3. **Enable Issues** for bug tracking
4. **Add deployment workflows** using GitHub Actions
5. **Set up automated backups** of your database

## Contact & Support

- **Developer:** Malcolm (malcolmgov24@gmail.com)
- **Platform:** Spurgeon Property Team
- **Domain:** www.spurgeonproperty.co.za

---

*This backup was created on June 29, 2025. The platform includes 22 active properties, comprehensive admin management, AI integration, and professional PDF generation capabilities.*