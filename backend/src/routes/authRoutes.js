import express from 'express';
import {
  forgotPassword,
  login,
  loginValidation,
  me,
  refresh,
  register,
  registerValidation,
  resetPassword,
  verifyEmail
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

export const authRoutes = express.Router();

authRoutes.post('/register', registerValidation, validate, register);
authRoutes.post('/login', loginValidation, validate, login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/verify-email', verifyEmail);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/reset-password', resetPassword);
authRoutes.get('/me', protect, me);
