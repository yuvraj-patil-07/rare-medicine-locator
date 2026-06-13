const nodemailer = require('nodemailer');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: false,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
    }
  }

  async sendEmail({ to, subject, html }) {
    if (!this.transporter) {
      console.log(`[Email Service] Email not configured. Would send to: ${to}, Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Rare Medicine Locator" <${config.email.user}>`,
        to,
        subject,
        html,
      });
      console.log(`[Email Service] Email sent to: ${to}`);
    } catch (error) {
      console.error(`[Email Service] Failed to send email: ${error.message}`);
    }
  }

  async sendReservationConfirmation(userEmail, userName, reservationCode, medicineName, pharmacyName) {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💊 Rare Medicine Locator</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #1e293b; margin-top: 0;">Reservation Confirmed!</h2>
          <p style="color: #64748b;">Hi ${userName},</p>
          <p style="color: #64748b;">Your medicine reservation has been submitted successfully.</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="margin: 4px 0; color: #334155;"><strong>Reservation Code:</strong> ${reservationCode}</p>
            <p style="margin: 4px 0; color: #334155;"><strong>Medicine:</strong> ${medicineName}</p>
            <p style="margin: 4px 0; color: #334155;"><strong>Pharmacy:</strong> ${pharmacyName}</p>
          </div>
          <p style="color: #64748b;">The pharmacy will review your reservation and notify you once approved.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">This is an automated message. Please do not reply.</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: `Reservation Confirmed - ${reservationCode}`,
      html,
    });
  }

  async sendReservationStatusUpdate(userEmail, userName, reservationCode, status, medicineName) {
    const statusColors = {
      approved: '#22c55e',
      rejected: '#ef4444',
      completed: '#3b82f6',
      cancelled: '#f59e0b',
    };

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💊 Rare Medicine Locator</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #1e293b; margin-top: 0;">Reservation Update</h2>
          <p style="color: #64748b;">Hi ${userName},</p>
          <p style="color: #64748b;">Your reservation <strong>${reservationCode}</strong> for <strong>${medicineName}</strong> has been updated.</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="background: ${statusColors[status] || '#64748b'}; color: white; padding: 8px 24px; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 14px;">
              ${status}
            </span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">This is an automated message. Please do not reply.</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: userEmail,
      subject: `Reservation ${status.charAt(0).toUpperCase() + status.slice(1)} - ${reservationCode}`,
      html,
    });
  }

  async sendLowStockAlert(pharmacyEmail, pharmacyName, medicineName, currentStock) {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Low Stock Alert</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <p style="color: #64748b;">Hi ${pharmacyName},</p>
          <p style="color: #64748b;">The following medicine is running low on stock:</p>
          <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 4px 0; color: #92400e;"><strong>Medicine:</strong> ${medicineName}</p>
            <p style="margin: 4px 0; color: #92400e;"><strong>Current Stock:</strong> ${currentStock} units</p>
          </div>
          <p style="color: #64748b;">Please restock at your earliest convenience.</p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: pharmacyEmail,
      subject: `Low Stock Alert - ${medicineName}`,
      html,
    });
  }
}

module.exports = new EmailService();
