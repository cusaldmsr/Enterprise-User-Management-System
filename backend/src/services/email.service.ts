import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection (log warning if not configured, don't crash)
transporter.verify().catch(() => {
  console.warn('⚠️  SMTP not configured. Email notifications will be skipped.');
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'EUMS <noreply@eums.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email send failed:', error);
    // Don't throw – email failures should not break API responses
  }
};

// --- Email Templates ---

export const sendWelcomeEmail = async (
  to: string,
  firstName: string,
  tempPassword: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Welcome to Enterprise User Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome, ${firstName}!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Your account has been created on the <strong>Enterprise User Management System</strong>.</p>
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Temporary Password:</strong> <code style="background: #eee; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
          <p style="color: #e53e3e;">⚠️ Please change your password immediately after first login.</p>
          <a href="${process.env.FRONTEND_URL}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px;">Login Now</a>
        </div>
      </div>
    `,
  });
};

export const sendPasswordResetAlert = async (
  to: string,
  firstName: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Password Changed – EUMS Security Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e53e3e; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🔐 Security Alert</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Your password was recently changed. If you did not make this change, please contact your system administrator immediately.</p>
          <p style="color: #718096; font-size: 0.9rem;">Time: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
  });
};

export const sendAccountDeletionAlert = async (
  to: string,
  firstName: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Account Deleted – EUMS Notification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #744210; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Account Removed</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Your account on <strong>Enterprise User Management System</strong> has been deleted by an administrator.</p>
          <p>If you believe this is a mistake, please contact your administrator.</p>
        </div>
      </div>
    `,
  });
};
