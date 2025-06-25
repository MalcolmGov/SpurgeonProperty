# Replit Production Deployment Checklist

## Pre-Deployment Verification ✅

### 1. Environment Setup
- [x] Database connected (PostgreSQL)
- [x] All secrets configured:
  - [x] DATABASE_URL
  - [x] OPENAI_API_KEY  
  - [x] ANTHROPIC_API_KEY
- [ ] Gmail credentials for email notifications
- [x] .replit configuration ready for autoscale deployment

### 2. Application Health Check
Run these tests before deploying:

```bash
# Test database connection
npm run db:push

# Test production build
npm run build

# Verify all critical features work
```

### 3. Missing Email Configuration
You'll need to add Gmail credentials for contact form notifications:
- GMAIL_USER (notification email address)
- GMAIL_PASS (Gmail app-specific password)

## Deployment Steps

### Step 1: Add Missing Secrets
Add email configuration in Replit Secrets:
- `GMAIL_USER`: Your notification email
- `GMAIL_PASS`: Gmail app-specific password

### Step 2: Test Production Build
```bash
npm run build
```

### Step 3: Deploy via Replit
1. Click the "Deploy" button in Replit header
2. Choose "Autoscale" deployment
3. Replit will build and deploy automatically
4. You'll get a production URL

### Step 4: Custom Domain (Optional)
1. After deployment, add custom domain in deployment settings
2. Update DNS records with provided CNAME
3. SSL certificate will be automatically provisioned

## Expected Results
- Production URL: `https://your-repl-name--username.replit.app`
- Automatic SSL certificate
- Scalable hosting based on traffic
- Built-in monitoring and logs

## Post-Deployment Testing
Test these features on production URL:
- [ ] Homepage loads correctly
- [ ] Property search functionality
- [ ] Admin login works
- [ ] Contact forms submit (if email configured)
- [ ] AI assistant responds
- [ ] Property detail pages load
- [ ] Image uploads work

## Cost
Replit Autoscale pricing:
- Free tier available
- Pay-per-use beyond free tier
- Typically $0-20/month for small to medium traffic