// Direct email test using nodemailer
import nodemailer from 'nodemailer';

async function sendSampleReport() {
  console.log('Creating Gmail transporter...');
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const reportHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f8fafc;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #f97316 100%); padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 26px;">Sample Daily Analytics Report</h1>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">Spurgeon Property Platform - ${new Date().toLocaleDateString('en-ZA')}</p>
      </div>

      <div style="background: white; padding: 20px;">
        <h2 style="color: #1e293b; margin: 0 0 15px 0;">Key Performance Metrics</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">22</div>
            <div style="opacity: 0.9;">Active Properties</div>
          </div>
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">27</div>
            <div style="opacity: 0.9;">Total Leads</div>
          </div>
        </div>
      </div>

      <div style="background: white; padding: 20px; border-top: 1px solid #e2e8f0;">
        <h3 style="color: #1e293b; margin: 0 0 10px 0;">Top Performing Properties</h3>
        <div style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
          <div style="font-weight: 600; color: #374151;">Stunning, fully furnished apartment</div>
          <div style="color: #6b7280; font-size: 14px;">Cape Town • 45 views</div>
        </div>
        <div style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
          <div style="font-weight: 600; color: #374151;">Beautiful 4-bedroom family home</div>
          <div style="color: #6b7280; font-size: 14px;">Johannesburg • 38 views</div>
        </div>
        <div style="padding: 10px 0;">
          <div style="font-weight: 600; color: #374151;">Modern townhouse with garden</div>
          <div style="color: #6b7280; font-size: 14px;">Sandton • 32 views</div>
        </div>
      </div>

      <div style="background: white; padding: 20px; border-top: 1px solid #e2e8f0;">
        <h3 style="color: #1e293b; margin: 0 0 10px 0;">System Health</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          <div>
            <div style="color: #6b7280; font-size: 14px;">System Uptime</div>
            <div style="font-size: 20px; font-weight: 600; color: #059669;">99.8%</div>
          </div>
          <div>
            <div style="color: #6b7280; font-size: 14px;">Response Time</div>
            <div style="font-size: 20px; font-weight: 600; color: #0ea5e9;">145ms</div>
          </div>
        </div>
      </div>

      <div style="background: #1e293b; color: white; padding: 15px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">
          Spurgeon Property Monitoring System | Generated ${new Date().toLocaleString('en-ZA')}
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'malcolmgov24@gmail.com',
      subject: 'Spurgeon Property - Sample Daily Analytics Report',
      html: reportHtml
    });
    console.log('SUCCESS: Sample report sent to malcolmgov24@gmail.com');
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

sendSampleReport();