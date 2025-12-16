import { cn } from '../../lib/cn.js';

export function FiltersBar({ filters, setFilters }) {
  return (
    <div className="grid gap-4 md:grid-cols-4 md:gap-6">
      <select
        className={cn(
          'h-9 w-full rounded border border-black/10 bg-[#f7f1e8] pl-4 pr-8 text-[11px] text-text shadow-sm outline-none transition focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:ring-white/20'
        )}
        value={filters.difficulty}
        onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}
      >
        <option value="">Difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <select
        className={cn(
          'h-9 w-full rounded border border-black/10 bg-[#f7f1e8] pl-4 pr-8 text-[11px] text-text shadow-sm outline-none transition focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:ring-white/20'
        )}
        value={filters.cuisine}
        onChange={(e) => setFilters((f) => ({ ...f, cuisine: e.target.value }))}
      >
        <option value="">Cuisine</option>
        <option value="International">International</option>
        <option value="Indian">Indian</option>
        <option value="Italian">Italian</option>
        <option value="Mexican">Mexican</option>
        <option value="Asian">Asian</option>
      </select>

      <select
        className={cn(
          'h-9 w-full rounded border border-black/10 bg-[#f7f1e8] pl-4 pr-8 text-[11px] text-text shadow-sm outline-none transition focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:ring-white/20'
        )}
        value={filters.dietary}
        onChange={(e) => setFilters((f) => ({ ...f, dietary: e.target.value }))}
      >
        <option value="">Dietary</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="vegan">Vegan</option>
        <option value="gluten-free">Gluten-free</option>
        <option value="high-protein">High-protein</option>
      </select>

      <select
        className={cn(
          'h-9 w-full rounded border border-black/10 bg-[#f7f1e8] pl-4 pr-8 text-[11px] text-text shadow-sm outline-none transition focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:ring-white/20'
        )}
        value={filters.sort}
        onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
      >
        <option value="best">Sort: Best match</option>
        <option value="popular">Sort: Popular</option>
        <option value="time">Sort: Fast</option>
      </select>
    </div>
  );
}
