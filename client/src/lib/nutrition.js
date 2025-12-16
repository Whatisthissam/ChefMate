export function computeNutritionTotals(recipe, servings = 1) {
  const requestedServings = Number(servings) || 1;
  const baseServings = Number(recipe?.servingsDefault) || 1;

  const totals = (recipe?.ingredients || []).reduce(
    (acc, ing) => {
      const q = Number(ing.quantity) || 0;
      const n = ing.nutritionPerUnit || {};
      acc.calories += q * (Number(n.calories) || 0);
      acc.carbs += q * (Number(n.carbs) || 0);
      acc.fat += q * (Number(n.fat) || 0);
      acc.protein += q * (Number(n.protein) || 0);
      return acc;
    },
    { calories: 0, carbs: 0, fat: 0, protein: 0 }
  );

  const perServing = {
    calories: totals.calories / baseServings,
    carbs: totals.carbs / baseServings,
    fat: totals.fat / baseServings,
    protein: totals.protein / baseServings,
  };

  return {
    servings: requestedServings,
    perServing,
    total: {
      calories: perServing.calories * requestedServings,
      carbs: perServing.carbs * requestedServings,
      fat: perServing.fat * requestedServings,
      protein: perServing.protein * requestedServings,
    },
  };
}
