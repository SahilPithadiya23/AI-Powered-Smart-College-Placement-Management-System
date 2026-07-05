import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const canSend = Boolean(env.email.host && env.email.user && env.email.password);

const transporter = canSend
  ? nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: { user: env.email.user, pass: env.email.password }
    })
  : null;

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log(`Email skipped [${subject}] -> ${to}`);
    return;
  }

  await transporter.sendMail({
    from: env.email.from,
    to,
    subject,
    html
  });
};
