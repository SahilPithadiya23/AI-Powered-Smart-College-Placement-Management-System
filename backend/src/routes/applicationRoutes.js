import express from 'express';
import {
  applyForJob,
  listApplications,
  releaseOffer,
  respondToOffer,
  scheduleInterview,
  updateApplicationStatus
} from '../controllers/applicationController.js';
import { authorize, protect } from '../middlewares/auth.js';
import { ROLES } from '../utils/constants.js';

export const applicationRoutes = express.Router();

applicationRoutes.use(protect);
applicationRoutes.get('/', listApplications);
applicationRoutes.post('/jobs/:jobId/apply', authorize(ROLES.STUDENT), applyForJob);
applicationRoutes.patch('/:id/status', authorize(ROLES.RECRUITER, ROLES.PLACEMENT_OFFICER, ROLES.ADMIN), updateApplicationStatus);
applicationRoutes.post('/:id/interviews', authorize(ROLES.RECRUITER), scheduleInterview);
applicationRoutes.post('/:id/offers', authorize(ROLES.RECRUITER), releaseOffer);
applicationRoutes.patch('/offers/:id/respond', authorize(ROLES.STUDENT), respondToOffer);
