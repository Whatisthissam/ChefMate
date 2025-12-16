// Recipe-specific image mappings for better fallback images
export const recipeImageMap = {
  // Indian Recipes
  "Butter Chicken": "https://images.unsplash.com/photo-1603894589969-795f2d429ae0?auto=format&fit=crop&w=1200&q=60",
  "Chicken Biryani": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=60",
  "Masala Dosa": "https://images.unsplash.com/photo-1586202905707-cc2263d0404d?auto=format&fit=crop&w=1200&q=60",
  "Chole Masala": "https://images.unsplash.com/photo-1587703764645-efdb22b1d8dc?auto=format&fit=crop&w=1200&q=60",
  "Paneer Tikka": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=60",
  "Dal Makhani": "https://images.unsplash.com/photo-1585936427833-661a38f0d8d4?auto=format&fit=crop&w=1200&q=60",
  "Palak Paneer": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=60",
  "Samosa": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=60",
  "Rajma": "https://images.unsplash.com/photo-1587703764645-efdb22b1d8dc?auto=format&fit=crop&w=1200&q=60",
  "Aloo Gobi": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=60",
  
  // Breakfast Items
  "Tomato Onion Omelette": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=60",
  "Avocado Toast": "https://images.unsplash.com/photo-1588137378633-dea1336ce24e?auto=format&fit=crop&w=1200&q=60",
  "Pancakes": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=60",
  "French Toast": "https://images.unsplash.com/photo-1608198093002-ad4e00e9b5f6?auto=format&fit=crop&w=1200&q=60",
  "Eggs Benedict": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=60",
  
  // International Cuisines
  "Pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=60",
  "Pasta": "https://images.unsplash.com/photo-1555949564-2a7c0a065a51?auto=format&fit=crop&w=1200&q=60",
  "Burger": "https://images.unsplash.com/photo-1568901346405-9917c8b8d1e4?auto=format&fit=crop&w=1200&q=60",
  "Sushi": "https://images.unsplash.com/photo-1579584446583-76e46fc1d60f?auto=format&fit=crop&w=1200&q=60",
  "Tacos": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=60",
  
  // Desserts
  "Chocolate Cake": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=60",
  "Ice Cream": "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=1200&q=60",
  "Cookies": "https://images.unsplash.com/photo-1499636137212-708f84625db4?auto=format&fit=crop&w=1200&q=60",
  "Brownies": "https://images.unsplash.com/photo-1606313564200-e75d5e27a99d?auto=format&fit=crop&w=1200&q=60",
  "Cheesecake": "https://images.unsplash.com/photo-1565958011703-44f9829ba569?auto=format&fit=crop&w=1200&q=60",
  
  // Drinks
  "Coffee": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=60",
  "Smoothie": "https://images.unsplash.com/photo-1502741126161-b048600273da?auto=format&fit=crop&w=1200&q=60",
  "Juice": "https://images.unsplash.com/photo-1622597467836-f3c8b2d1a6c4?auto=format&fit=crop&w=1200&q=60",
  "Tea": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cda9?auto=format&fit=crop&w=1200&q=60",
  "Lassi": "https://images.unsplash.com/photo-1502741126161-b048600273da?auto=format&fit=crop&w=1200&q=60",
  
  // Salads and Light Meals
  "Caesar Salad": "https://images.unsplash.com/photo-1550308985-628f5a57b1f7?auto=format&fit=crop&w=1200&q=60",
  "Greek Salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=60",
  "Sandwich": "https://images.unsplash.com/photo-1528735602687-affcd32a6dc2?auto=format&fit=crop&w=1200&q=60",
  "Soup": "https://images.unsplash.com/photo-1547592166-3ac247737a73?auto=format&fit=crop&w=1200&q=60",
  
  // Snacks
  "French Fries": "https://images.unsplash.com/photo-1630384065251-f96b4c85cf6a?auto=format&fit=crop&w=1200&q=60",
  "Nachos": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=60",
  "Spring Rolls": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=60",
};

// Function to get recipe-specific image URL
export function getRecipeImage(recipeName) {
  if (!recipeName) return null;
  
  // Try exact match first
  if (recipeImageMap[recipeName]) {
    return recipeImageMap[recipeName];
  }
  
  // Try partial match (case insensitive)
  const recipeLower = recipeName.toLowerCase();
  for (const [key, url] of Object.entries(recipeImageMap)) {
    if (key.toLowerCase().includes(recipeLower) || recipeLower.includes(key.toLowerCase())) {
      return url;
    }
  }
  
  // Generate dynamic Unsplash URL based on recipe name
  const searchTerms = recipeName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(',');
  
  return `https://source.unsplash.com/1200x800/?${searchTerms},food,recipe,cooking`;
}
