import express from 'express';
import { body, validationResult } from 'express-validator';
import { Recipe } from '../models/Recipe.js';
import { requireAuth } from '../middleware/auth.js';
import { computeNutritionTotals } from '../utils/nutrition.js';
import { normalizeIngredientList, scoreRecipe } from '../utils/searchRank.js';

export const recipesRouter = express.Router();

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

recipesRouter.get('/search', async (req, res, next) => {
  try {
    const ingredients = normalizeIngredientList(req.query.ingredients);
    const servings = Number(req.query.servings) || 1;
    const difficulty = String(req.query.difficulty || '').trim();
    const cuisine = String(req.query.cuisine || '').trim();
    const dietary = String(req.query.dietary || '').trim();
    const sort = String(req.query.sort || 'best').trim();

    if (ingredients.length === 0) {
      return res.json({ items: [] });
    }

    const selectFields =
      'title description thumbnailUrl cookTimeMinutes servingsDefault difficulty popularity publisherName ingredientNames ingredients.quantity ingredients.nutritionPerUnit';

    // Search logic:
    // - MongoDB $in on normalized ingredientNames
    // - Rank in-memory with match + missing + popularity
    const mongoQuery = {
      ingredientNames: { $in: ingredients },
      ...(difficulty ? { difficulty } : {}),
      ...(cuisine ? { cuisine } : {}),
      ...(dietary ? { dietaryTags: dietary } : {}),
    };

    const candidates = await Recipe.find(mongoQuery)
      .select(selectFields)
      .limit(60)
      .lean();

    const scored = candidates
      .map((r) => {
        const { matchCount, missingCount, score } = scoreRecipe({
          recipeIngredientNames: r.ingredientNames || [],
          queryIngredients: ingredients,
          popularity: r.popularity,
        });

        return {
          id: String(r._id),
          title: r.title,
          description: r.description,
          thumbnailUrl: r.thumbnailUrl,
          cookTimeMinutes: r.cookTimeMinutes,
          difficulty: r.difficulty,
          servingsDefault: r.servingsDefault,
          popularity: r.popularity,
          publisherName: r.publisherName,
          matchCount,
          missingCount,
          score,
          nutrition: computeNutritionTotals(r, servings),
        };
      })
      .sort((a, b) => {
        if (sort === 'popular') {
          if ((b.popularity || 0) !== (a.popularity || 0)) return (b.popularity || 0) - (a.popularity || 0);
          return b.score - a.score;
        }
        if (sort === 'time') {
          if ((a.cookTimeMinutes || 0) !== (b.cookTimeMinutes || 0)) return (a.cookTimeMinutes || 0) - (b.cookTimeMinutes || 0);
          return b.score - a.score;
        }
        return b.score - a.score;
      })
      .slice(0, 20);

    if (scored.length) {
      return res.json({ items: scored });
    }

    const rawQuery = String(req.query.ingredients || '').trim();
    if (!rawQuery) {
      return res.json({ items: [] });
    }

    const titleQuery = {
      title: { $regex: escapeRegex(rawQuery), $options: 'i' },
      ...(difficulty ? { difficulty } : {}),
      ...(cuisine ? { cuisine } : {}),
      ...(dietary ? { dietaryTags: dietary } : {}),
    };

    const titleCandidates = await Recipe.find(titleQuery)
      .select(selectFields)
      .sort(
        sort === 'time'
          ? { cookTimeMinutes: 1 }
          : sort === 'popular'
            ? { popularity: -1 }
            : { popularity: -1 }
      )
      .limit(20)
      .lean();

    res.json({
      items: (titleCandidates || []).map((r) => ({
        id: String(r._id),
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        cookTimeMinutes: r.cookTimeMinutes,
        difficulty: r.difficulty,
        servingsDefault: r.servingsDefault,
        popularity: r.popularity,
        publisherName: r.publisherName,
        matchCount: 0,
        missingCount: 0,
        score: r.popularity || 0,
        nutrition: computeNutritionTotals(r, servings),
      })),
    });
  } catch (err) {
    next(err);
  }
});

