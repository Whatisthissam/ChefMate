import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';

import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { Slider } from '../components/ui/Slider.jsx';
import { ImageWithFallback } from '../components/ui/ImageWithFallback.jsx';
import { DetailedSteps } from '../components/recipes/DetailedSteps.jsx';
import { apiFetch } from '../lib/api.js';
import { computeNutritionTotals } from '../lib/nutrition.js';
import { cn } from '../lib/cn.js';
import { useAuth } from '../state/AuthContext.jsx';

export function RecipeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!id) return;
      setLoading(true);
      setRecipe(null);
      try {
        const data = await apiFetch(`/recipes/${id}`);
        if (!ignore) {
          setRecipe(data);
          setServings(data.servingsDefault || 1);
        }
      } catch {
        if (!ignore) setRecipe(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    let ignore = false;

    async function loadSaved() {
      if (!token || !id) {
        setSaved(false);
        return;
      }
      try {
        const res = await apiFetch('/users/me/saved', { token });
        const set = new Set((res.items || []).map((r) => String(r.id || r._id)));
        if (!ignore) setSaved(set.has(String(id)));
      } catch {
        if (!ignore) setSaved(false);
      }
    }

    loadSaved();
    return () => {
      ignore = true;
    };
  }, [token, id]);

  const nutrition = useMemo(() => {
    if (!recipe) return null;
    return computeNutritionTotals(recipe, servings);
  }, [recipe, servings]);

  async function toggleSave() {
    if (!token || !recipe?.id) return;

    try {
      if (saved) {
        await apiFetch(`/users/me/saved/${recipe.id}`, { token, method: 'DELETE' });
        setSaved(false);
      } else {
        await apiFetch('/users/me/saved', { token, method: 'POST', body: { recipeId: recipe.id } });
        setSaved(true);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-[#efe6da] py-8 dark:bg-neutral-950">
      <div className="container-page">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-text/70 hover:text-text dark:text-neutral-300 dark:hover:text-neutral-50"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {loading ? (
            <div className="mt-6 grid gap-4">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-56 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : recipe ? (
            <div className="mt-6 grid gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-text dark:text-neutral-50 md:text-2xl">{recipe.title}</h1>
                  <p className="mt-1 text-sm text-text/70 dark:text-neutral-300">{recipe.description}</p>
                  {recipe.publisherName ? (
                    <div className="mt-1 text-xs text-text/60 dark:text-neutral-300">Published by {recipe.publisherName}</div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="bg-black/5 text-text dark:bg-white/10 dark:text-neutral-100">
                      {recipe.cookTimeMinutes || 0} min
                    </Badge>
                    <Badge className="bg-black/5 text-text dark:bg-white/10 dark:text-neutral-100">
                      {recipe.difficulty}
                    </Badge>
                    {recipe.cuisine ? (
                      <Badge className="bg-black/5 text-text dark:bg-white/10 dark:text-neutral-100">{recipe.cuisine}</Badge>
                    ) : null}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className={cn('h-9 w-9 px-0', saved ? 'text-accent' : 'text-text/60')}
                  onClick={toggleSave}
                  aria-label={saved ? 'Unsave recipe' : 'Save recipe'}
                  disabled={!token}
                >
                  <Star className={cn('h-5 w-5', saved ? 'fill-current' : '')} />
                </Button>
              </div>

              <ImageWithFallback src={recipe.thumbnailUrl} alt={recipe.title} className="h-56 w-full rounded-lg object-cover" />

              <div className="grid gap-3 rounded-lg border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-950">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-text dark:text-neutral-50">Scale servings</div>
                  <div className="text-sm text-text/70 dark:text-neutral-300">{servings}</div>
                </div>
                <Slider
                  value={[servings]}
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={(v) => setServings(v?.[0] ?? 1)}
                  aria-label="Servings"
                />
              </div>

              {nutrition ? (
                <div className="grid gap-3 rounded-lg border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-950">
                  <div className="text-sm font-semibold text-text dark:text-neutral-50">Nutrition (estimated)</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-black/5 p-3 dark:bg-white/5">
                      <div className="text-text/70 dark:text-neutral-300">Calories</div>
                      <div className="mt-1 font-semibold text-text dark:text-neutral-50">{Math.round(nutrition.total.calories)}</div>
                    </div>
                    <div className="rounded-md bg-black/5 p-3 dark:bg-white/5">
                      <div className="text-text/70 dark:text-neutral-300">Protein (g)</div>
                      <div className="mt-1 font-semibold text-text dark:text-neutral-50">{nutrition.total.protein.toFixed(1)}</div>
                    </div>
                    <div className="rounded-md bg-black/5 p-3 dark:bg-white/5">
                      <div className="text-text/70 dark:text-neutral-300">Carbs (g)</div>
                      <div className="mt-1 font-semibold text-text dark:text-neutral-50">{nutrition.total.carbs.toFixed(1)}</div>
                    </div>
                    <div className="rounded-md bg-black/5 p-3 dark:bg-white/5">
                      <div className="text-text/70 dark:text-neutral-300">Fat (g)</div>
                      <div className="mt-1 font-semibold text-text dark:text-neutral-50">{nutrition.total.fat.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 rounded-lg border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-950">
                <div>
                  <div className="text-sm font-semibold text-text dark:text-neutral-50">Ingredients</div>
                  <ul className="mt-2 grid gap-1.5 text-sm text-text/80 dark:text-neutral-200">
                    {(recipe.ingredients || []).map((ing) => (
                      <li key={`${ing.name}-${ing.unit}`}>
                        <span className="font-medium text-text dark:text-neutral-50">{ing.name}</span> — {ing.quantity} {ing.unit}
                      </li>
                    ))}
                  </ul>
                </div>

                <DetailedSteps recipe={recipe} />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-black/5 bg-white/70 p-6 text-sm text-text/70 dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-300">
              Recipe not found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
