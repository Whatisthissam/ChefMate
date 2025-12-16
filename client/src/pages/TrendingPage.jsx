import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RecipeCard } from '../components/recipes/RecipeCard.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';

export function TrendingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [cuisine, setCuisine] = useState('Indian');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [savedIds, setSavedIds] = useState(() => new Set());

  const cuisineOptions = useMemo(
    () => ['Indian', 'International', 'Italian', 'Asian', 'Mexican'],
    []
  );

  useEffect(() => {
    let ignore = false;

    async function loadSaved() {
      if (!token) {
        setSavedIds(new Set());
        return;
      }
      try {
        const res = await apiFetch('/users/me/saved', { token });
        if (!ignore) setSavedIds(new Set((res.items || []).map((r) => String(r.id || r._id))));
      } catch (err) {
        if (!ignore && err?.status === 401) setSavedIds(new Set());
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }

    loadSaved();
    return () => {
      ignore = true;
    };
  }, [token]);

  useEffect(() => {
    let ignore = false;

    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set('limit', '12');
        if (cuisine) qs.set('cuisine', cuisine);
        const data = await apiFetch(`/recipes/trending?${qs.toString()}`);
        if (!ignore) setItems(data.items || []);
      } catch {
        if (!ignore) setItems([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 150);

    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [cuisine]);

  async function toggleSave(recipeId) {
    if (!token) {
      navigate('/login');
      return;
    }

    const rid = String(recipeId);

    const isSaved = savedIds.has(rid);
    const next = new Set(savedIds);

    try {
      if (isSaved) {
        await apiFetch(`/users/me/saved/${rid}`, { token, method: 'DELETE' });
        next.delete(rid);
      } else {
        await apiFetch('/users/me/saved', { token, method: 'POST', body: { recipeId: rid } });
        next.add(rid);
      }
      setSavedIds(next);
    } catch (err) {
      if (err?.status === 401) navigate('/login');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  function openRecipe(id) {
    navigate(`/recipes/${id}`);
  }

  return (
    <div className="bg-[#efe6da] py-8 dark:bg-neutral-950">
      <div className="container-page">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text dark:text-neutral-50">Trending Recipes</h2>
            <p className="mt-1 text-sm text-text/70 dark:text-neutral-300">
              Popular right now (defaults to Indian).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-text/70 dark:text-neutral-300">Cuisine</label>
            <select
              className="h-9 rounded border border-black/10 bg-white/70 pl-4 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-neutral-900"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            >
              {cuisineOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-neutral-950">
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="mt-4 h-5 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length ? (
            <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={{
                      ...r,
                      matchCount: 0,
                      missingCount: 0,
                      score: r.popularity || 0,
                    }}
                    saved={savedIds.has(String(r.id))}
                    onToggleSave={toggleSave}
                    onOpen={openRecipe}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-black/5 bg-white/70 p-6 text-sm text-text/70 dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-300">
              No trending recipes found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
