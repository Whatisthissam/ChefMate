import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { authRouter } from './routes/auth.js';
import { recipesRouter } from './routes/recipes.js';
import { userRecipesRouter } from './routes/userRecipes.js';
import { usersRouter } from './routes/users.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
        if (allowedOrigins.length) return cb(null, allowedOrigins.includes(origin) || isLocalhost);
        if (isLocalhost) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/recipes', recipesRouter);
  app.use('/api/user-recipes', userRecipesRouter);
  app.use('/api/users', usersRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
