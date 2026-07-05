import express from 'express';
import { listNotifications, markRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

export const notificationRoutes = express.Router();

notificationRoutes.use(protect);
notificationRoutes.get('/', listNotifications);
notificationRoutes.patch('/:id/read', markRead);
