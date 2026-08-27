import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      match: [/^[\p{L}][\p{L}\s.'-]*$/u, 'Name must contain letters only']
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
      validate: {
        validator: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password),
        message: 'Password must include uppercase, lowercase, and a number'
      }
    },
    role: { type: String, enum: Object.values(ROLES), required: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    recruiterApproved: { type: Boolean, default: false },
    refreshTokenHash: String,
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: Date
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
