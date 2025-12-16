import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee,
  Cookie,
  CupSoda,
  Salad,
  Sandwich,
  UtensilsCrossed,
} from 'lucide-react';

import { IngredientSearchBox } from '../components/search/IngredientSearchBox.jsx';
import { FiltersBar } from '../components/search/FiltersBar.jsx';
import { FloatingFoodBackground } from '../components/decor/FloatingFoodBackground.jsx';

export function HomePage() {
  const navigate = useNavigate();

  const [queryDraft, setQueryDraft] = useState('');
  const [filtersDraft, setFiltersDraft] = useState({ difficulty: '', cuisine: '', dietary: '', sort: 'best' });

  const canSearch = useMemo(() => {
    return queryDraft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean).length;
  }, [queryDraft]);

  function runSearch() {
    if (!canSearch) return;
    const p = new URLSearchParams();
    p.set('ingredients', queryDraft.replace(/\s+/g, ' ').trim().replace(/,\s*/g, ','));
    if (filtersDraft.difficulty) p.set('difficulty', filtersDraft.difficulty);
    if (filtersDraft.cuisine) p.set('cuisine', filtersDraft.cuisine);
    if (filtersDraft.dietary) p.set('dietary', filtersDraft.dietary);
    if (filtersDraft.sort) p.set('sort', filtersDraft.sort);
    navigate(`/search?${p.toString()}`);
  }

  const categories = useMemo(
    () => [
      { key: 'breakfast', label: 'Breakfast', Icon: Coffee },
      { key: 'lunch', label: 'Lunch', Icon: Salad },
      { key: 'dinner', label: 'Dinner', Icon: UtensilsCrossed },
      { key: 'dessert', label: 'Dessert', Icon: Cookie },
      { key: 'snacks', label: 'Snacks', Icon: Sandwich },
      { key: 'drinks', label: 'Drinks', Icon: CupSoda },
    ],
    []
  );

  return (
    <div className="h-[calc(100vh-2.25rem)] overflow-hidden">
      <section className="relative overflow-hidden bg-[#d6be95] pt-12 pb-10 text-[#2b1f16] dark:bg-neutral-950 dark:text-neutral-50">
        <FloatingFoodBackground />
        <div className="container-page">
          <div className="relative z-10 mx-auto grid max-w-3xl gap-6 text-center">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl md:leading-tight">
                Find the perfect recipe for your next meal
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm text-[#2b1f16]/70 dark:text-neutral-300 md:text-base">
                Search for recipes based on your preferences and dietary needs.
              </p>
            </div>

            <div className="mx-auto w-full max-w-md">
              <IngredientSearchBox
                value={queryDraft}
                onChange={setQueryDraft}
                onSubmit={runSearch}
                disabled={!canSearch}
                placeholder="What ingredients do you have?"
                iconOnly
                inputClassName="h-9 border-black/10 bg-[#f7f1e8] pr-12 text-[13px] placeholder:text-text/55 shadow-sm focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-neutral-900"
                buttonClassName="h-8 w-8 border border-black/0 bg-[#f7f1e8] hover:bg-[#efe6da] dark:border-white/0 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              />
            </div>

            <div className="mx-auto w-full max-w-1xl opacity-60">
              <FiltersBar filters={filtersDraft} setFilters={setFiltersDraft} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#efe6da] py-6 dark:bg-neutral-950">
        <div className="container-page">
          <div className="grid gap-8">
            <div>
              <h2 className="text-base font-semibold text-text dark:text-neutral-50">Popular Categories</h2>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {categories.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => navigate(`/categories/${key}`)}
                    className="rounded-xl border border-black/10 bg-white/40 px-3 py-2.5 text-center text-[11px] text-text backdrop-blur-sm transition hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10"
                    aria-label={label}
                  >
                    <Icon className="mx-auto h-5 w-5 opacity-80" />
                    <div className="mt-2 font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
