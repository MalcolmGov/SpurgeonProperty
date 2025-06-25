# DNS Records for spurgeonproperty.co.za

## Records from Replit (Ready to Configure)

Based on your Replit deployment dashboard, add these exact records to your domain registrar:

### Record 1: A Record
```
Type: A
Hostname: www.spurgeonproperty
Record: 34.111.179.208
TTL: 300 (or automatic)
```

### Record 2: TXT Record (Verification)
```
Type: TXT
Hostname: www.spurgeonproperty
Record: replit-verify=3b36ed56-97da-42d
TTL: 300 (or automatic)
```

## Configuration Steps at Your Registrar

### 1. Login to Domain Provider
Access your .co.za domain registrar's control panel

### 2. Find DNS Management
Look for:
- "DNS Settings"
- "DNS Management" 
- "DNS Records"
- "Nameserver Management"

### 3. Add Records
**A Record:**
- Type: A
- Name/Host/Subdomain: www
- Value/Points to: 34.111.179.208
- TTL: 300 seconds

**TXT Record:**
- Type: TXT
- Name/Host: www
- Value: replit-verify=3b36ed56-97da-42d
- TTL: 300 seconds

### 4. Save Changes
Apply/save the DNS configuration

## Timeline
- **DNS Propagation**: 5-60 minutes
- **SSL Certificate**: 15-45 minutes after DNS propagates
- **Full Activation**: 1-2 hours maximum

## Verification
Once configured, check:
- DNS propagation: https://www.whatsmydns.net/
- Your site: https://www.spurgeonproperty.co.za
- SSL status in Replit deployment dashboard

## Status Check
The Replit dashboard shows "Verifying" status, which will update to "Active" once DNS propagates and verification completes.