import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Lock, Mail, User } from 'lucide-react';

import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';

export function RegisterPage() {
  const { setToken } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/auth/register', { method: 'POST', body: { name, email, password } });
      setToken(res.token);
      nav('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-2.25rem)] bg-[#f3e2c5] text-[#2b1f16] dark:bg-[#0b0b0b] dark:text-neutral-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,122,89,0.22),transparent_55%),radial-gradient(circle_at_85%_25%,rgba(255,210,120,0.25),transparent_50%),radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.35),transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(255,122,89,0.18),transparent_55%),radial-gradient(circle_at_85%_25%,rgba(255,210,120,0.12),transparent_50%),radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="container-page relative flex min-h-[calc(100vh-2.25rem)] items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1 font-semibold tracking-tight">
                <ChefHat className="h-[18px] w-[18px] text-[#b46b2e] dark:text-amber-200" />
                <span className="text-[15px] leading-[18px] text-[#b46b2e] dark:text-amber-200">ChefMate</span>
              </div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Register</h2>
              <p className="mt-1 text-sm text-[#2b1f16]/70 dark:text-neutral-300">Create an account to save favorites.</p>
            </div>

            <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45 dark:text-white/40" />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="pl-9 bg-white/70 dark:bg-neutral-900/60" />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45 dark:text-white/40" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="pl-9 bg-white/70 dark:bg-neutral-900/60"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45 dark:text-white/40" />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  type="password"
                  className="pl-9 bg-white/70 dark:bg-neutral-900/60"
                />
              </div>

              {error ? <div className="text-sm text-red-600">{error}</div> : null}

              <Button disabled={loading} type="submit" className="mt-1 rounded-full">
                {loading ? 'Creating…' : 'Create account'}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-black/60 dark:text-neutral-300">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-accent">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
