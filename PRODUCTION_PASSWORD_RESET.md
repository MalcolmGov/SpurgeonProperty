# Production Password Reset Guide

## Overview
This guide helps you reset admin passwords in your production database for www.spurgeonproperty.com.

## Prerequisites
- Access to your production DATABASE_URL
- Node.js installed on your system
- bcrypt and pg npm packages (already installed in this project)

## Steps to Reset Production Passwords

### 1. Get Your Production Database URL
You need your production DATABASE_URL. This should be your Neon PostgreSQL connection string that looks like:
```
postgresql://username:password@hostname:port/database?sslmode=require
```

### 2. Run the Password Reset Script

**Method 1: With DATABASE_URL environment variable**
```bash
DATABASE_URL="your-production-database-url" node production-password-reset.js
```

**Method 2: If DATABASE_URL is already in your environment**
```bash
node production-password-reset.js
```

**Example:**
```bash
DATABASE_URL="postgresql://user:pass@ep-example.neon.tech:5432/spurgeonproperty?sslmode=require" node production-password-reset.js
```

**Note:** The script will automatically connect to your production database and reset the passwords for both admin users.

### 3. Expected Output
The script will show:
- Connection status to production database
- List of current admin users found
- Password reset progress for each user
- Success confirmation with new password

### 4. Test the Reset
1. Go to https://www.spurgeonproperty.com/admin
2. Log in with:
   - **Email**: `malcolmgov24@gmail.com` or `peter@spurgeonproperty.com`
   - **Password**: `SpurgeonAdmin2025!`
3. Change your password immediately after login

## Security Notes
- The script uses bcrypt with 12 salt rounds for secure password hashing
- All database connections use SSL
- The default password should be changed immediately after login
- Only authorized email addresses can access the admin portal

## Troubleshooting

### Connection Issues
If you get connection errors:
- Verify your DATABASE_URL is correct
- Check that the database is accessible from your location
- Ensure SSL is properly configured

### User Not Found
If users aren't found:
- Check that the admin_users table exists in production
- Verify the email addresses match exactly
- The script uses case-insensitive email matching

### Script Errors
If the script fails:
- Ensure Node.js dependencies are installed: `npm install`
- Check that your DATABASE_URL includes SSL parameters
- Verify you have network access to the production database

## Admin Users That Will Be Reset
- `malcolmgov24@gmail.com` (Malcolm Administrator)
- `peter@spurgeonproperty.com` (Peter Spurgeon)

## After Reset
1. **Log in immediately** using the new password
2. **Change your password** in admin settings
3. **Verify all admin features** are working correctly
4. **Delete this script** from production for security

## Support
If you encounter issues:
1. Check the error messages in the script output
2. Verify your DATABASE_URL is correct
3. Ensure the production database is accessible
4. Contact support if problems persist