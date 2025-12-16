import mongoose from 'mongoose';

const userRecipeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    username: { type: String, required: true, trim: true },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true, index: true },
    recipeSnapshot: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  },
  { timestamps: true }
);

userRecipeSchema.index({ userId: 1, createdAt: -1 });

export const UserRecipe = mongoose.model('UserRecipe', userRecipeSchema);
