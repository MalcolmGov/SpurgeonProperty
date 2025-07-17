// Production Password Reset Script
// Run this directly on your production database

const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function resetProductionPasswords() {
  // Use your production DATABASE_URL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to production database');

    const defaultPassword = 'SpurgeonAdmin2025!';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // Reset passwords for both admin users
    const emails = ['malcolmgov24@gmail.com', 'peter@spurgeonproperty.com'];
    
    for (const email of emails) {
      const result = await client.query(
        'UPDATE admin_users SET password_hash = $1 WHERE email = $2',
        [passwordHash, email]
      );
      
      if (result.rowCount > 0) {
        console.log(`✅ Password reset successfully for ${email}`);
      } else {
        console.log(`❌ User not found: ${email}`);
      }
    }

    console.log('\n🔐 Production admin passwords reset to: SpurgeonAdmin2025!');
    console.log('🚨 Please log in and change passwords immediately for security');

  } catch (error) {
    console.error('Error resetting production passwords:', error);
  } finally {
    await client.end();
  }
}

resetProductionPasswords();