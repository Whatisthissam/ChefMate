import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';

export const usersRouter = express.Router();

usersRouter.get('/me', requireAuth, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
  });
});

usersRouter.get('/me/saved', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedRecipes', 'title description thumbnailUrl cookTimeMinutes difficulty popularity')
      .lean();

    res.json({ items: (user?.savedRecipes || []).map((r) => ({ ...r, id: String(r._id) })) });
  } catch (err) {
    next(err);
  }
});

usersRouter.post(
  '/me/saved',
  requireAuth,
  [body('recipeId').isString().isLength({ min: 1 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
      }

      const { recipeId } = req.body;
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { savedRecipes: recipeId } },
        { new: true }
      );

      res.status(201).json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

usersRouter.delete('/me/saved/:recipeId', requireAuth, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { savedRecipes: req.params.recipeId } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
