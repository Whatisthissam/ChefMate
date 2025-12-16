import { Routes, Route, Navigate } from 'react-router-dom';

import { AppShell } from './components/layout/AppShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { SearchPage } from './pages/SearchPage.jsx';
import { TrendingPage } from './pages/TrendingPage.jsx';
import { RecipeDetailsPage } from './pages/RecipeDetailsPage.jsx';
import { CategoryPage } from './pages/CategoryPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { SavedPage } from './pages/SavedPage.jsx';
import { AddRecipePage } from './pages/AddRecipePage.jsx';
import { MyRecipesPage } from './pages/MyRecipesPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { useAuth } from './state/AuthContext.jsx';

export function App() {
  const { token } = useAuth();

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/categories/:meal" element={<CategoryPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
        <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/saved" element={token ? <SavedPage /> : <Navigate to="/login" />} />
        <Route path="/add-recipe" element={token ? <AddRecipePage /> : <Navigate to="/login" />} />
        <Route path="/my-recipes" element={token ? <MyRecipesPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  );
}
