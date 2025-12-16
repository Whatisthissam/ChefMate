import express from 'express';
import { body, validationResult } from 'express-validator';

import { Recipe } from '../models/Recipe.js';
import { UserRecipe } from '../models/UserRecipe.js';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

export const userRecipesRouter = express.Router();

userRecipesRouter.post(
  '/',
  requireAuth,
  [
    body('title').isString().trim().isLength({ min: 2 }),
    body('ingredients').isArray({ min: 1 }),
    body('ingredients.*.name').isString().trim().isLength({ min: 1 }),
    body('ingredients.*.quantity').isNumeric(),
    body('ingredients.*.unit').isString().trim().isLength({ min: 1 }),
    body('description').optional().isString(),
    body('cookTimeMinutes').optional().isNumeric(),
    body('prepTimeMinutes').optional().isNumeric(),
    body('servingsDefault').optional().isNumeric(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('cuisine').optional().isString(),
    body('mealTypes').optional().isArray(),
    body('dietaryTags').optional().isArray(),
    body('steps').optional().isArray(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
      }

      const recipe = new Recipe({
        ...req.body,
        thumbnailUrl: '',
        popularity: 0,
        publisherUserId: req.user._id,
        publisherName: req.user.name,
      });
      await recipe.save();

      const ur = await UserRecipe.create({
        userId: req.user._id,
        username: req.user.name,
        recipeId: recipe._id,
        recipeSnapshot: {
          _id: recipe._id,
          title: recipe.title,
          description: recipe.description,
          thumbnailUrl: recipe.thumbnailUrl,
          cookTimeMinutes: recipe.cookTimeMinutes,
          servingsDefault: recipe.servingsDefault,
          difficulty: recipe.difficulty,
          cuisine: recipe.cuisine,
          mealTypes: recipe.mealTypes,
        },
      });

      res.status(201).json({ id: String(recipe._id), userRecipeId: String(ur._id) });
    } catch (err) {
      next(err);
    }
  }
);

userRecipesRouter.delete('/:userRecipeId', requireAuth, async (req, res, next) => {
  try {
    const ur = await UserRecipe.findById(req.params.userRecipeId).lean();
    if (!ur) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (String(ur.userId) !== String(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await UserRecipe.deleteOne({ _id: ur._id });

    const otherRefs = await UserRecipe.countDocuments({ recipeId: ur.recipeId });
    if (otherRefs === 0) {
      await Recipe.deleteOne({ _id: ur.recipeId });
      await User.updateMany({ savedRecipes: ur.recipeId }, { $pull: { savedRecipes: ur.recipeId } });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

userRecipesRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const items = await UserRecipe.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate(
        'recipeId',
        'title description thumbnailUrl cookTimeMinutes servingsDefault difficulty popularity publisherName cuisine mealTypes'
      )
      .lean();

    res.json({
      items: (items || []).map((ur) => {
        const recipe = ur.recipeId || ur.recipeSnapshot || {};
        const rid = recipe?._id || ur.recipeId;
        return {
          ...recipe,
          publisherName: recipe?.publisherName || ur.username,
          id: rid ? String(rid) : undefined,
          userRecipeId: String(ur._id),
          username: ur.username,
          createdAt: ur.createdAt,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});
