import { body } from 'express-validator';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Recruiter } from '../models/Recruiter.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashToken, randomToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { ROLES } from '../utils/constants.js';
import { sendEmail } from '../services/emailService.js';
import { logActivity } from '../services/auditService.js';

const authPayload = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken
  };
};

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role')
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const register = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new AppError('Email already registered', 409);

  const emailVerificationToken = randomToken();
  const user = await User.create({ ...req.body, emailVerificationToken });
  if (user.role === ROLES.STUDENT) await Student.create({ user: user._id });
  if (user.role === ROLES.RECRUITER) await Recruiter.create({ user: user._id });

  await sendEmail({
    to: user.email,
    subject: 'Verify your placement account',
    html: `<p>Your verification token is <strong>${emailVerificationToken}</strong>.</p>`
  });

  await logActivity({ req, actor: user._id, action: 'auth.register', entity: 'User', entityId: user._id });
  res.status(201).json({ success: true, ...(await authPayload(user)) });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) throw new AppError('Invalid credentials', 401);

  user.lastLoginAt = new Date();
  await logActivity({ req, actor: user._id, action: 'auth.login', entity: 'User', entityId: user._id });
  res.json({ success: true, ...(await authPayload(user)) });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required', 401);

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id);
  if (!user || user.tokenVersion !== decoded.tokenVersion || user.refreshTokenHash !== hashToken(refreshToken)) {
    throw new AppError('Invalid refresh token', 401);
  }

  res.json({ success: true, ...(await authPayload(user)) });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { emailVerificationToken: req.body.token },
    { isEmailVerified: true, emailVerificationToken: undefined },
    { new: true }
  );
  if (!user) throw new AppError('Invalid verification token', 400);
  res.json({ success: true, message: 'Email verified' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const token = randomToken();
  const user = await User.findOneAndUpdate(
    { email: req.body.email },
    { passwordResetToken: hashToken(token), passwordResetExpires: Date.now() + 15 * 60 * 1000 },
    { new: true }
  );

  if (user) {
    await sendEmail({
      to: user.email,
      subject: 'Reset your placement account password',
      html: `<p>Your password reset token is <strong>${token}</strong>.</p>`
    });
  }

  res.json({ success: true, message: 'If the email exists, a reset token has been sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    passwordResetToken: hashToken(req.body.token),
    passwordResetExpires: { $gt: Date.now() }
  }).select('+password');

  if (!user) throw new AppError('Invalid or expired reset token', 400);
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion += 1;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
