import nodemailer from 'nodemailer';

interface EmailNotification {
  type: 'NEW_LEAD' | 'APPLICATION_SUBMITTED' | 'PROPERTY_INQUIRY';
  leadName: string;
  leadEmail: string;
  leadPhone?: string | null;
  propertyTitle?: string | null;
  message?: string | null;
  source?: string | null;
  agentName?: string | null;
  agentEmail?: string | null;
  propertyId?: number | null;
  propertyImage?: string | null;
}

class EmailNotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private ownerEmail = 'peter@spurgeonproperty.com';
  private testEmail = 'malcolmgov24@gmail.com';

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Gmail SMTP configuration for Spurgeon Property notifications
    // Uses dedicated notifications Gmail account
    const gmailUser = process.env.GMAIL_USER || 'notificationsspurgeonproperty@gmail.com';
    const gmailPassword = process.env.GMAIL_PASSWORD || 'uqgv ryzf assq ckqi';
    
    if (gmailUser && gmailPassword) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword
        }
      });
      console.log('Email service initialized with Gmail credentials');
    } else {
      console.log('Gmail credentials not found - email service disabled');
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
      
      // Recipients: Owner + Test Email + Assigned Agent (if available)
      const recipients = [this.ownerEmail, this.testEmail];
      if (notification.agentEmail && 
          notification.agentEmail !== this.ownerEmail && 
          notification.agentEmail !== this.testEmail) {
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
    const isTestUser = recipient === this.testEmail;
    
    let greeting: string;
    let role: string;
    
    if (isOwner) {
      greeting = 'Hi Peter,';
      role = 'Owner';
    } else if (isTestUser) {
      greeting = 'Hi Malcolm,';
      role = 'Admin/Test User';
    } else {
      greeting = `Hi ${notification.agentName || 'Agent'},`;
      role = 'Assigned Agent';
    }
    
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
        .property-image { width: 100%; max-width: 400px; height: 250px; object-fit: cover; border-radius: 8px; margin: 15px 0; }
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
          <div class="field">
            <span class="label">Property ID:</span>
            <span class="value">#${notification.propertyId || 'N/A'}</span>
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
          ${notification.propertyImage ? `
          <div class="field">
            <span class="label">Property Image:</span><br>
            <img src="${notification.propertyImage}" alt="Property Image" class="property-image">
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