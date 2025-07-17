#!/usr/bin/env node

// Production Password Reset Script for Spurgeon Property
// This script resets admin passwords in the production database

import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Client } = pkg;

async function resetProductionPasswords() {
  console.log('🔄 Starting production password reset...');
  
  // Check if DATABASE_URL is provided
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is required');
    console.log('Usage: DATABASE_URL="your-production-db-url" node production-password-reset.js');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected to production database');

    // First, check if admin_users table exists and get current users
    const checkTable = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users')"
    );
    
    if (!checkTable.rows[0].exists) {
      console.error('❌ Error: admin_users table does not exist in production database');
      process.exit(1);
    }

    // Get current admin users
    const currentUsers = await client.query('SELECT email, first_name, last_name FROM admin_users');
    console.log(`📋 Found ${currentUsers.rows.length} admin users in production:`);
    currentUsers.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.first_name} ${user.last_name})`);
    });

    const defaultPassword = 'SpurgeonAdmin2025!';
    const saltRounds = 12;
    console.log('🔐 Generating secure password hash...');
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // Reset passwords for both admin users
    const emails = ['malcolmgov24@gmail.com', 'peter@spurgeonproperty.com'];
    let successCount = 0;
    
    console.log('\n🔄 Resetting passwords...');
    for (const email of emails) {
      const result = await client.query(
        'UPDATE admin_users SET password_hash = $1 WHERE LOWER(email) = LOWER($2)',
        [passwordHash, email]
      );
      
      if (result.rowCount > 0) {
        console.log(`✅ Password reset successfully for ${email}`);
        successCount++;
      } else {
        console.log(`⚠️  User not found: ${email}`);
      }
    }

    console.log(`\n🎉 Password reset completed! ${successCount}/${emails.length} users updated`);
    console.log(`🔐 New password for all admin users: ${defaultPassword}`);
    console.log(`🚨 IMPORTANT: Log in immediately and change these passwords for security!`);
    console.log(`🌐 Admin login URL: https://www.spurgeonproperty.com/admin`);

  } catch (error) {
    console.error('❌ Error resetting production passwords:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Check that your DATABASE_URL is correct and the database is accessible');
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
resetProductionPasswords().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});