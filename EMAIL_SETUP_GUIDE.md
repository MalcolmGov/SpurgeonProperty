# Email Setup Guide for Monitoring System

## Current Issue
The monitoring system cannot send emails because the current Gmail App Password is invalid or expired. Gmail is rejecting the authentication credentials.

## Solution: Generate New Gmail App Password

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Click "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the setup process if not already enabled

### Step 2: Generate New App Password
1. In Google Account Security settings
2. Click "2-Step Verification" 
3. Scroll down and click "App passwords"
4. **Delete the old "Spurgeon Property Monitoring" app password if it exists**
5. Click "Generate new app password"
6. Select "Mail" as the app
7. Select "Other (custom name)" as the device
8. Enter: "Spurgeon Property Monitoring v2"
9. Click "Generate"
10. Copy the 16-character app password (format: xxxx xxxx xxxx xxxx)
11. **Important: Remove all spaces** - use only the 16 characters without spaces

### Step 3: Update Replit Secrets
1. In your Replit project, go to the "Secrets" tab
2. Update the existing `GMAIL_PASS` secret with the new app password (16 characters, no spaces)
3. Ensure `GMAIL_USER` is set to: malcolmgov24@gmail.com
4. **Critical: Enter the password without any spaces** - just the 16 characters

### Step 4: Test Email System
After updating the secrets, the monitoring system will automatically restart and you can test:

```bash
curl -X POST https://www.spurgeonproperty.co.za/api/monitoring/test-alert
```

## Alternative: Use Dedicated Email Account
If you prefer not to use your personal Gmail:

1. Create a new Gmail account specifically for notifications
2. Enable 2-Factor Authentication
3. Generate an App Password
4. Update both `GMAIL_USER` and `GMAIL_PASS` secrets

## Expected Email Content
Once configured, you'll receive:

### Daily Reports (9:00 AM)
- Business metrics and analytics
- System health status
- Popular properties
- Traffic sources

### Real-Time Alerts
- Critical system errors
- Performance issues
- Error spikes

## Security Notes
- App passwords are safer than regular passwords for automated systems
- The app password only works for this specific application
- You can revoke app passwords anytime from Google Account settings
- Never share app passwords in plain text

Once you've generated the app password and updated the `GMAIL_PASS` secret, the monitoring system will immediately start working and send you the test report.