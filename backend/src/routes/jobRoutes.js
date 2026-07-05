import express from 'express';
import {
  closeJob,
  createJob,
  eligibility,
  hiringFeed,
  listJobs,
  listSavedJobs,
  removeSavedJob,
  saveJob,
  updateJob
} from '../controllers/jobController.js';
import { authorize, protect } from '../middlewares/auth.js';
import { ROLES } from '../utils/constants.js';

export const jobRoutes = express.Router();

jobRoutes.get('/', protect, listJobs);
jobRoutes.get('/feed', hiringFeed);
jobRoutes.use(protect);
jobRoutes.post('/', authorize(ROLES.RECRUITER), createJob);
jobRoutes.put('/:id', authorize(ROLES.RECRUITER), updateJob);
jobRoutes.patch('/:id/close', authorize(ROLES.RECRUITER), closeJob);
jobRoutes.get('/:id/eligibility', authorize(ROLES.STUDENT), eligibility);
jobRoutes.get('/saved/me', authorize(ROLES.STUDENT), listSavedJobs);
jobRoutes.post('/:id/save', authorize(ROLES.STUDENT), saveJob);
jobRoutes.delete('/:id/save', authorize(ROLES.STUDENT), removeSavedJob);
