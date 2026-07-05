import express from 'express';
import {
  adminSummary,
  approveCompany,
  approveRecruiterAccount,
  closeJob,
  deleteJob,
  deleteUser,
  listApplications,
  listJobs,
  listUsers,
  publishAnnouncement,
  reports,
  studentAnalysis,
  updateUser
} from '../controllers/adminController.js';
import { authorize, protect } from '../middlewares/auth.js';
import { ROLES } from '../utils/constants.js';

export const adminRoutes = express.Router();

adminRoutes.use(protect, authorize(ROLES.PLACEMENT_OFFICER, ROLES.ADMIN));
adminRoutes.get('/summary', adminSummary);
adminRoutes.get('/users', listUsers);
adminRoutes.get('/students/analysis', studentAnalysis);
adminRoutes.get('/jobs', listJobs);
adminRoutes.get('/applications', listApplications);
adminRoutes.get('/reports', reports);
adminRoutes.patch('/users/:id', updateUser);
adminRoutes.delete('/users/:id', deleteUser);
adminRoutes.patch('/recruiters/:id/approve', approveRecruiterAccount);
adminRoutes.patch('/companies/:id/approve', approveCompany);
adminRoutes.patch('/jobs/:id/close', closeJob);
adminRoutes.delete('/jobs/:id', deleteJob);
adminRoutes.post('/announcements', publishAnnouncement);
