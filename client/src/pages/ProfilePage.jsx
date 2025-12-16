import { useEffect, useState } from 'react';

import { Card } from '../components/ui/Card.jsx';
import { apiFetch } from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';

export function ProfilePage() {
  const { token } = useAuth();
  const [me, setMe] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const res = await apiFetch('/users/me', { token });
      if (!ignore) setMe(res);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <div className="container-page py-8">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <p className="mt-2 text-sm text-muted dark:text-neutral-300">Account details</p>

      <Card className="mt-6 max-w-xl p-6">
        {me ? (
          <div className="grid gap-2 text-sm">
            <div>
              <div className="text-muted dark:text-neutral-300">Name</div>
              <div className="font-medium">{me.name}</div>
            </div>
            <div>
              <div className="text-muted dark:text-neutral-300">Email</div>
              <div className="font-medium">{me.email}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted dark:text-neutral-300">Loading…</div>
        )}
      </Card>
    </div>
  );
}
