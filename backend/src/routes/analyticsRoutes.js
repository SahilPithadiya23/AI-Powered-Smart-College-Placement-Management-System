import express from 'express';
import { branchPlacements, dashboard, interviewPrep } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/auth.js';

export const analyticsRoutes = express.Router();

analyticsRoutes.use(protect);
analyticsRoutes.get('/dashboard', dashboard);
analyticsRoutes.get('/branch-placements', branchPlacements);
analyticsRoutes.post('/interview-prep', interviewPrep);
