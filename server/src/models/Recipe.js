import mongoose from 'mongoose';

const ingredientNutritionSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
  },
  { _id: false }
);

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    nutritionPerUnit: { type: ingredientNutritionSchema, default: () => ({}) },
  },
  { _id: false }
);

const detailedStepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    detailedInstructions: [{ type: String, required: true, trim: true }],
    timeMinutes: { type: Number, default: 0 },
    tips: [{ type: String, trim: true }],
    warnings: [{ type: String, trim: true }],
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    thumbnailUrl: { type: String, default: '' },
    publisherUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    publisherName: { type: String, default: '', trim: true },
    cuisine: { type: String, default: '' },
    mealTypes: [{ type: String, default: [] }],
    dietaryTags: [{ type: String, default: [] }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    cookTimeMinutes: { type: Number, default: 0 },
    prepTimeMinutes: { type: Number, default: 0 },
    servingsDefault: { type: Number, default: 1 },
    popularity: { type: Number, default: 0 },
    ingredients: { type: [ingredientSchema], default: [] },
    steps: { type: [String], default: [] }, // Keep for backward compatibility
    detailedSteps: { type: [detailedStepSchema], default: [] },
    ingredientNames: { type: [String], default: [] },
    equipment: [{ type: String, trim: true }],
    notes: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

function computeIngredientNames(ingredients) {
  return (ingredients || [])
    .map((i) => (i?.name || '').toLowerCase().trim())
    .filter(Boolean);
}

recipeSchema.pre('save', function preSave(next) {
  this.ingredientNames = computeIngredientNames(this.ingredients);
  next();
});

// insertMany does NOT trigger save middleware; ensure ingredientNames exists for seeded data.
recipeSchema.pre('insertMany', function preInsertMany(next, docs) {
  for (const doc of docs || []) {
    doc.ingredientNames = computeIngredientNames(doc.ingredients);
  }
  next();
});

recipeSchema.index({ ingredientNames: 1 });
recipeSchema.index({ popularity: -1 });

export const Recipe = mongoose.model('Recipe', recipeSchema);
