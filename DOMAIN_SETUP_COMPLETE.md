# Custom Domain Setup - spurgeonproperty.co.za

## Step 1: Add Domain to Replit Deployment

1. **Access Deployment Dashboard**:
   - Go to your Replit deployment dashboard
   - Click on your deployed project
   - Navigate to "Settings" or "Domains" section

2. **Add Custom Domain**:
   - Click "Add Custom Domain"
   - Enter: `spurgeonproperty.co.za`
   - Also add: `www.spurgeonproperty.co.za` (recommended)
   - Save the configuration

3. **Get DNS Records**:
   Replit will provide you with DNS records similar to:
   ```
   Type: CNAME
   Name: www
   Value: your-repl-name--username.replit.app
   
   Type: A or CNAME  
   Name: @
   Value: [Replit provided IP/URL]
   ```

## Step 2: Configure DNS at Domain Registrar

1. **Access DNS Management**:
   - Log into your domain registrar (where you bought spurgeonproperty.co.za)
   - Navigate to DNS management or DNS settings

2. **Add DNS Records**:
   ```
   Type: CNAME
   Name: www
   Value: [your-replit-deployment-url]
   TTL: 300 (5 minutes)
   
   Type: A (or CNAME as provided)
   Name: @
   Value: [Replit provided value]
   TTL: 300
   ```

3. **Save DNS Changes**:
   - Apply/save the DNS configuration
   - Changes may take 5-60 minutes to propagate

## Step 3: SSL Certificate

- **Automatic SSL**: Replit automatically provisions SSL certificates
- **Verification**: SSL typically activates within 15-45 minutes
- **Status Check**: Monitor in Replit deployment dashboard

## Step 4: Application Configuration ✅ COMPLETE

Your application is already configured for spurgeonproperty.co.za:

### CORS Configuration ✅
```javascript
// Already configured in server/index.ts
origin: [
  'https://spurgeonproperty.co.za',
  'https://www.spurgeonproperty.co.za',
  'https://spurgeonproperty.com',
  'https://www.spurgeonproperty.com'
]
```

### Update Sitemap and SEO
```javascript
// Update canonical URLs in meta tags
const canonicalUrl = 'https://www.spurgeonproperty.co.za';
```

## Step 5: Verification Steps

1. **DNS Propagation Check**:
   - Use online DNS checker tools
   - Verify CNAME records point correctly

2. **SSL Certificate Verification**:
   - Check https://spurgeonproperty.co.za loads with SSL
   - Verify certificate details in browser

3. **Functionality Testing**:
   - Test all pages load correctly
   - Verify contact forms work
   - Check admin login functions
   - Confirm API endpoints respond

## Step 6: Post-Deployment Optimizations

### Google Search Console
1. Add both domains:
   - https://spurgeonproperty.co.za
   - https://www.spurgeonproperty.co.za
2. Submit sitemap: `https://www.spurgeonproperty.co.za/sitemap.xml`

### Analytics Setup
- Add Google Analytics to track visitors
- Configure conversion tracking for contact forms

### Performance Monitoring
- Set up uptime monitoring
- Configure performance alerts

## Expected Timeline

- **DNS Propagation**: 5-60 minutes
- **SSL Certificate**: 15-45 minutes  
- **Full Activation**: 1-2 hours maximum

## Troubleshooting

### Common Issues
1. **DNS Not Propagating**: Wait longer or check TTL settings
2. **SSL Pending**: Normal for first 45 minutes
3. **Redirect Loops**: Check domain configuration in Replit

### Support Resources
- Replit Documentation: Custom domains section
- DNS Checker Tools: whatsmydns.net
- SSL Checker: ssllabs.com/ssltest

## Final Configuration

Once complete, your site will be accessible at:
- Primary: https://www.spurgeonproperty.co.za
- Alternative: https://spurgeonproperty.co.za

Both domains will have automatic SSL certificates and will serve your full Spurgeon Property platform with all features operational.