recipesRouter.get('/trending', async (req, res, next) => {
  try {
    const cuisine = String(req.query.cuisine || '').trim();
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 12));

    const query = {
      ...(cuisine ? { cuisine } : {}),
    };

    const items = await Recipe.find(query)
      .sort({ popularity: -1 })
      .limit(limit)
      .select('title description thumbnailUrl cookTimeMinutes servingsDefault difficulty popularity publisherName')
      .lean();

    res.json({
      items: items.map((r) => ({
        id: String(r._id),
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        cookTimeMinutes: r.cookTimeMinutes,
        servingsDefault: r.servingsDefault,
        difficulty: r.difficulty,
        popularity: r.popularity,
        publisherName: r.publisherName,
      })),
    });
  } catch (err) {
    next(err);
  }
});

recipesRouter.get('/ingredients/suggest', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').toLowerCase().trim();
    if (!q || q.length < 2) {
      return res.json({ items: [] });
    }

    const items = await Recipe.aggregate([
      { $unwind: '$ingredientNames' },
      { $match: { ingredientNames: { $regex: `^${q}` } } },
      { $group: { _id: '$ingredientNames' } },
      { $sort: { _id: 1 } },
      { $limit: 10 },
      { $project: { _id: 0, value: '$_id' } },
    ]);

    res.json({ items: items.map((i) => i.value) });
  } catch (err) {
    next(err);
  }
});

recipesRouter.get('/by-meal', async (req, res, next) => {
  try {
    const meal = String(req.query.meal || '').trim();
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 10));

    if (!meal) {
      return res.json({ items: [] });
    }

    const items = await Recipe.find({ mealTypes: meal })
      .sort({ popularity: -1 })
      .limit(limit)
      .select('title description thumbnailUrl cookTimeMinutes servingsDefault difficulty popularity publisherName cuisine mealTypes')
      .lean();

    res.json({
      items: items.map((r) => ({
        id: String(r._id),
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        cookTimeMinutes: r.cookTimeMinutes,
        servingsDefault: r.servingsDefault,
        difficulty: r.difficulty,
        popularity: r.popularity,
        publisherName: r.publisherName,
        cuisine: r.cuisine,
        mealTypes: r.mealTypes || [],
      })),
    });
  } catch (err) {
    next(err);
  }
});

recipesRouter.get('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const servings = Number(req.query.servings) || 1;

    res.json({
      ...recipe,
      id: String(recipe._id),
      nutrition: computeNutritionTotals(recipe, servings),
    });
  } catch (err) {
    next(err);
  }
});

recipesRouter.post(
  '/',
  requireAuth,
  [
    body('title').isString().trim().isLength({ min: 2 }),
    body('ingredients').isArray({ min: 1 }),
    body('ingredients.*.name').isString().trim().isLength({ min: 1 }),
    body('ingredients.*.quantity').isNumeric(),
    body('ingredients.*.unit').isString().trim().isLength({ min: 1 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
      }

      const recipe = new Recipe(req.body);
      await recipe.save();
      res.status(201).json({ id: recipe._id });
    } catch (err) {
      next(err);
    }
  }
);

recipesRouter.put(
  '/:id',
  requireAuth,
  [body('title').optional().isString().trim().isLength({ min: 2 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
      }

      const payload = { ...req.body };
      if (Array.isArray(payload.ingredients)) {
        payload.ingredientNames = payload.ingredients
          .map((i) => (i?.name || '').toLowerCase().trim())
          .filter(Boolean);
      }

      const updated = await Recipe.findByIdAndUpdate(req.params.id, payload, { new: true });
      if (!updated) {
        return res.status(404).json({ message: 'Recipe not found' });
      }

      res.json({ id: updated._id });
    } catch (err) {
      next(err);
    }
  }
);

recipesRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).select('_id publisherUserId').lean();
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (String(recipe.publisherUserId || '') !== String(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Recipe.deleteOne({ _id: recipe._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
