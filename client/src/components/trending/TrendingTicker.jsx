import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { Badge } from '../ui/Badge.jsx';

export function TrendingTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    const socket = io(url, { transports: ['websocket'] });

    socket.on('trending:update', (payload) => {
      setItems(Array.isArray(payload) ? payload : []);
    });

    return () => socket.disconnect();
  }, []);

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-text/70 dark:text-neutral-300">Trending Recipes</span>
      {items.map((it) => (
        <Badge key={it.id} className="bg-black/5 text-text backdrop-blur dark:bg-white/10 dark:text-neutral-100">
          {it.title}
        </Badge>
      ))}
    </div>
  );
}
