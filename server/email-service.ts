import nodemailer from 'nodemailer';

interface EmailNotification {
  type: 'NEW_LEAD' | 'APPLICATION_SUBMITTED' | 'PROPERTY_INQUIRY';
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  propertyTitle?: string;
  message?: string;
  source?: string;
  agentName?: string;
  agentEmail?: string;
  propertyId?: number;
}

class EmailNotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private ownerEmail = 'peter@spurgeonproperty.com';

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Simple Gmail SMTP configuration
    // User will need to provide Gmail credentials
    if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD // App-specific password
        }
      });
    }
  }

  async sendLeadNotification(notification: EmailNotification): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email service not configured - skipping email notification');
      return false;
    }

    try {
      const subject = this.getEmailSubject(notification);
      const htmlContent = this.generateEmailContent(notification);
      
      // Recipients: Owner + Assigned Agent (if available)
      const recipients = [this.ownerEmail];
      if (notification.agentEmail && notification.agentEmail !== this.ownerEmail) {
        recipients.push(notification.agentEmail);
      }

      // Send to all recipients
      for (const recipient of recipients) {
        const personalizedContent = this.personalizeEmailContent(htmlContent, recipient, notification);
        
        await this.transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: recipient,
          subject: subject,
          html: personalizedContent
        });
        
        console.log(`Email notification sent to ${recipient}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  private personalizeEmailContent(htmlContent: string, recipient: string, notification: EmailNotification): string {
    const isOwner = recipient === this.ownerEmail;
    const greeting = isOwner ? 'Hi Peter,' : `Hi ${notification.agentName || 'Agent'},`;
    const role = isOwner ? 'Owner' : 'Assigned Agent';
    
    // Add personalized greeting
    return htmlContent.replace(
      '<div class="content">',
      `<div class="content">
        <p><strong>${greeting}</strong></p>
        <p>You're receiving this as the ${role} for this ${notification.type.toLowerCase().replace('_', ' ')}.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
      `
    );
  }

  private getEmailSubject(notification: EmailNotification): string {
    switch (notification.type) {
      case 'NEW_LEAD':
        return `🏠 New Lead: ${notification.leadName} - Spurgeon Property`;
      case 'APPLICATION_SUBMITTED':
        return `📋 New Application: ${notification.leadName} - Spurgeon Property`;
      case 'PROPERTY_INQUIRY':
        return `❓ Property Inquiry: ${notification.propertyTitle || 'General'} - Spurgeon Property`;
      default:
        return `New Contact: ${notification.leadName} - Spurgeon Property`;
    }
  }

  private generateEmailContent(notification: EmailNotification): string {
    const timestamp = new Date().toLocaleString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6, #F97316); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #8B5CF6; }
        .value { margin-left: 10px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🏠 Spurgeon Property - New ${notification.type.replace('_', ' ')}</h2>
          <p>Received: ${timestamp}</p>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name:</span>
            <span class="value">${notification.leadName}</span>
          </div>
          <div class="field">
            <span class="label">Email:</span>
            <span class="value">${notification.leadEmail}</span>
          </div>
          ${notification.leadPhone ? `
          <div class="field">
            <span class="label">Phone:</span>
            <span class="value">${notification.leadPhone}</span>
          </div>
          ` : ''}
          ${notification.propertyTitle ? `
          <div class="field">
            <span class="label">Property:</span>
            <span class="value">${notification.propertyTitle}</span>
          </div>
          ` : ''}
          ${notification.source ? `
          <div class="field">
            <span class="label">Source:</span>
            <span class="value">${notification.source}</span>
          </div>
          ` : ''}
          ${notification.message ? `
          <div class="field">
            <span class="label">Message:</span>
            <span class="value">${notification.message.replace(/\n/g, '<br>')}</span>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>This notification was sent automatically from your Spurgeon Property website.</p>
          <p>Login to your admin panel to manage this lead: <a href="https://spurgeonproperty.replit.app/admin">Admin Portal</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Test email function
  async testEmailConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailNotificationService();