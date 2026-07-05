import { asyncHandler } from '../utils/asyncHandler.js';
import { branchWisePlacements, getDashboardStats } from '../services/analyticsService.js';
import { generateInterviewQuestions } from '../services/interviewPrepService.js';

export const dashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats(req.user.role, req.user._id);
  res.json({ success: true, stats });
});

export const branchPlacements = asyncHandler(async (_req, res) => {
  const data = await branchWisePlacements();
  res.json({ success: true, data });
});

export const interviewPrep = asyncHandler(async (req, res) => {
  res.json({ success: true, questions: generateInterviewQuestions(req.body) });
});
