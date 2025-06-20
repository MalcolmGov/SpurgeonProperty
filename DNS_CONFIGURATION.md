# DNS Configuration Guide for spurgeonproperty.co.za

## Current Status
The domain www.spurgeonproperty.co.za is not currently resolving. This means the DNS records need to be configured to point to your hosting server.

## Required DNS Records

### A Records (IPv4)
```
Type: A
Name: @ (root domain)
Value: [Your server IP address]
TTL: 300

Type: A  
Name: www
Value: [Your server IP address]
TTL: 300
```

### CNAME Records (Alternative for www)
```
Type: CNAME
Name: www
Value: spurgeonproperty.co.za
TTL: 300
```

### Additional Recommended Records

#### MX Records (Email)
```
Type: MX
Name: @
Value: [Your email server]
Priority: 10
TTL: 300
```

#### TXT Records (Verification & Security)
```
Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"
TTL: 300

Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=none; rua=mailto:admin@spurgeonproperty.co.za"
TTL: 300
```

## Steps to Configure DNS

### 1. Access Your Domain Registrar
- Log into your domain registrar's control panel
- Navigate to DNS management section
- Look for "DNS Records", "DNS Zone", or "Name Servers"

### 2. Add Required Records
- Add the A records pointing to your server IP
- Add the www CNAME or A record
- Configure any additional records needed

### 3. Wait for Propagation
- DNS changes can take 24-48 hours to fully propagate
- Use online DNS checker tools to monitor propagation
- Test with: `nslookup www.spurgeonproperty.co.za`

## Server Configuration Required

### 1. Web Server Setup
Configure your web server (nginx/Apache) to serve:
- spurgeonproperty.co.za
- www.spurgeonproperty.co.za

### 2. SSL Certificate
Obtain SSL certificates for both:
- spurgeonproperty.co.za
- www.spurgeonproperty.co.za

### 3. Redirect Configuration
Set up redirects to ensure consistency:
- Redirect HTTP to HTTPS
- Choose primary domain (recommend www.spurgeonproperty.co.za)

## Application Updates Made

The application has been updated to use www.spurgeonproperty.co.za as the primary domain:

- ✅ CORS configuration updated
- ✅ Meta tags and Open Graph updated  
- ✅ Canonical URLs updated
- ✅ Sitemap generation updated
- ✅ Structured data updated
- ✅ Application constants updated

## Testing DNS Configuration

Once DNS is configured, test with:

```bash
# Test domain resolution
nslookup www.spurgeonproperty.co.za

# Test HTTP response
curl -I http://www.spurgeonproperty.co.za

# Test HTTPS (after SSL setup)
curl -I https://www.spurgeonproperty.co.za
```

## Common DNS Providers

### Popular South African Providers
- **Afrihost**: DNS management in hosting control panel
- **Hetzner**: DNS console at dns.hetzner.com
- **Internet Solutions**: IS control panel
- **Web Africa**: Client portal DNS section

### International Providers
- **Cloudflare**: Dashboard > DNS
- **GoDaddy**: Domain manager > DNS
- **Namecheap**: Domain list > Manage > Advanced DNS

## Cloudflare Setup (Recommended)

For better performance and security, consider using Cloudflare:

1. Create Cloudflare account
2. Add spurgeonproperty.co.za domain
3. Update nameservers at registrar
4. Configure DNS records in Cloudflare
5. Enable security and performance features

## Need Help?

If you need assistance with DNS configuration:
1. Contact your domain registrar's support
2. Provide them with your server IP address
3. Request setup of A records for @ and www
4. Ask about SSL certificate provisioning

The application is ready for production deployment once DNS is properly configured.