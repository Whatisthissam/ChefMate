import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authRouter = express.Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '17d',
  });
}

authRouter.post(
  '/register',
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, passwordHash });

      const token = signToken(user._id.toString());
      res.status(201).json({ token });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 1 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = signToken(user._id.toString());
      res.json({ token });
    } catch (err) {
      next(err);
    }
  }
);
