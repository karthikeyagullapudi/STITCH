import nodemailer from 'nodemailer';
import { Config } from '../config/config.js';

// Without SMTP credentials (local development) emails are printed instead.
const transporter = Config.SMTP_HOST
  ? nodemailer.createTransport({
      host: Config.SMTP_HOST,
      port: Number(Config.SMTP_PORT) || 587,
      secure: Number(Config.SMTP_PORT) === 465,
      auth: { user: Config.SMTP_USER, pass: Config.SMTP_PASS },
    })
  : null;

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log(`\n[email] To: ${to}\nSubject: ${subject}\n${html}\n`);
    return;
  }
  await transporter.sendMail({ from: Config.EMAIL_FROM, to, subject, html });
};
