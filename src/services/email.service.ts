import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../config/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!config.email.user || !config.email.pass) {
      logger.warn('Email credentials not configured - emails will be logged only');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: false,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      logger.info('Email transporter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  async sendWelcomeEmail(email: string, businessName: string) {
    const subject = 'Welcome to Fittingz!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Fittingz, ${businessName}!</h1>
        <p>Thank you for joining our platform for fashion designers.</p>
        <p>You can now start managing your clients, measurements, and orders.</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Complete your profile setup</li>
            <li>Add your first client</li>
            <li>Start taking measurements</li>
          </ul>
        </div>
        <p>Best regards,<br><strong>The Fittingz Team</strong></p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendVerificationEmail(email: string, businessName: string, verificationCode: string) {
    const subject = 'Your Fittingz Verification Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify Your Email</h1>
        <p>Hi ${businessName},</p>
        <p>Please use the following 6-digit code to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f9fa; border: 2px dashed #007bff; padding: 20px; border-radius: 10px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px;">${verificationCode}</span>
          </div>
        </div>
        <p style="text-align: center; color: #666;">Enter this code in the verification form</p>
        <p><small>This code expires in 10 minutes for security.</small></p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <p>Best regards,<br><strong>The Fittingz Team</strong></p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, businessName: string, resetCode: string) {
    const subject = 'Reset Your Fittingz Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi ${businessName},</p>
        <p>You requested to reset your password. Use the following 6-digit code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #fff3cd; border: 2px dashed #ffc107; padding: 20px; border-radius: 10px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #856404; letter-spacing: 8px;">${resetCode}</span>
          </div>
        </div>
        <p style="text-align: center; color: #666;">Enter this code to reset your password</p>
        <p><small>This code expires in 15 minutes for security.</small></p>
        <p><strong>If you didn't request this, please ignore this email and your password will remain unchanged.</strong></p>
        <p>Best regards,<br><strong>The Fittingz Team</strong></p>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      logger.info(`[EMAIL SIMULATION] To: ${to}, Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    try {
      const result = await this.transporter.sendMail({
        from: `"Fittingz" <${config.email.user}>`,
        to,
        subject,
        html,
      });

      logger.info('Email sent successfully', { to, messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Failed to send email:', { to, error: error.message });
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();