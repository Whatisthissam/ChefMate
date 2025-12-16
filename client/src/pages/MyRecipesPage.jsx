import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RecipeCard } from '../components/recipes/RecipeCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';

export function MyRecipesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [savedIds, setSavedIds] = useState(() => new Set());

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

    async function load() {
      try {
        setLoading(true);
        const res = await apiFetch('/user-recipes/me', { token });
        if (!ignore) setItems(res.items || []);
      } catch (err) {
        if (!ignore && err?.status === 401) navigate('/login');
        if (!ignore) setItems([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [token, navigate]);

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

  async function deletePublished(userRecipeId, recipeId) {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!userRecipeId) {
      window.alert('Unable to delete: missing recipe id. Please refresh the page and try again.');
      return;
    }

    const ok = window.confirm('Delete this published recipe?');
    if (!ok) return;

    try {
      await apiFetch(`/user-recipes/${String(userRecipeId)}`, { token, method: 'DELETE' });
      setItems((prev) => prev.filter((x) => String(x.userRecipeId) !== String(userRecipeId)));
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(String(recipeId));
        return next;
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const details = err?.data ? `\n\nDetails: ${JSON.stringify(err.data)}` : '';
      window.alert(`Delete failed (${err?.status || 'unknown'}): ${err?.message || 'Request failed'}${details}`);
      if (err?.status === 401) navigate('/login');
    }
  }

  return (
    <div className="bg-[#efe6da] py-8 dark:bg-neutral-950">
      <div className="container-page">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text dark:text-neutral-50">My recipes</h2>
            <p className="mt-1 text-sm text-text/70 dark:text-neutral-300">Recipes you published.</p>
          </div>

          <Button onClick={() => navigate('/add-recipe')}>Add recipe</Button>
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
                  <div key={r.userRecipeId || r.id}>
                    <RecipeCard
                      recipe={{
                        ...r,
                        matchCount: 0,
                        missingCount: 0,
                        score: r.popularity || 0,
                      }}
                      saved={savedIds.has(String(r.id))}
                      onToggleSave={toggleSave}
                      onOpen={openRecipe}
                      onDelete={() => deletePublished(r.userRecipeId, r.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-black/5 bg-white/70 p-6 text-sm text-text/70 dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-300">
              You haven&apos;t published any recipes yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
