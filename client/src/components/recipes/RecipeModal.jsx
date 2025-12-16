import { useEffect, useMemo, useState } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/Dialog.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Slider } from '../ui/Slider.jsx';
import { ImageWithFallback } from '../ui/ImageWithFallback.jsx';
import { DetailedSteps } from './DetailedSteps.jsx';
import { apiFetch } from '../../lib/api.js';
import { computeNutritionTotals } from '../../lib/nutrition.js';

export function RecipeModal({ open, onOpenChange, recipeId }) {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!open || !recipeId) return;
      setLoading(true);
      setRecipe(null);
      try {
        const data = await apiFetch(`/recipes/${recipeId}`);
        if (!ignore) {
          setRecipe(data);
          setServings(data.servingsDefault || 1);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [open, recipeId]);

  const nutrition = useMemo(() => {
    if (!recipe) return null;
    return computeNutritionTotals(recipe, servings);
  }, [recipe, servings]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        {loading ? (
          <div className="grid gap-4">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : recipe ? (
          <div className="grid gap-3">
            <div>
              <DialogTitle>{recipe.title}</DialogTitle>
              <DialogDescription className="mt-1">{recipe.description}</DialogDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{recipe.cookTimeMinutes || 0} min</Badge>
                <Badge className="bg-black/5 text-text dark:bg-white/10 dark:text-neutral-100">
                  {recipe.difficulty}
                </Badge>
                {(recipe.dietaryTags || []).slice(0, 3).map((t) => (
                  <Badge key={t} className="bg-black/5 text-text dark:bg-white/10 dark:text-neutral-100">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <ImageWithFallback
              src={recipe.thumbnailUrl}
              alt={recipe.title}
              className="h-48 w-full rounded-lg object-cover"
              loading="lazy"
            />

            <section className="grid gap-2">
              <h4 className="text-sm font-semibold">Scale servings</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted dark:text-neutral-300">Servings</span>
                <span className="font-medium">{servings}</span>
              </div>
              <Slider
                value={[servings]}
                min={1}
                max={8}
                step={1}
                onValueChange={(v) => setServings(v?.[0] ?? 1)}
                aria-label="Servings"
              />
            </section>

            <section className="grid gap-2">
              <h4 className="text-sm font-semibold">Nutrition (estimated)</h4>
              {nutrition ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border border-black/10 p-3 dark:border-white/10">
                    <div className="text-muted dark:text-neutral-300">Calories</div>
                    <div className="mt-1 font-semibold">{Math.round(nutrition.total.calories)}</div>
                  </div>
                  <div className="rounded-md border border-black/10 p-3 dark:border-white/10">
                    <div className="text-muted dark:text-neutral-300">Protein (g)</div>
                    <div className="mt-1 font-semibold">{nutrition.total.protein.toFixed(1)}</div>
                  </div>
                  <div className="rounded-md border border-black/10 p-3 dark:border-white/10">
                    <div className="text-muted dark:text-neutral-300">Carbs (g)</div>
                    <div className="mt-1 font-semibold">{nutrition.total.carbs.toFixed(1)}</div>
                  </div>
                  <div className="rounded-md border border-black/10 p-3 dark:border-white/10">
                    <div className="text-muted dark:text-neutral-300">Fat (g)</div>
                    <div className="mt-1 font-semibold">{nutrition.total.fat.toFixed(1)}</div>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="grid gap-2">
              <h4 className="text-sm font-semibold">Ingredients</h4>
              <ul className="grid gap-1.5 text-sm">
                {(recipe.ingredients || []).map((ing) => (
                  <li key={`${ing.name}-${ing.unit}`} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <span>
                      <span className="font-medium">{ing.name}</span> — {ing.quantity} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <DetailedSteps recipe={recipe} />
          </div>
        ) : (
          <div className="text-sm text-muted dark:text-neutral-300">No recipe selected.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
