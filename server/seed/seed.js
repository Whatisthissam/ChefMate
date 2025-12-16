import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Recipe } from '../src/models/Recipe.js';
import { detailedRecipeSteps } from './detailedRecipes.js';

const __dirname = new URL('.', import.meta.url).pathname;

async function run() {
  await connectDB();

  const recipesPath = path.join(__dirname, 'recipes.json');
  const raw = fs.readFileSync(recipesPath, 'utf-8');
  const recipes = JSON.parse(raw);

  const mealKeys = ['breakfast', 'lunch', 'dinner', 'dessert', 'snacks', 'drinks'];

  function inferMeals(r) {
    const t = String(r.title || '').toLowerCase();
    if (t.includes('smoothie') || t.includes('lassi') || t.includes('coffee') || t.includes('tea') || t.includes('juice')) {
      return ['drinks'];
    }
    if (t.includes('pudding') || t.includes('cake') || t.includes('cookie') || t.includes('brownie') || t.includes('ice')) {
      return ['dessert'];
    }
    if (t.includes('omelette') || t.includes('toast') || t.includes('parfait') || t.includes('oats') || t.includes('pancake') || t.includes('shakshuka') || t.includes('dosa')) {
      return ['breakfast'];
    }
    if (t.includes('salad') || t.includes('bowl') || t.includes('sandwich') || t.includes('wrap') || t.includes('soup') || t.includes('quesadilla') || t.includes('burrito')) {
      return ['lunch'];
    }
    return ['dinner'];
  }

  function ensureMealsOnRecipes(list) {
    return (list || []).map((r) => {
      const mealTypes = Array.isArray(r.mealTypes) && r.mealTypes.length ? r.mealTypes : inferMeals(r);
      
      // Add detailed steps if available for this recipe
      const detailedSteps = detailedRecipeSteps[r.title];
      if (detailedSteps) {
        return { 
          ...r, 
          mealTypes,
          prepTimeMinutes: detailedSteps.prepTimeMinutes || 0,
          detailedSteps: detailedSteps.detailedSteps || [],
          equipment: detailedSteps.equipment || [],
          notes: detailedSteps.notes || []
        };
      }
      
      return { ...r, mealTypes };
    });
  }

  function makeSimpleRecipe({ title, mealTypes, thumbnailUrl, cuisine, dietaryTags, difficulty, cookTimeMinutes, servingsDefault, popularity }) {
    return {
      title,
      description: `A simple ${mealTypes[0]} recipe.`,
      thumbnailUrl,
      cuisine,
      mealTypes,
      dietaryTags,
      difficulty,
      cookTimeMinutes,
      servingsDefault,
      popularity,
      ingredients: [
        { name: 'oil', quantity: 1, unit: 'tbsp', nutritionPerUnit: { calories: 119, carbs: 0, fat: 13.5, protein: 0 } },
        { name: 'salt', quantity: 1, unit: 'tsp', nutritionPerUnit: { calories: 0, carbs: 0, fat: 0, protein: 0 } },
        { name: 'tomato', quantity: 1, unit: 'piece', nutritionPerUnit: { calories: 22, carbs: 4.8, fat: 0.2, protein: 1.1 } },
      ],
      steps: ['Prep ingredients.', 'Cook briefly with spices.', 'Serve warm.'],
    };
  }

  let enriched = ensureMealsOnRecipes(recipes);

  const counts = mealKeys.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {});

  for (const r of enriched) {
    for (const m of r.mealTypes || []) {
      if (counts[m] !== undefined) counts[m] += 1;
    }
  }

  const thumb = {
    breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=60',
    lunch: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=60',
    dinner: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?auto=format&fit=crop&w=1200&q=60',
    dessert: 'https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&w=1200&q=60',
    snacks: 'https://images.unsplash.com/photo-1604908176997-125f25cc5002?auto=format&fit=crop&w=1200&q=60',
    drinks: 'https://images.unsplash.com/photo-1546069901-5ec6a79120b3?auto=format&fit=crop&w=1200&q=60',
  };

  const cuisineFor = {
    breakfast: 'International',
    lunch: 'International',
    dinner: 'Indian',
    dessert: 'International',
    snacks: 'International',
    drinks: 'International',
  };

  for (const m of mealKeys) {
    const needed = Math.max(0, 10 - (counts[m] || 0));
    for (let i = 1; i <= needed; i += 1) {
      enriched.push(
        makeSimpleRecipe({
          title: `${m[0].toUpperCase()}${m.slice(1)} Special ${i}`,
          mealTypes: [m],
          thumbnailUrl: thumb[m],
          cuisine: cuisineFor[m],
          dietaryTags: m === 'dessert' || m === 'drinks' ? ['vegetarian'] : [],
          difficulty: 'easy',
          cookTimeMinutes: m === 'dinner' ? 25 : 10,
          servingsDefault: 2,
          popularity: 55 + i,
        })
      );
    }
  }

  await User.deleteMany({});
  await Recipe.deleteMany({});

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user1234', 10);

  const [admin, user] = await User.create([
    { name: 'Admin', email: 'admin@chefmaten.dev', passwordHash: adminPasswordHash, isAdmin: true },
    { name: 'Sample User', email: 'user@chefmaten.dev', passwordHash: userPasswordHash, isAdmin: false },
  ]);

  const created = await Recipe.insertMany(enriched);

  // Save a couple recipes for the sample user
  await User.findByIdAndUpdate(user._id, { $set: { savedRecipes: created.slice(0, 2).map((r) => r._id) } });

  // eslint-disable-next-line no-console
  console.log(`Seed complete: users=${2}, recipes=${created.length}`);
  process.exit(0);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
