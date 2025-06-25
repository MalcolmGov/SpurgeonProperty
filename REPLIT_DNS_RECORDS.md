# Getting DNS Records from Replit Deployment

## Steps to Get DNS Records

### 1. Access Replit Deployment Dashboard
1. Go to your Replit project
2. Click the **"Deploy"** tab in the top navigation
3. You should see your active deployment listed

### 2. Navigate to Domain Settings
1. Click on your deployed project
2. Look for **"Domains"** or **"Custom Domain"** section
3. Click **"Add Custom Domain"** or **"Manage Domains"**

### 3. Add Your Domains
Add both versions of your domain:
- `spurgeonproperty.co.za`
- `www.spurgeonproperty.co.za`

### 4. Get DNS Records
After adding the domains, Replit will display DNS records similar to:

```
Type: CNAME
Name: www
Value: spurgeon-property--[your-username].replit.app
TTL: 300

Type: A (or CNAME)
Name: @ (or root)
Value: [Replit IP address or hostname]
TTL: 300
```

## Expected DNS Records Format

You'll receive something like this from Replit:

### For www subdomain:
```
Type: CNAME
Host: www
Points to: your-deployment-name.replit.app
TTL: 300 seconds (5 minutes)
```

### For root domain:
```
Type: A
Host: @
Points to: [IP address like 34.102.136.180]
TTL: 300 seconds
```

OR

```
Type: CNAME
Host: @
Points to: your-deployment-name.replit.app
TTL: 300 seconds
```

## What to Do with These Records

1. **Copy the exact values** Replit provides
2. **Login to your .co.za domain registrar**
3. **Navigate to DNS Management**
4. **Add both records** exactly as provided
5. **Save changes**
6. **Wait 5-60 minutes** for DNS propagation

## Common South African Domain Providers

### Afrihost
- Login → Client Zone → Domain Management → DNS Records

### Register.co.za
- Login → Domain Management → DNS Settings

### Internet Solutions
- Login → Control Panel → DNS Management

### Web Africa
- Login → Client Portal → DNS Section

## After Adding DNS Records

1. **Wait for propagation** (5-60 minutes)
2. **Test with DNS checker**: https://www.whatsmydns.net/
3. **Verify SSL activation** (15-45 minutes after DNS)
4. **Test your site**: https://www.spurgeonproperty.co.za

## Need Help Finding Records?

If you can't locate the DNS records in Replit:
1. Check if deployment is complete and active
2. Look for "Settings" or "Configuration" in deployment dashboard
3. Contact Replit support if domain section is missing
4. Ensure you have deployment permissions