import nodemailer from 'nodemailer';

async function testGmailAuth() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  
  console.log('Gmail User:', gmailUser);
  console.log('Gmail Pass length:', gmailPass ? gmailPass.length : 0);
  console.log('Gmail Pass format check:', gmailPass ? 'Has spaces: ' + gmailPass.includes(' ') : 'No password');
  
  if (!gmailUser || !gmailPass) {
    console.log('Missing credentials');
    return;
  }
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });
  
  try {
    await transporter.verify();
    console.log('Gmail authentication successful!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: gmailUser,
      to: 'malcolmgov24@gmail.com',
      subject: 'Test Email - Spurgeon Property Monitoring',
      html: `
        <h2>Email Authentication Successful!</h2>
        <p>Your Spurgeon Property monitoring system is now configured and ready to send:</p>
        <ul>
          <li>Daily analytics reports at 9:00 AM</li>
          <li>Real-time performance alerts</li>
          <li>Critical error notifications</li>
        </ul>
        <p>This test confirms your Gmail app password is working correctly.</p>
        <hr>
        <p><small>Spurgeon Property Monitoring System</small></p>
      `
    });
    
    console.log('Test email sent successfully:', info.messageId);
    
  } catch (error) {
    console.log('Gmail authentication failed:', error.message);
  }
}

testGmailAuth().catch(console.error);