# Replit Deployment Guide for www.spurgeonproperty.co.za

## Current Replit Configuration

Your project is already configured for Replit Deployments:
- Deployment target: `autoscale` 
- Build command: `npm run build`
- Run command: `npm run start`
- Port configuration: 5000 → 80

## Steps to Deploy with Custom Domain

### 1. Deploy to Replit
1. Click the **Deploy** button in your Replit project
2. Choose **Autoscale Deployment** 
3. Replit will build and deploy your application
4. You'll get a `.replit.app` URL initially

### 2. Add Custom Domain
1. In your deployment dashboard, click **Domains**
2. Click **Add Domain**
3. Enter: `www.spurgeonproperty.co.za`
4. Replit will provide you with DNS records

### 3. DNS Records from Replit
Replit will give you these records to add at your domain registrar:

```
Type: CNAME
Name: www
Value: [your-deployment].replit.app
TTL: 300

Type: A (if CNAME not supported)
Name: www  
Value: [Replit's IP address]
TTL: 300
```

### 4. Configure at Domain Registrar
1. Go to your domain registrar's DNS settings
2. Add the CNAME or A record provided by Replit
3. Wait for DNS propagation (up to 48 hours)

### 5. SSL Certificate
- Replit automatically provisions SSL certificates
- HTTPS will be enabled once DNS propagates
- No additional configuration needed

## Alternative: Get Current Replit URL

Your current development URL format would be:
`https://[project-name]--[username].replit.app`

To find your exact URL:
1. Click **Open in new tab** while running your project
2. Copy the `.replit.app` URL shown
3. Use this temporarily while setting up custom domain

## Benefits of Replit Deployment

- **Automatic scaling** based on traffic
- **SSL certificates** managed automatically  
- **Global CDN** for fast loading
- **Zero server management** required
- **Built-in monitoring** and logs
- **Custom domain support** with DNS guidance

## Production Environment Variables

Before deploying, ensure these are set in Replit Secrets:
- `DATABASE_URL` (your Neon PostgreSQL URL)
- `OPENAI_API_KEY` (for AI features)
- `ANTHROPIC_API_KEY` (for chatbot)
- `GMAIL_USER` and `GMAIL_PASS` (for email notifications)
- `GOOGLE_MAPS_API_KEY` (for neighborhood analytics)

## Deployment Checklist

- [ ] All environment variables configured in Secrets
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Application tested in development
- [ ] Click Deploy button in Replit
- [ ] Add custom domain in deployment settings
- [ ] Configure DNS records at registrar
- [ ] Verify SSL certificate activation
- [ ] Test production deployment

## Cost Considerations

Replit Autoscale pricing:
- Free tier: Limited compute time
- Paid plans: Start at $7/month for always-on
- Scaling based on actual usage
- No server maintenance costs

## Support

If you encounter issues:
1. Check Replit deployment logs
2. Verify DNS propagation with online tools
3. Contact Replit support for deployment issues
4. Contact domain registrar for DNS issues