import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { apiFetch } from '../lib/api.js';
import { cn } from '../lib/cn.js';
import { useAuth } from '../state/AuthContext.jsx';

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AddRecipePage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [cookTimeMinutes, setCookTimeMinutes] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('');
  const [servingsDefault, setServingsDefault] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [mealTypes, setMealTypes] = useState('');
  const [dietaryTags, setDietaryTags] = useState('');

  const [stepsText, setStepsText] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    const hasOneIngredient = ingredients.some((i) => String(i.name || '').trim());
    return hasOneIngredient;
  }, [title, ingredients]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      cuisine: cuisine.trim(),
      mealTypes: splitCsv(mealTypes),
      dietaryTags: splitCsv(dietaryTags),
      cookTimeMinutes: cookTimeMinutes ? Number(cookTimeMinutes) : 0,
      prepTimeMinutes: prepTimeMinutes ? Number(prepTimeMinutes) : 0,
      servingsDefault: servingsDefault ? Number(servingsDefault) : 1,
      steps: stepsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      ingredients: ingredients
        .map((i) => ({
          name: String(i.name || '').trim(),
          quantity: i.quantity === '' ? NaN : Number(i.quantity),
          unit: String(i.unit || '').trim(),
        }))
        .filter((i) => i.name),
    };

    const invalidIngredient = payload.ingredients.some((i) => !i.unit || Number.isNaN(i.quantity));
    if (!payload.title) {
      setError('Title is required.');
      return;
    }
    if (!payload.ingredients.length) {
      setError('Add at least 1 ingredient.');
      return;
    }
    if (invalidIngredient) {
      setError('Each ingredient needs name, quantity (number), and unit.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch('/user-recipes', { token, method: 'POST', body: payload });
      navigate(`/recipes/${res.id}`);
    } catch (err) {
      setError(err?.message || 'Failed to publish recipe');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#efe6da] py-8 dark:bg-neutral-950">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text dark:text-neutral-50">Add your own recipe</h2>
            <p className="mt-1 text-sm text-text/70 dark:text-neutral-300">
              Publish a recipe so it shows up in search. Photo can be added later.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/my-recipes')}>
            My recipes
          </Button>
        </div>

        <Card className="mt-6 p-5">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Title</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Masala Pasta" />
            </div>

            <div className="grid gap-2">
              <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description..."
                className={cn(
                  'min-h-24 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-muted focus:ring-2 focus:ring-accent dark:border-white/10 dark:bg-neutral-900 dark:placeholder:text-neutral-400'
                )}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="grid gap-2">
                <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Difficulty</div>
                <select
                  className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-accent dark:border-white/10 dark:bg-neutral-900"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Cook time (min)</div>
                <Input value={cookTimeMinutes} onChange={(e) => setCookTimeMinutes(e.target.value)} inputMode="numeric" placeholder="e.g. 25" />
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Prep time (min)</div>
                <Input value={prepTimeMinutes} onChange={(e) => setPrepTimeMinutes(e.target.value)} inputMode="numeric" placeholder="e.g. 10" />
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Servings</div>
                <Input value={servingsDefault} onChange={(e) => setServingsDefault(e.target.value)} inputMode="numeric" placeholder="e.g. 2" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Cuisine</div>
                <Input value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Indian" />
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Meal types (comma separated)</div>
                <Input value={mealTypes} onChange={(e) => setMealTypes(e.target.value)} placeholder="e.g. breakfast, lunch" />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Dietary tags (comma separated)</div>
                <Input value={dietaryTags} onChange={(e) => setDietaryTags(e.target.value)} placeholder="e.g. vegetarian, high-protein" />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Ingredients</div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIngredients((prev) => [...prev, { name: '', quantity: '', unit: '' }])}
                >
                  Add ingredient
                </Button>
              </div>

              <div className="grid gap-2">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-12">
                    <div className="sm:col-span-6">
                      <Input
                        value={ing.name}
                        onChange={(e) =>
                          setIngredients((prev) => prev.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)))
                        }
                        placeholder="Ingredient name"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Input
                        value={ing.quantity}
                        onChange={(e) =>
                          setIngredients((prev) => prev.map((p, i) => (i === idx ? { ...p, quantity: e.target.value } : p)))
                        }
                        inputMode="decimal"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        value={ing.unit}
                        onChange={(e) =>
                          setIngredients((prev) => prev.map((p, i) => (i === idx ? { ...p, unit: e.target.value } : p)))
                        }
                        placeholder="Unit"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-full px-0"
                        disabled={ingredients.length === 1}
                        onClick={() => setIngredients((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label="Remove ingredient"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-xs font-medium text-text/70 dark:text-neutral-300">Steps (one per line)</div>
              <textarea
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                placeholder="1. ...\n2. ..."
                className={cn(
                  'min-h-32 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-muted focus:ring-2 focus:ring-accent dark:border-white/10 dark:bg-neutral-900 dark:placeholder:text-neutral-400'
                )}
              />
            </div>

            {error ? <div className="text-sm text-red-600">{error}</div> : null}

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/my-recipes')}>
                Cancel
              </Button>
              <Button type="submit" disabled={!token || loading || !canSubmit}>
                {loading ? 'Publishing…' : 'Publish recipe'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
