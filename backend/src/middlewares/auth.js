import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/token.js';
import { User } from '../models/User.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) throw new AppError('Authentication required', 401);

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id).select('-password');
  if (!user || !user.isActive) throw new AppError('User is no longer active', 401);

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AppError('You do not have permission to access this resource', 403);
  }
  next();
};
