# Spurgeon Property - Custom Domain Deployment Guide
## Deploy to www.spurgeonproperty.com

This guide provides multiple deployment options for your Spurgeon Property application on your existing domain.

## Current Status
- **Domain**: www.spurgeonproperty.com
- **Current Host**: SA Webs (SEO/Web Design company)
- **Application**: Full-stack Node.js with React frontend
- **Database**: PostgreSQL (Neon)
- **Features**: AI integration, email notifications, file uploads

## Important Discovery
SA Webs appears to be primarily an SEO and web design company, not a traditional web hosting provider. They focus on WordPress websites and SEO services rather than application hosting. This means you'll need to migrate to a proper hosting solution.

## Deployment Options

### Option 1: Deploy with SA Webhosts (If Node.js Supported)

#### Step 1: Verify Node.js Support
1. **Login to your SA Webhosts cPanel**
2. **Look for these features:**
   - "Node.js Apps" or "Setup Node.js App"
   - "Terminal" or "SSH Access"
   - "File Manager" with extraction capabilities

#### Step 2: Prepare Application Package
Create a deployment package:
```bash
# Create production build
npm run build

# Create deployment package (exclude node_modules)
tar -czf spurgeon-property-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=uploads \
  --exclude=temp \
  --exclude=__pycache__ \
  .
```

#### Step 3: Upload and Deploy
1. **Upload** `spurgeon-property-deploy.tar.gz` to your domain root
2. **Extract** the archive in File Manager
3. **Install dependencies** via SSH or terminal:
   ```bash
   npm install --production
   ```
4. **Configure Node.js App:**
   - App URL: www.spurgeonproperty.com
   - App Root: /public_html
   - Startup File: server/index.js
   - Node.js Version: 18.x or latest

#### Step 4: Configure Environment Variables
Add these in your hosting control panel:
```
DATABASE_URL=your_neon_database_url
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GMAIL_USER=your_gmail_user
GMAIL_PASS=your_gmail_app_password
NODE_ENV=production
```

### Option 2: Migrate to Node.js-Capable South African Hosting

#### Recommended Providers:

**TrueHost Africa**
- **Cost**: From R150/month
- **Features**: Confirmed Node.js support, SSH access, Git deployment
- **Process:**
  1. Purchase hosting plan
  2. Update nameservers at your domain registrar
  3. Deploy application via Git or upload
  4. Configure SSL certificate

**MilesWeb South Africa**
- **Cost**: From R45/month ($2.52)
- **Features**: Multiple Node.js versions, SSD storage, free SSL
- **Process:**
  1. Purchase hosting plan
  2. Transfer domain or update DNS
  3. Deploy application via cPanel Node.js Apps
  4. Configure environment variables

### Option 3: Keep Domain, Use Cloud Hosting

#### DigitalOcean App Platform
1. **Create DigitalOcean account**
2. **Deploy from GitHub:**
   - Connect your repository
   - Configure build commands
   - Set environment variables
3. **Add Custom Domain:**
   - Go to App Settings > Domains
   - Add www.spurgeonproperty.com
   - Update DNS records at SA Webhosts

#### Required DNS Changes (at SA Webhosts):
```
Type: A
Name: www
Value: [DigitalOcean IP provided]

Type: CNAME
Name: @
Value: www.spurgeonproperty.com
```

### Option 4: Hybrid Approach (Recommended)

Keep your domain with SA Webhosts but deploy on a Node.js platform:

1. **Deploy on Replit** (already done)
2. **Configure DNS at SA Webhosts:**
   ```
   Type: A
   Name: www
   Value: [Replit IP]
   
   Type: CNAME
   Name: @
   Value: [Replit app URL]
   ```

## Production Checklist

### Before Deployment:
- [ ] Test all features locally
- [ ] Verify environment variables
- [ ] Check database connectivity
- [ ] Test email notifications
- [ ] Verify file upload functionality
- [ ] Test AI integrations

### During Deployment:
- [ ] Upload application files
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up SSL certificate
- [ ] Configure domain DNS
- [ ] Test application functionality

### After Deployment:
- [ ] Test all API endpoints
- [ ] Verify database operations
- [ ] Check email notifications
- [ ] Test file uploads
- [ ] Verify AI features
- [ ] Test mobile responsiveness

## Troubleshooting Common Issues

### Node.js Not Supported
**Solution**: Migrate to Node.js-capable hosting or use cloud platform with DNS pointing

### Database Connection Issues
**Solution**: Verify DATABASE_URL and check firewall settings

### File Upload Problems
**Solution**: Ensure proper permissions on uploads directory (755 or 777)

### Email Notifications Not Working
**Solution**: Verify Gmail app password and SMTP settings

### SSL Certificate Issues
**Solution**: Most hosting providers offer free Let's Encrypt certificates

## Performance Optimization

### For Production:
1. **Enable compression** (gzip)
2. **Configure CDN** for static assets
3. **Set up monitoring** for uptime
4. **Enable caching** for API responses
5. **Optimize database queries**

## Support Contacts

### If You Need Help:
1. **SA Webhosts Support**: Contact for Node.js capability confirmation
2. **TrueHost Africa**: +27 (0) 87 550 2638
3. **MilesWeb**: 24/7 support available

## Next Steps

1. **Immediate**: Contact SA Webhosts to confirm Node.js support
2. **If supported**: Follow Option 1 deployment steps
3. **If not supported**: Choose Option 2 or 3 based on your preference
4. **Alternative**: Use Option 4 for fastest deployment

Would you like me to help with any specific deployment option or create additional configuration files?