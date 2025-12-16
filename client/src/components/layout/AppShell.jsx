import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChefHat, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../ui/Button.jsx';
import { cn } from '../../lib/cn.js';
import { useAuth } from '../../state/AuthContext.jsx';
import { useTheme } from '../../state/ThemeContext.jsx';

export function AppShell({ children }) {
  const { token, user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const hideFooter = isLanding || isAuthPage || location.pathname === '/saved' || location.pathname === '/my-recipes';

  const profileRef = useRef(null);

  const userInitial = useMemo(() => {
    const name = (user?.name || '').trim();
    if (name) return name[0].toUpperCase();
    const email = (user?.email || '').trim();
    if (email) return email[0].toUpperCase();
    return 'U';
  }, [user?.name, user?.email]);

  useEffect(() => {
    if (!profileOpen) return;

    function onDocPointerDown(e) {
      const el = profileRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setProfileOpen(false);
    }

    document.addEventListener('pointerdown', onDocPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown);
    };
  }, [profileOpen]);

  const navItemClass = ({ isActive }) =>
    cn(
      'rounded-md px-1.5 py-0.5 text-xs font-bold transition hover:bg-black/5 dark:hover:bg-white/10',
      isActive ? 'bg-black/10 dark:bg-white/10' : ''
    );

  return (
    <div className="min-h-screen">
      <header className="z-30 bg-[#d6be95] text-[#2b1f16] dark:bg-neutral-950 dark:text-neutral-50">
        <div className="container-page flex h-9 items-center justify-between">
          <Link to="/" className="flex items-center gap-1 font-semibold tracking-tight">
            <ChefHat className="h-[18px] w-[18px] text-[#b46b2e] dark:text-amber-200" />
            <span className="text-[15px] leading-[18px] text-[#b46b2e] dark:text-amber-200">ChefMate</span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            <NavLink to="/" className={navItemClass}>
              Home
            </NavLink>
            <NavLink to="/trending" className={navItemClass}>
              Trending
            </NavLink>
            {token ? (
              <>
                <NavLink to="/saved" className={navItemClass}>
                  Saved
                </NavLink>
                <NavLink to="/my-recipes" className={navItemClass}>
                  My Recipes
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navItemClass}>
                  Login
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" className="h-6 w-6 px-0 border-0" onClick={toggle} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {token ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full bg-[#d6be95] text-[10px] font-extrabold uppercase text-black shadow-sm ring-1 ring-black transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    'dark:bg-amber-200 dark:text-black dark:ring-black'
                  )}
                  aria-label="Open profile menu"
                >
                  {userInitial}
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 top-9 z-50 w-56 overflow-hidden rounded-xl border border-black/10 bg-white/90 p-1 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur dark:border-white/10 dark:bg-neutral-950/90 dark:shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                    <div className="px-3 py-2">
                      <div className="text-xs font-semibold text-[#2b1f16] dark:text-neutral-50">
                        {user?.name || 'Account'}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-black/55 dark:text-white/45">{user?.email || ''}</div>
                    </div>

                    <div className="h-px bg-black/10 dark:bg-white/10" />

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-[#2b1f16] hover:bg-black/5 dark:text-neutral-50 dark:hover:bg-white/10"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#2b1f16] hover:bg-black/5 dark:text-neutral-50 dark:hover:bg-white/10"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Button
              variant="secondary"
              className="md:hidden h-7 w-7 px-0"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {open ? (
          <div className="container-page pb-2 md:hidden">
            <div className="grid gap-1">
              <NavLink to="/" className={navItemClass} onClick={() => setOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/trending" className={navItemClass} onClick={() => setOpen(false)}>
                Trending
              </NavLink>
              {token ? (
                <>
                  <NavLink to="/saved" className={navItemClass} onClick={() => setOpen(false)}>
                    Saved
                  </NavLink>
                  <NavLink to="/my-recipes" className={navItemClass} onClick={() => setOpen(false)}>
                    My Recipes
                  </NavLink>
                  <NavLink to="/profile" className={navItemClass} onClick={() => setOpen(false)}>
                    Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className={navItemClass({ isActive: false })}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navItemClass} onClick={() => setOpen(false)}>
                    Login
                  </NavLink>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      {hideFooter ? null : (
        <footer className="border-t border-black/5 py-3 text-xs text-center text-muted dark:border-white/10">
          <div className="container-page">ChefMate — Real-time recipe recommendations</div>
        </footer>
      )}
    </div>
  );
}
