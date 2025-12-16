import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('chefmaten_token') || '');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadMe() {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const me = await apiFetch('/users/me', { token });
        if (!ignore) setUser(me);
      } catch {
        if (!ignore) {
          setUser(null);
          localStorage.removeItem('chefmaten_token');
          setToken('');
        }
      }
    }

    loadMe();
    return () => {
      ignore = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      setToken: (t) => {
        setToken(t);
        if (t) localStorage.setItem('chefmaten_token', t);
        else localStorage.removeItem('chefmaten_token');
      },
      logout: () => {
        setToken('');
        setUser(null);
        localStorage.removeItem('chefmaten_token');
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
