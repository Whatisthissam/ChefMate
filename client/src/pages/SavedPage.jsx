import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiFetch } from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';
import { RecipeCard } from '../components/recipes/RecipeCard.jsx';

export function SavedPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const res = await apiFetch('/users/me/saved', { token });
      if (!ignore) {
        setItems((res.items || []).map((r) => ({ ...r, id: String(r.id || r._id) })));
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [token]);

  async function toggleSave(recipeId) {
    const rid = String(recipeId);
    await apiFetch(`/users/me/saved/${rid}`, { token, method: 'DELETE' });
    setItems((prev) => prev.filter((r) => r.id !== rid));
  }

  function openRecipe(id) {
    navigate(`/recipes/${id}`);
  }

  return (
    <div className="container-page py-8">
      <h2 className="text-2xl font-semibold">Saved recipes</h2>
      <p className="mt-2 text-sm text-muted dark:text-neutral-300">Your bookmarked picks, ready anytime.</p>

      {items.length ? (
        <div className="mx-auto max-w-7xl px-8 sm:px-12 lg:px-16">
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={{
                  ...r,
                  matchCount: 0,
                  missingCount: 0,
                  score: r.popularity || 0,
                }}
                saved
                onToggleSave={toggleSave}
                onOpen={openRecipe}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-black/5 bg-white p-6 text-sm text-muted dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-300">
          No saved recipes yet.
        </div>
      )}
    </div>
  );
}
