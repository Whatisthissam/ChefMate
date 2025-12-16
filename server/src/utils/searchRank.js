export function normalizeIngredientList(input) {
  if (!input) return [];
  return String(input)
    .split(',')
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean)
    .filter((v, idx, arr) => arr.indexOf(v) === idx);
}

export function scoreRecipe({ recipeIngredientNames, queryIngredients, popularity }) {
  const q = queryIngredients;
  const set = new Set(recipeIngredientNames);

  const matchCount = q.reduce((acc, ing) => (set.has(ing) ? acc + 1 : acc), 0);
  const missingCount = Math.max(0, q.length - matchCount);

  // Ranking:
  // - More matches -> higher
  // - Fewer missing -> higher
  // - popularity provides a small boost
  const score = matchCount * 10 - missingCount * 3 + (Number(popularity) || 0) * 0.1;

  return { matchCount, missingCount, score };
}
