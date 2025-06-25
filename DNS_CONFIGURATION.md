# DNS Configuration Guide - spurgeonproperty.co.za

## Quick Setup Steps

### 1. Access Replit Deployment Dashboard
1. Go to your Replit project
2. Click the "Deploy" tab
3. Navigate to deployed project settings
4. Click "Domains" or "Custom Domain"

### 2. Add Your Domain
1. Click "Add Custom Domain"
2. Enter: `www.spurgeonproperty.co.za`
3. Also add: `spurgeonproperty.co.za` 
4. Replit will provide DNS records

### 3. Replit DNS Records
You'll receive records similar to:
```
Type: CNAME
Name: www
Value: spurgeon-property--username.replit.app
TTL: 300

Type: A or CNAME
Name: @
Value: [Replit IP/hostname]
TTL: 300
```

### 4. Configure at Domain Registrar
Log into your .co.za domain provider and add these DNS records:

#### For Afrihost (.co.za provider)
1. Login to Afrihost Client Zone
2. Go to "Domain Management"
3. Select spurgeonproperty.co.za
4. Click "DNS Records"
5. Add the CNAME and A records from Replit

#### For Other South African Providers
- **Hetzner**: DNS Console → dns.hetzner.com
- **Internet Solutions**: IS Control Panel → DNS Management
- **Web Africa**: Client Portal → DNS Section
- **Register.co.za**: Domain Management → DNS Settings

### 5. DNS Record Setup
```
Record Type: CNAME
Name/Host: www
Value/Points to: [from Replit dashboard]
TTL: 300 seconds

Record Type: A (if CNAME not supported)
Name/Host: @
Value/Points to: [IP from Replit]
TTL: 300 seconds
```

## Timeline
- **DNS Saving**: Immediate
- **Propagation**: 5-60 minutes (South African domains typically faster)
- **SSL Certificate**: 15-45 minutes after DNS propagates
- **Full Activation**: 1-2 hours maximum

## Verification Tools
- DNS Checker: https://www.whatsmydns.net/
- SSL Checker: https://www.ssllabs.com/ssltest/
- South African DNS: https://dns.google/query?name=spurgeonproperty.co.za

## Post-Setup
Once DNS propagates:
1. Test: https://www.spurgeonproperty.co.za
2. Verify SSL certificate is active
3. Test all site functionality
4. Submit sitemap to Google Search Console

## Support
- Replit Discord: For deployment issues
- Domain Registrar: For DNS configuration help
- DNS Propagation typically takes 5-60 minutes in South Africa