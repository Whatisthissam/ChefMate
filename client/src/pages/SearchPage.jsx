import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { IngredientSearchBox } from '../components/search/IngredientSearchBox.jsx';
import { FiltersBar } from '../components/search/FiltersBar.jsx';
import { RecipeCard } from '../components/recipes/RecipeCard.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';

function readFilters(params) {
  return {
    difficulty: params.get('difficulty') || '',
    cuisine: params.get('cuisine') || '',
    dietary: params.get('dietary') || '',
    sort: params.get('sort') || 'best',
  };
}

export function SearchPage() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const committedIngredients = (params.get('ingredients') || '').trim();
  const committedFilters = useMemo(() => readFilters(params), [params]);

  const [queryDraft, setQueryDraft] = useState(committedIngredients);
  const [filtersDraft, setFiltersDraft] = useState(committedFilters);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [savedIds, setSavedIds] = useState(() => new Set());

  const canSearch = useMemo(() => {
    return queryDraft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean).length;
  }, [queryDraft]);

  useEffect(() => {
    setQueryDraft(committedIngredients);
    setFiltersDraft(committedFilters);
  }, [committedIngredients, committedFilters]);

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

  function runSearch() {
    if (!canSearch) return;
    const next = new URLSearchParams();
    next.set('ingredients', queryDraft.replace(/\s+/g, ' ').trim().replace(/,\s*/g, ','));
    if (filtersDraft.difficulty) next.set('difficulty', filtersDraft.difficulty);
    if (filtersDraft.cuisine) next.set('cuisine', filtersDraft.cuisine);
    if (filtersDraft.dietary) next.set('dietary', filtersDraft.dietary);
    if (filtersDraft.sort) next.set('sort', filtersDraft.sort);
    navigate(`/search?${next.toString()}`);
  }

  useEffect(() => {
    let ignore = false;

    const cleaned = committedIngredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!cleaned.length) {
      setItems([]);
      return;
    }

    const p = new URLSearchParams();
    p.set('ingredients', committedIngredients.replace(/\s+/g, ' ').trim().replace(/,\s*/g, ','));
    if (committedFilters.difficulty) p.set('difficulty', committedFilters.difficulty);
    if (committedFilters.cuisine) p.set('cuisine', committedFilters.cuisine);
    if (committedFilters.dietary) p.set('dietary', committedFilters.dietary);
    if (committedFilters.sort) p.set('sort', committedFilters.sort);

    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/recipes/search?${p.toString()}`);
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
  }, [committedIngredients, committedFilters]);

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
        <div className="mx-auto max-w-3xl">
          <h2 className="text-lg font-semibold text-text dark:text-neutral-50">Search Recipes</h2>
          <p className="mt-1 text-sm text-text/70 dark:text-neutral-300">
            Enter ingredients, adjust filters, then press Search.
          </p>

          <div className="mt-4 grid gap-3">
            <IngredientSearchBox
              value={queryDraft}
              onChange={setQueryDraft}
              onSubmit={runSearch}
              disabled={loading || !canSearch}
              placeholder="What ingredients do you have?"
              iconOnly
              inputClassName="h-10 rounded-md border-black/20 bg-white/70 placeholder:text-text/50 focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-neutral-900"
              buttonClassName="rounded-md border border-black/20 bg-white/70 hover:bg-white dark:border-white/10 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            />
            <FiltersBar filters={filtersDraft} setFilters={setFiltersDraft} />
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
                      recipe={r}
                      saved={savedIds.has(String(r.id))}
                      onToggleSave={toggleSave}
                      onOpen={openRecipe}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-black/5 bg-white/70 p-6 text-sm text-text/70 dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-300">
                No results yet. Search using ingredients.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
