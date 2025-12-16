import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { apiFetch } from '../../lib/api.js';
import { cn } from '../../lib/cn.js';

export function IngredientSearchBox({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Type ingredients (e.g., tomato, onion, egg)',
  inputClassName,
  buttonClassName,
  iconOnly = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastQueryRef = useRef('');

  useEffect(() => {
    const q = value.trim().split(',').pop().trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        lastQueryRef.current = q;
        const data = await apiFetch(`/recipes/ingredients/suggest?q=${encodeURIComponent(q)}`);
        if (lastQueryRef.current === q) {
          setSuggestions(data.items || []);
          setOpen(true);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(handle);
  }, [value]);

  function applySuggestion(s) {
    const parts = value.split(',');
    parts[parts.length - 1] = ` ${s}`;
    const next = parts
      .join(',')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .join(', ');
    onChange(next + ', ');
    setOpen(false);
  }

  function submit() {
    if (disabled) return;
    if (typeof onSubmit === 'function') onSubmit();
    setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn('pr-12', inputClassName)}
        onFocus={() => {
          if (suggestions.length) setOpen(true);
        }}
        onBlur={() => {
          // Let click handlers run
          setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
        aria-label="Ingredient search"
      />

      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <Button
          type="button"
          size="sm"
          className={cn('h-9 w-9 px-0', buttonClassName)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={submit}
          disabled={disabled}
          aria-label="Search"
        >
          <Search className="h-4 w-4 text-[#2b1f16] dark:text-white" />
          {iconOnly ? null : <span className="ml-1">Search</span>}
        </Button>
      </div>

      {open ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-black/10 bg-white shadow-soft dark:border-white/10 dark:bg-neutral-950">
          {loading ? (
            <div className="p-3 text-sm text-muted dark:text-neutral-300">Loading…</div>
          ) : suggestions.length ? (
            <ul className="max-h-52 overflow-auto">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10'
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applySuggestion(s)}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-muted dark:text-neutral-300">No suggestions</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
