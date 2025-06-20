# Replit Deployment Steps for www.spurgeonproperty.co.za

## Pre-Deployment Checklist ✅

✅ Application is production-ready with security features
✅ Database schema is configured and working
✅ Environment variables are properly set
✅ Build configuration is optimized
✅ Domain configuration updated for spurgeonproperty.co.za

## Step 1: Verify Environment Variables

Ensure these secrets are configured in Replit:
- DATABASE_URL ✅ (Verified)
- OPENAI_API_KEY ✅ (Verified) 
- ANTHROPIC_API_KEY ✅ (Verified)
- GMAIL_USER (Optional - for email notifications)
- GMAIL_PASS (Optional - for email notifications)
- GOOGLE_MAPS_API_KEY (Optional - for neighborhood analytics)

## Step 2: Final Production Build Test

Before deploying, test the production build:
```bash
npm run build
npm run start
```

## Step 3: Deploy to Replit

1. **Click the "Deploy" button** in the top-right corner of your Replit interface
2. **Choose "Autoscale"** as your deployment option
3. **Configure deployment settings:**
   - Name: spurgeon-property
   - Region: Choose closest to South Africa (EU-West recommended)
   - Environment: Production

## Step 4: Add Custom Domain

Once deployed:
1. **Go to your deployment dashboard**
2. **Click "Domains" tab**
3. **Click "Add Domain"**
4. **Enter:** www.spurgeonproperty.co.za
5. **Replit will provide DNS records** (usually CNAME)

## Step 5: Configure DNS at Registrar

Replit will give you records like:
```
Type: CNAME
Name: www
Value: your-deployment-id.replit.app
TTL: 300
```

Add these at your domain registrar (where you bought spurgeonproperty.co.za).

## Step 6: SSL Certificate

- Replit automatically provisions SSL certificates
- Takes 5-10 minutes after DNS propagation
- Your site will be accessible via HTTPS

## Step 7: Verify Deployment

Test these URLs after deployment:
- https://www.spurgeonproperty.co.za
- https://www.spurgeonproperty.co.za/health
- https://www.spurgeonproperty.co.za/sitemap.xml

## Production Features Active

Your deployment includes:
- Security headers (Helmet.js)
- Rate limiting protection
- Performance monitoring
- SEO optimization
- Error handling
- Admin authentication
- Lead management system
- AI chatbot integration

## Monitoring

Access deployment logs and metrics:
- Replit deployment dashboard
- `/health` endpoint for status
- `/api/metrics` for performance data

## Troubleshooting

Common issues:
- **DNS not resolving:** Wait up to 48 hours for propagation
- **SSL errors:** Verify DNS is pointing to Replit correctly
- **App not starting:** Check deployment logs for errors
- **Database issues:** Verify DATABASE_URL is correct

## Support

- Replit deployment documentation: docs.replit.com
- Domain registrar support for DNS issues
- Application logs available in deployment dashboard

## Cost

Replit Autoscale pricing:
- Free tier: Limited compute
- Always-on: $7+/month
- Scales automatically with traffic