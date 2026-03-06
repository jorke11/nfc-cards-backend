import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter | null;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const gmailConfig = this.configService.get('gmail');
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    this.fromEmail = gmailConfig?.user || 'noreply@example.com';

    // Log for debugging
    this.logger.log(`Gmail Config - User: ${gmailConfig?.user}`);
    this.logger.log(`Gmail Config - Password length: ${gmailConfig?.password?.length || 0}`);
    this.logger.log(`Gmail Config - Host: ${gmailConfig?.host}, Port: ${gmailConfig?.port}, Secure: ${gmailConfig?.secure}`);

    // Initialize Nodemailer transporter with Gmail SMTP
    if (gmailConfig?.user && gmailConfig?.password) {
      this.transporter = nodemailer.createTransport({
        host: gmailConfig.host,
        port: gmailConfig.port,
        secure: gmailConfig.secure,
        auth: {
          user: gmailConfig.user,
          pass: gmailConfig.password,
        },
      });
      this.logger.log('✅ Gmail transporter initialized successfully');
    } else {
      // Dev mode: no transporter configured
      this.logger.warn('⚠️ Gmail credentials not configured - emails will be logged only');
      this.transporter = null;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email Address</h1>
            <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
      Verify Your Email Address

      Thank you for registering! Please verify your email address by clicking the link below:

      ${verificationUrl}

      This link will expire in 24 hours.

      If you didn't create an account, please ignore this email.
    `;

    await this.sendEmail(email, 'Verify Your Email Address', htmlBody, textBody);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
      Reset Your Password

      We received a request to reset your password. Click the link below to create a new password:

      ${resetUrl}

      This link will expire in 24 hours.

      If you didn't request a password reset, please ignore this email.
    `;

    await this.sendEmail(email, 'Reset Your Password', htmlBody, textBody);
  }

  async sendMagicLinkEmail(email: string, token: string): Promise<void> {
    const magicLinkUrl = `${this.frontendUrl}/auth/magic-link/verify?token=${token}`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Sign In to Your Account</h1>
            <p>Click the button below to sign in to your account:</p>
            <a href="${magicLinkUrl}" class="button">Sign In</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${magicLinkUrl}</p>
            <p>This link will expire in 15 minutes.</p>
            <div class="footer">
              <p>If you didn't request this link, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
      Sign In to Your Account

      Click the link below to sign in to your account:

      ${magicLinkUrl}

      This link will expire in 15 minutes.

      If you didn't request this link, please ignore this email.
    `;

    await this.sendEmail(email, 'Sign In to Your Account', htmlBody, textBody);
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to NFC Digital Profiles! 🎉</h1>
            <p>Hi ${firstName},</p>
            <p>Welcome to NFC Digital Profiles! We're excited to have you on board.</p>
            <p>With your account, you can create a stunning digital profile that's accessible via NFC cards, QR codes, and direct links.</p>
            <a href="${this.frontendUrl}/dashboard" class="button">Get Started</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The NFC Digital Profiles Team</p>
          </div>
        </body>
      </html>
    `;

    const textBody = `
      Welcome to NFC Digital Profiles!

      Hi ${firstName},

      Welcome to NFC Digital Profiles! We're excited to have you on board.

      With your account, you can create a stunning digital profile that's accessible via NFC cards, QR codes, and direct links.

      Get started: ${this.frontendUrl}/dashboard

      If you have any questions, feel free to reach out to our support team.

      Best regards,
      The NFC Digital Profiles Team
    `;

    await this.sendEmail(email, 'Welcome to NFC Digital Profiles!', htmlBody, textBody);
  }

  private async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
    textBody: string,
  ): Promise<void> {
    // Skip email sending and log to console in development mode
    if (!this.transporter) {
      this.logger.log(`[DEV MODE] Email would be sent to: ${to}`);
      this.logger.log(`[DEV MODE] Subject: ${subject}`);
      this.logger.log(`[DEV MODE] Text Body:\n${textBody}`);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to: to,
        subject: subject,
        text: textBody,
        html: htmlBody,
      });

      this.logger.log(`Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      // Don't throw error - email failures shouldn't block the main flow
    }
  }
}
