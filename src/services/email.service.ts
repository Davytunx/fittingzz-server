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
    const html = `<h1>Welcome ${businessName}!</h1><p>Thank you for joining Fittingz.</p>`;
    return this.sendEmail(email, subject, html);
  }

  async sendVerificationEmail(email: string, businessName: string, verificationCode: string) {
    const subject = 'Your Fittingz Verification Code';
    const html = `<h1>Verify Your Email</h1><p>Hi ${businessName}, your code is: <strong>${verificationCode}</strong></p>`;
    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, businessName: string, resetCode: string) {
    const subject = 'Reset Your Fittingz Password';
    const html = `<h1>Password Reset</h1><p>Hi ${businessName}, your reset code is: <strong>${resetCode}</strong></p>`;
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