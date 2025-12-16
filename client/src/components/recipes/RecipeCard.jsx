import { Clock, Flame, Star } from 'lucide-react';

import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { ImageWithFallback } from '../ui/ImageWithFallback.jsx';
import { cn } from '../../lib/cn.js';

export function RecipeCard({ recipe, saved, onToggleSave, onOpen, onDelete }) {
  const showMatch = (recipe.matchCount || 0) + (recipe.missingCount || 0) > 0;

  return (
    <Card className="group overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        className="flex w-full cursor-pointer text-left outline-none"
        onClick={() => onOpen(recipe.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpen(recipe.id);
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col p-2">
          <div className="min-w-0">
            <h3 className="truncate text-xs font-semibold leading-tight">{recipe.title}</h3>
            {recipe.publisherName ? (
              <div className="mt-0.5 text-[10px] text-muted dark:text-neutral-300">Published by {recipe.publisherName}</div>
            ) : null}
            <p className="mt-0.5 line-clamp-2 text-[10px] text-muted dark:text-neutral-300">{recipe.description}</p>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {showMatch ? (
              <>
                <Badge className="text-[10px] px-1.5 py-0.5">
                  Matched: {recipe.matchCount}/{Math.max(1, (recipe.matchCount || 0) + (recipe.missingCount || 0))}
                </Badge>
                <Badge className="bg-black/5 text-text dark:bg-white/10 dark:text-neutral-100 text-[10px] px-1.5 py-0.5">
                  Score: {Math.round(recipe.score || 0)}
                </Badge>
              </>
            ) : (
              <Badge className="bg-black/5 text-text dark:bg-white/10 dark:text-neutral-100 text-[10px] px-1.5 py-0.5">
                Popularity: {Math.round(recipe.popularity || 0)}
              </Badge>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="text-[10px] text-muted dark:text-neutral-300">Servings: {recipe.servingsDefault || 1}</div>
            <div className="flex items-center gap-2">
              {typeof onDelete === 'function' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(recipe);
                  }}
                  aria-label="Delete recipe"
                >
                  Delete
                </Button>
              ) : null}

              <Button
                variant="ghost"
                className={cn('h-6 w-6 px-0', saved ? 'text-accent' : 'text-muted')}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSave(recipe.id);
                }}
                aria-label={saved ? 'Unsave recipe' : 'Save recipe'}
              >
                <Star className={cn('h-4 w-4', saved ? 'fill-current' : '')} />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative w-32 shrink-0 overflow-hidden border-l border-black/5 dark:border-white/10">
          <ImageWithFallback
            src={recipe.thumbnailUrl}
            alt={recipe.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute left-2 top-2 flex gap-1">
            <Badge className="bg-white/85 backdrop-blur dark:bg-black/40 dark:text-neutral-50 text-[10px] px-1.5 py-0.5">
              <Clock className="mr-0.5 h-3 w-3" />
              {recipe.cookTimeMinutes || 0}m
            </Badge>
            <Badge className="bg-white/85 backdrop-blur dark:bg-black/40 dark:text-neutral-50 text-[10px] px-1.5 py-0.5">
              <Flame className="mr-0.5 h-3 w-3" />
              {recipe.difficulty}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
