import { env } from "../../env";
import { ConfigService } from "../config/service";
import nodemailer from "nodemailer";

export class EmailService {
  private configService = new ConfigService();

  private async createTransporter() {
    const smtpEnabled = await this.configService.getValue("smtpEnabled");
    if (smtpEnabled !== "true") {
      return null;
    }

    return nodemailer.createTransport({
      host: await this.configService.getValue("smtpHost"),
      port: Number(await this.configService.getValue("smtpPort")),
      secure: env.SECURE_SITE === "true" ? true : false,
      auth: {
        user: await this.configService.getValue("smtpUser"),
        pass: await this.configService.getValue("smtpPass"),
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string, origin: string) {
    const transporter = await this.createTransporter();
    if (!transporter) {
      throw new Error("SMTP is not enabled");
    }

    const fromName = await this.configService.getValue("smtpFromName");
    const fromEmail = await this.configService.getValue("smtpFromEmail");
    const appName = await this.configService.getValue("appName");

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: `${appName} - Password Reset Request`,
      html: `
        <h1>${appName} - Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${origin}/reset-password?token=${resetToken}">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  }

  async sendShareNotification(to: string, shareLink: string, shareName?: string) {
    const transporter = await this.createTransporter();
    if (!transporter) {
      throw new Error("SMTP is not enabled");
    }

    const fromName = await this.configService.getValue("smtpFromName");
    const fromEmail = await this.configService.getValue("smtpFromEmail");
    const appName = await this.configService.getValue("appName");

    const shareTitle = shareName || "Files";

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: `${appName} - ${shareTitle} shared with you`,
      html: `
        <h1>${appName} - Shared Files</h1>
        <p>Someone has shared "${shareTitle}" with you.</p>
        <p>Click the link below to access the shared files:</p>
        <a href="${shareLink}">
          Access Shared Files
        </a>
        <p>Note: This share may have an expiration date or view limit.</p>
      `,
    });
  }
}
