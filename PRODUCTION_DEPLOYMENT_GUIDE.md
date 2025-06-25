# Spurgeon Property - Production Deployment Guide

## Quick Start - Railway (Recommended for Easiest Migration)

Railway offers the smoothest transition from Replit with minimal configuration.

### Step 1: Prepare Your Code

1. **Export your Replit project**:
   - Download as ZIP or clone the Git repository
   - Ensure all files are included

2. **Create GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/spurgeon-property.git
   git push -u origin main
   ```

### Step 2: Database Migration

1. **Export current database**:
   ```bash
   # Connect to your current Neon database
   pg_dump $DATABASE_URL > spurgeon_backup.sql
   ```

2. **Create new production database** (options):
   - **Railway PostgreSQL** (recommended): Automatically provisioned
   - **Neon** (keep current): No migration needed
   - **Supabase**: Free tier available

### Step 3: Railway Deployment

1. **Sign up for Railway**: https://railway.app
2. **Connect GitHub**: Link your repository
3. **Create new project**: "Deploy from GitHub repo"
4. **Add PostgreSQL service**: Click "Add Service" → "PostgreSQL"
5. **Configure environment variables**:

   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   OPENAI_API_KEY=sk-your-openai-key
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
   GMAIL_USER=your-notification-email@gmail.com
   GMAIL_PASS=your-app-specific-password
   NODE_ENV=production
   PORT=3000
   ```

6. **Deploy**: Railway will automatically build and deploy

### Step 4: Database Setup

1. **Import data** (if using new database):
   ```bash
   # Connect to Railway PostgreSQL
   psql $DATABASE_URL < spurgeon_backup.sql
   ```

2. **Run migrations**:
   ```bash
   npm run db:push
   ```

### Step 5: Custom Domain (Optional)

1. **Railway custom domain**:
   - Go to project settings → Domains
   - Add your domain (e.g., spurgeonproperty.com)
   - Update DNS with provided CNAME record

**Expected Cost**: $5-20/month depending on usage

---

## Alternative Option - Render

Render offers reliable hosting with good pricing for small to medium applications.

### Step 1: Render Setup

1. **Sign up**: https://render.com
2. **Connect GitHub**: Link your repository
3. **Create Web Service**:
   - Select your repo
   - Build command: `npm run build`
   - Start command: `npm start`

### Step 2: Environment Variables

Add in Render dashboard:
```
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
NODE_ENV=production
```

### Step 3: Database

1. **Create PostgreSQL service** in Render
2. **Connect to web service** via DATABASE_URL
3. **Import data** and run migrations

**Expected Cost**: $7-25/month

---

## Professional Option - DigitalOcean App Platform

For more control and better performance, DigitalOcean offers excellent value.

### Step 1: DigitalOcean Setup

1. **Create account**: https://digitalocean.com
2. **App Platform**: Create new app from GitHub
3. **Configure app**:
   - Runtime: Node.js
   - Build command: `npm run build`
   - Run command: `npm start`

### Step 2: Database

1. **Managed PostgreSQL**: Create database cluster
2. **Connection**: Use provided DATABASE_URL
3. **Import data**: Use connection details

### Step 3: Environment Variables

Configure in app settings with same variables as above.

**Expected Cost**: $12-25/month

---

## Enterprise Option - AWS/Vercel

### Vercel (Frontend + Serverless)

1. **Deploy frontend**: `vercel --prod`
2. **Serverless functions**: Convert API routes to Vercel functions
3. **External database**: Use Neon, PlanetScale, or Supabase

### AWS (Full Control)

1. **EC2 instance**: t3.small or larger
2. **RDS PostgreSQL**: Managed database
3. **Application Load Balancer**: For SSL and routing
4. **Route 53**: DNS management

**Expected Cost**: $20-50+/month

---

## Pre-Deployment Checklist

### 1. Environment Variables Setup

Ensure you have all required variables:
- ✅ DATABASE_URL
- ✅ OPENAI_API_KEY
- ✅ ANTHROPIC_API_KEY
- ✅ GMAIL_USER
- ✅ GMAIL_PASS
- ✅ NODE_ENV=production

### 2. Database Preparation

```bash
# Test database connection
npm run db:push

# Verify data integrity
# Check that admin users exist with correct email whitelist
```

### 3. Build Testing

```bash
# Test production build locally
npm run build
npm start

# Verify all features work:
# - Property search and filtering
# - Admin authentication
# - Contact forms and email notifications
# - AI assistant functionality
# - Image and video uploads
```

### 4. Security Configuration

- ✅ Rate limiting enabled
- ✅ CORS configured for production domain
- ✅ Helmet security headers active
- ✅ Admin access restricted to authorized emails

### 5. Performance Optimization

```bash
# Verify build outputs
ls -la dist/
# Should see optimized client and server bundles
```

---

## Domain & SSL Setup

### 1. Domain Configuration

For custom domain (spurgeonproperty.com):

1. **DNS Records**:
   ```
   Type: CNAME
   Name: www
   Value: [platform-provided-url]
   
   Type: A (or CNAME)
   Name: @
   Value: [platform-ip-or-url]
   ```

2. **SSL Certificate**: Most platforms provide automatic SSL

### 2. Update Application URLs

Update any hardcoded URLs in the application:
- Email templates
- Sitemap generation
- Open Graph URLs

---

## Post-Deployment Verification

### 1. Functionality Testing

Test all critical features:
- [ ] Homepage loads correctly
- [ ] Property search and filtering
- [ ] Individual property pages
- [ ] Contact forms submit successfully
- [ ] Admin login and property management
- [ ] AI assistant responds correctly
- [ ] Email notifications sent
- [ ] Image/video uploads work

### 2. Performance Testing

- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] Images properly compressed

### 3. SEO Verification

- [ ] Meta tags present
- [ ] Sitemap accessible (/sitemap.xml)
- [ ] Robots.txt configured
- [ ] Structured data valid

---

## Monitoring & Maintenance

### 1. Application Monitoring

Set up monitoring for:
- Uptime monitoring
- Error tracking
- Performance metrics
- Database health

### 2. Regular Maintenance

- Weekly database backups
- Monthly dependency updates
- Security patch monitoring
- Performance optimization

---

## Troubleshooting Common Issues

### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check environment variables
echo $DATABASE_URL
```

### Email Delivery Problems
- Verify Gmail app password
- Check SMTP settings
- Test with simple email first

### AI API Issues
- Verify API keys are correct
- Check API usage limits
- Test with simple requests

---

## Recommended: Railway Deployment

For the smoothest experience, I recommend Railway:

1. **Easy setup**: Connects directly to GitHub
2. **Integrated database**: PostgreSQL included
3. **Automatic SSL**: Custom domains supported
4. **Fair pricing**: Pay for what you use
5. **Good support**: Excellent documentation

**Next Steps**: 
1. Create GitHub repository with your code
2. Sign up for Railway account
3. Deploy from GitHub repo
4. Add PostgreSQL service
5. Configure environment variables
6. Test deployment

The entire process should take 30-60 minutes for a working production deployment.