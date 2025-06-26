# SSL Certificate Issue Resolution Guide

## Problem Identified
Domain www.spurgeonproperty.co.za has SSL certificate mismatch - using *.replit.app certificate instead of custom domain certificate.

## Root Cause
Replit's automatic SSL provisioning for custom domains has not completed or failed to provision a certificate for www.spurgeonproperty.co.za

## Solution Steps

### 1. Verify DNS Configuration
Current DNS settings should be:
- CNAME: www.spurgeonproperty.co.za → spurgeon-property--malcolm36.replit.app
- A Record: spurgeonproperty.co.za → 34.111.179.208

### 2. Replit Deployment Dashboard Actions
1. Go to Replit Deployment Dashboard
2. Navigate to Custom Domains section
3. Remove www.spurgeonproperty.co.za domain
4. Wait 5 minutes for DNS cache to clear
5. Re-add www.spurgeonproperty.co.za domain
6. Trigger SSL certificate provisioning

### 3. Alternative: Use Root Domain
If SSL issues persist, configure:
- Remove www subdomain
- Use spurgeonproperty.co.za (root domain)
- Add A record pointing to Replit's IP
- This often resolves SSL provisioning issues

### 4. DNS Propagation Check
SSL certificates can take 15-45 minutes to provision after DNS changes.
Check status at: https://dnschecker.org

### 5. Application Configuration Updates
Update CORS origins in server/index.ts to match final domain configuration.

## Timeline
- DNS changes: Immediate
- SSL provisioning: 15-45 minutes
- Full propagation: Up to 2 hours

## Verification Commands
```bash
# Check SSL certificate
openssl s_client -connect domain:443 -servername domain

# Check DNS resolution
curl -I https://domain

# Verify certificate matches domain
curl -v https://domain 2>&1 | grep "subject:"
```

## Next Steps for User
1. Access Replit Deployment Dashboard
2. Remove and re-add custom domain
3. Monitor SSL certificate provisioning status
4. Test domain access after 30 minutes