import nodemailer from 'nodemailer';
import { Resend } from 'resend';

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

// Resend integration - get credentials from Replit connector
let connectionSettings: any;

async function getResendCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    return null;
  }

  try {
    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (!connectionSettings || !connectionSettings.settings.api_key) {
      return null;
    }
    return { 
      apiKey: connectionSettings.settings.api_key, 
      fromEmail: connectionSettings.settings.from_email 
    };
  } catch (error) {
    console.error('Failed to get Resend credentials:', error);
    return null;
  }
}

async function getResendClient() {
  const credentials = await getResendCredentials();
  if (!credentials) return null;
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: credentials.fromEmail
  };
}

class EmailNotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private ownerEmail = 'peter@spurgeonproperty.com';
  private testEmail = 'malcolmgov24@gmail.com';
  private resendAvailable = false;

  constructor() {
    this.initializeEmailServices();
  }

  private async initializeEmailServices() {
    // Check if Resend is available
    const resendClient = await getResendClient();
    if (resendClient) {
      this.resendAvailable = true;
      console.log('Email service initialized with Resend API');
      console.log('Resend from email:', resendClient.fromEmail);
      return;
    }

    // Fallback to Gmail SMTP if Resend not available
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_PASS;
    
    if (gmailUser && gmailPassword) {
      const cleanPassword = gmailPassword.replace(/\s/g, '');
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: cleanPassword
        }
      });
      console.log('Email service initialized with Gmail credentials for:', gmailUser);
    } else {
      console.log('No email service configured - notifications disabled');
    }
  }

  async sendLeadNotification(notification: EmailNotification): Promise<boolean> {
    // Try Resend first (preferred)
    const resendClient = await getResendClient();
    if (resendClient) {
      return this.sendWithResend(resendClient, notification);
    }

    // Fallback to Gmail
    if (this.transporter) {
      return this.sendWithGmail(notification);
    }

    console.log('Email service not configured - skipping email notification');
    return false;
  }

  private async sendWithResend(
    resendClient: { client: Resend; fromEmail: string },
    notification: EmailNotification
  ): Promise<boolean> {
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
        
        const { data, error } = await resendClient.client.emails.send({
          from: resendClient.fromEmail || 'Spurgeon Property <onboarding@resend.dev>',
          to: recipient,
          subject: subject,
          html: personalizedContent
        });

        if (error) {
          console.error(`Resend error for ${recipient}:`, error);
        } else {
          console.log(`Email notification sent to ${recipient} via Resend (ID: ${data?.id})`);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to send email notification via Resend:', error);
      return false;
    }
  }

  private async sendWithGmail(notification: EmailNotification): Promise<boolean> {
    if (!this.transporter) return false;

    try {
      const subject = this.getEmailSubject(notification);
      const htmlContent = this.generateEmailContent(notification);
      
      const recipients = [this.ownerEmail, this.testEmail];
      if (notification.agentEmail && 
          notification.agentEmail !== this.ownerEmail && 
          notification.agentEmail !== this.testEmail) {
        recipients.push(notification.agentEmail);
      }

      for (const recipient of recipients) {
        const personalizedContent = this.personalizeEmailContent(htmlContent, recipient, notification);
        
        await this.transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: recipient,
          subject: subject,
          html: personalizedContent
        });
        console.log(`Email notification sent to ${recipient} via Gmail`);
      }

      return true;
    } catch (error) {
      console.error('Failed to send email notification via Gmail:', error);
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
        ${notification.propertyImage ? `
        <img src="${notification.propertyImage}" alt="Property Image" class="property-image" style="border-radius: 0; margin: 0; display: block; width: 100%; max-width: 600px;">
        ` : `<!-- No property image available: ${notification.propertyId} -->`}
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

  async testEmailConnection(): Promise<{ success: boolean; provider: string; error?: string }> {
    // Test Resend first
    const resendClient = await getResendClient();
    if (resendClient) {
      try {
        const { data, error } = await resendClient.client.emails.send({
          from: resendClient.fromEmail || 'Spurgeon Property <onboarding@resend.dev>',
          to: this.testEmail,
          subject: '✅ Spurgeon Property - Email Test Successful',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #8B5CF6;">Email Test Successful!</h2>
              <p>This is a test email from Spurgeon Property.</p>
              <p>Your email notifications are now working via <strong>Resend</strong>.</p>
              <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</p>
            </div>
          `
        });

        if (error) {
          return { success: false, provider: 'Resend', error: error.message };
        }
        return { success: true, provider: 'Resend' };
      } catch (err: any) {
        return { success: false, provider: 'Resend', error: err.message };
      }
    }

    // Test Gmail fallback
    if (this.transporter) {
      try {
        await this.transporter.verify();
        return { success: true, provider: 'Gmail' };
      } catch (error: any) {
        return { success: false, provider: 'Gmail', error: error.message };
      }
    }

    return { success: false, provider: 'None', error: 'No email service configured' };
  }
}

export const emailService = new EmailNotificationService();
