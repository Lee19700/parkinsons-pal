// Email service for Parkinson's Pal
// Supports multiple providers: SMTP, SendGrid, AWS SES

const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize email service based on environment variables
 * Supports three configuration methods:
 * 1. SMTP (generic): EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD
 * 2. SendGrid: SENDGRID_API_KEY
 * 3. AWS SES: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 */
async function initEmailService() {
  // Check if email is disabled (for development)
  if (process.env.EMAIL_DISABLED === 'true') {
    console.log('[EMAIL] Email service disabled (development mode)');
    return;
  }

  try {
    // SendGrid configuration
    if (process.env.SENDGRID_API_KEY) {
      transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
      console.log('[EMAIL] Initialized with SendGrid');
    }
    // AWS SES configuration
    else if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID) {
      const AWS = require('aws-sdk');
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      });
      transporter = nodemailer.createTransport({
        SES: new AWS.SES({ apiVersion: '2010-12-01' })
      });
      console.log('[EMAIL] Initialized with AWS SES');
    }
    // Generic SMTP configuration
    else if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      console.log('[EMAIL] Initialized with SMTP');
    }
    // No email configuration found
    else {
      console.log('[EMAIL] No email configuration found. Set EMAIL_HOST, SENDGRID_API_KEY, or AWS_REGION');
    }
  } catch (error) {
    console.error('[EMAIL] Failed to initialize email service:', error.message);
  }
}

/**
 * Send password reset email
 * @param {string} userEmail - User's email address
 * @param {string} username - User's username
 * @param {string} resetToken - Reset token
 * @param {string} resetUrl - Full reset URL (e.g., https://app.com/reset-password?token=...)
 */
async function sendPasswordResetEmail(userEmail, username, resetToken, resetUrl) {
  if (!transporter) {
    console.warn('[EMAIL] Email service not configured, skipping password reset email');
    return { success: false, reason: 'Email not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@parkinsonspal.app',
      to: userEmail,
      subject: "Parkinson's Pal - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${username},</p>
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the link below:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">
            Or copy and paste this link in your browser:<br>
            <code style="background-color: #f5f5f5; padding: 8px; display: block; word-break: break-all;">${resetUrl}</code>
          </p>
          <p style="color: #999; font-size: 12px;">
            This reset link will expire in 1 hour.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
      text: `
Password Reset Request

Hello ${username},

We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

To reset your password, visit this link:
${resetUrl}

This reset link will expire in 1 hour.

If you have any questions, please contact our support team.
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Password reset email sent to', userEmail);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send password reset email:', error.message);
    return { success: false, reason: error.message };
  }
}

/**
 * Send welcome email to new user
 * @param {string} userEmail - User's email address
 * @param {string} username - User's username
 */
async function sendWelcomeEmail(userEmail, username) {
  if (!transporter) {
    console.warn('[EMAIL] Email service not configured, skipping welcome email');
    return { success: false, reason: 'Email not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@parkinsonspal.app',
      to: userEmail,
      subject: "Welcome to Parkinson's Pal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Parkinson's Pal!</h2>
          <p>Hello ${username},</p>
          <p>Thank you for signing up. Your account has been created successfully.</p>
          <p>You can now:</p>
          <ul>
            <li>Log medication intake and track side effects</li>
            <li>Monitor your health metrics (vitals, symptoms)</li>
            <li>Track diet, exercise, and fluid intake</li>
            <li>Manage appointments and medical documents</li>
            <li>Grant access to doctors and caregivers</li>
          </ul>
          <p style="margin-top: 20px;">
            <a href="${process.env.APP_URL || 'https://parkinsonspal.app'}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
              Get Started
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Questions? Contact our support team.
          </p>
        </div>
      `,
      text: `
Welcome to Parkinson's Pal!

Hello ${username},

Thank you for signing up. Your account has been created successfully.

You can now:
- Log medication intake and track side effects
- Monitor your health metrics (vitals, symptoms)
- Track diet, exercise, and fluid intake
- Manage appointments and medical documents
- Grant access to doctors and caregivers

Get started: ${process.env.APP_URL || 'https://parkinsonspal.app'}

Questions? Contact our support team.
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Welcome email sent to', userEmail);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send welcome email:', error.message);
    return { success: false, reason: error.message };
  }
}

module.exports = {
  initEmailService,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
