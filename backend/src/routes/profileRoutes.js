import express from 'express';
import {
  deleteResume,
  getProfile,
  listResumes,
  setDefaultResume,
  updateStudentProfile,
  uploadResume,
  upsertCompany
} from '../controllers/profileController.js';
import { authorize, protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { ROLES } from '../utils/constants.js';

export const profileRoutes = express.Router();

profileRoutes.use(protect);
profileRoutes.get('/me', getProfile);
profileRoutes.put('/student', authorize(ROLES.STUDENT), upload.single('profilePhoto'), updateStudentProfile);
profileRoutes.put('/company', authorize(ROLES.RECRUITER), upload.single('logo'), upsertCompany);
profileRoutes.get('/resumes', authorize(ROLES.STUDENT), listResumes);
profileRoutes.post('/resumes', authorize(ROLES.STUDENT), upload.single('resume'), uploadResume);
profileRoutes.patch('/resumes/:id/default', authorize(ROLES.STUDENT), setDefaultResume);
profileRoutes.delete('/resumes/:id', authorize(ROLES.STUDENT), deleteResume);
