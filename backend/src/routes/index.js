import express from 'express';
import { authRoutes } from './authRoutes.js';
import { profileRoutes } from './profileRoutes.js';
import { jobRoutes } from './jobRoutes.js';
import { applicationRoutes } from './applicationRoutes.js';
import { adminRoutes } from './adminRoutes.js';
import { analyticsRoutes } from './analyticsRoutes.js';
import { notificationRoutes } from './notificationRoutes.js';

export const apiRoutes = express.Router();

apiRoutes.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', service: 'smart-placement-api' });
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/profiles', profileRoutes);
apiRoutes.use('/jobs', jobRoutes);
apiRoutes.use('/applications', applicationRoutes);
apiRoutes.use('/admin', adminRoutes);
apiRoutes.use('/analytics', analyticsRoutes);
apiRoutes.use('/notifications', notificationRoutes);
