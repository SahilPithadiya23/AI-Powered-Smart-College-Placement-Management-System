import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { branchWisePlacements, getDashboardStats } from '../services/analyticsService.js';
import {
  getStudentInterviewContext,
  generatePrepQuestions,
  evaluatePracticeAnswer,
  generateQuestionFollowUps,
  handleCoachChat
} from '../services/interviewPrepService.js';

const classifyAIError = (error, defaultMessage = 'AI service is temporarily unavailable. Please try again.') => {
  const status = error.status || error.statusCode || 500;
  const msg = (error.message || '').toLowerCase();

  // Rate limit
  if (status === 429 || msg.includes('429') || msg.includes('rate limit') || msg.includes('quota') || msg.includes('busy')) {
    return new AppError('AI service is temporarily busy. Please try again shortly.', 429);
  }

  // Provider authentication
  if (status === 401 || msg.includes('api key') || msg.includes('authentication') || msg.includes('unauthorized')) {
    return new AppError('Placement AI is not configured correctly on the server.', 502);
  }

  // Timeout
  if (status === 408 || status === 504 || msg.includes('timeout') || msg.includes('timed out') || msg.includes('abort') || error.code === 'ETIMEDOUT') {
    return new AppError('Request timed out while generating questions. Try requesting fewer questions.', 504);
  }

  // Malformed output / JSON parse
  if (msg.includes('json') || msg.includes('parse') || msg.includes('valid questions array')) {
    return new AppError('Unable to format AI questions correctly. Please retry your generation.', 502);
  }

  // Input validation
  if (status === 400 || msg.includes('required') || msg.includes('invalid')) {
    return new AppError(error.message || 'Please select a target role and question settings.', 400);
  }

  return new AppError(defaultMessage, status >= 400 && status < 600 ? status : 503);
};

export const dashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats(req.user.role, req.user._id);
  res.json({ success: true, stats });
});

export const branchPlacements = asyncHandler(async (_req, res) => {
  const data = await branchWisePlacements();
  res.json({ success: true, data });
});

export const interviewContext = asyncHandler(async (req, res) => {
  const { student, resume, context, contextReadiness } = await getStudentInterviewContext(req.user._id);

  res.json({
    success: true,
    student: context.student,
    resume: resume
      ? {
          id: resume._id,
          label: resume.label,
          fileUrl: resume.fileUrl,
          isDefault: resume.isDefault,
          parsed: context.resume,
          updatedAt: resume.updatedAt
        }
      : null,
    contextReadiness
  });
});

export const interviewPrep = asyncHandler(async (req, res) => {
  const { role, company, questionType, difficulty, count } = req.body || {};

  if (!role || typeof role !== 'string' || !role.trim()) {
    throw new AppError('Please select or specify a target role.', 400);
  }

  try {
    const questions = await generatePrepQuestions(req.user._id, {
      role: role.trim(),
      company: company ? String(company).trim() : '',
      questionType,
      difficulty,
      count
    });
    res.json({ success: true, questions });
  } catch (error) {
    console.error('[analyticsController.interviewPrep Error]:', {
      provider: 'groq',
      feature: 'placement-ai',
      route: 'interview-prep',
      status: error.status || error.statusCode || 500,
      message: error.message
    });
    throw classifyAIError(error, 'AI service is temporarily unavailable. Please try again.');
  }
});

export const interviewAnswer = asyncHandler(async (req, res) => {
  const { question, studentAnswer, role, company } = req.body || {};

  if (!question || !studentAnswer) {
    throw new AppError('Question and studentAnswer are required fields.', 400);
  }

  try {
    const feedback = await evaluatePracticeAnswer(req.user._id, {
      question,
      studentAnswer,
      role,
      company
    });
    res.json({ success: true, feedback });
  } catch (error) {
    console.error('[analyticsController.interviewAnswer Error]:', {
      provider: 'groq',
      feature: 'placement-ai',
      route: 'interview-answer',
      status: error.status || error.statusCode || 500,
      message: error.message
    });
    throw classifyAIError(error, 'Failed to evaluate answer. Please try again.');
  }
});

export const interviewFollowUp = asyncHandler(async (req, res) => {
  const { question, studentAnswer, role, company } = req.body || {};

  if (!question) {
    throw new AppError('Question is required to generate follow-ups.', 400);
  }

  try {
    const followUps = await generateQuestionFollowUps(req.user._id, {
      question,
      studentAnswer,
      role,
      company
    });
    res.json({ success: true, followUps });
  } catch (error) {
    console.error('[analyticsController.interviewFollowUp Error]:', {
      provider: 'groq',
      feature: 'placement-ai',
      route: 'interview-followup',
      status: error.status || error.statusCode || 500,
      message: error.message
    });
    throw classifyAIError(error, 'Failed to generate follow-up questions. Please try again.');
  }
});

export const aiChat = asyncHandler(async (req, res) => {
  const { messages, context } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AppError('Messages array is required.', 400);
  }

  try {
    const result = await handleCoachChat(req.user._id, {
      messages,
      context
    });
    res.json({
      success: true,
      message: result.message,
      suggestedActions: result.suggestedActions
    });
  } catch (error) {
    console.error('[analyticsController.aiChat Error]:', {
      provider: 'groq',
      feature: 'placement-ai',
      route: 'ai-chat',
      status: error.status || error.statusCode || 500,
      message: error.message
    });
    throw classifyAIError(error, 'AI coach is temporarily unavailable. Please try again.');
  }
});
