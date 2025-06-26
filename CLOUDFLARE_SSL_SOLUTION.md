# Cloudflare SSL Solution for Replit Deployments

## Overview
Bypass Replit's SSL certificate issues by using Cloudflare as an SSL proxy.

## Setup Steps

### 1. Cloudflare Account Setup
1. Create free Cloudflare account
2. Add spurgeonproperty.co.za to Cloudflare
3. Update nameservers at your domain registrar to Cloudflare's nameservers

### 2. DNS Configuration in Cloudflare
```
Type: CNAME
Name: www
Target: spurgeon-property--malcolm36.replit.app
Proxy: ON (orange cloud)

Type: CNAME  
Name: @
Target: spurgeon-property--malcolm36.replit.app
Proxy: ON (orange cloud)
```

### 3. SSL Settings in Cloudflare
- SSL/TLS mode: "Flexible" or "Full"
- Edge Certificates: Enabled (automatic)
- Always Use HTTPS: Enabled

### 4. Application Configuration Updates
Update CORS origins to include Cloudflare-proxied domains:
```javascript
origin: [
  'https://spurgeonproperty.co.za',
  'https://www.spurgeonproperty.co.za'
]
```

## Benefits
- Immediate SSL certificate provisioning
- CDN acceleration 
- DDoS protection
- Better reliability than Replit's SSL
- Free tier available

## Timeline
- Setup: 10-15 minutes
- DNS propagation: 5-60 minutes
- SSL active: Immediate after DNS propagation

## Result
- spurgeonproperty.co.za → SSL working
- www.spurgeonproperty.co.za → SSL working
- Both domains serve your Replit application securely