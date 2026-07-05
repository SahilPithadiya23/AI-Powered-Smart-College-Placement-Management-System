import { Notification } from '../models/Notification.js';
import { emitToUser } from './socketService.js';
import { sendEmail } from './emailService.js';

export const createNotification = async ({ recipient, title, message, type = 'info', metadata, email }) => {
  const notification = await Notification.create({ recipient, title, message, type, metadata });
  emitToUser(recipient.toString(), 'notification:new', notification);

  if (email?.to) {
    await sendEmail({
      to: email.to,
      subject: title,
      html: `<p>${message}</p>`
    });
  }

  return notification;
};
