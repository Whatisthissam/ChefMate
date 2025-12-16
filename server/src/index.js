import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { Recipe } from './models/Recipe.js';
import { normalizeIngredientList, scoreRecipe } from './utils/searchRank.js';
import { computeNutritionTotals } from './utils/nutrition.js';

const START_PORT = Number(process.env.PORT || 5001);
const PORT_TRIES = Number(process.env.PORT_TRIES || 20);

function listenOnce(server, port) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      server.off('error', onError);
      server.off('listening', onListening);
    };

    const onError = (err) => {
      cleanup();
      reject(err);
    };

    const onListening = () => {
      cleanup();
      resolve(port);
    };

    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port);
  });
}

async function listenWithFallback(server, startPort, tries) {
  for (let i = 0; i < tries; i += 1) {
    const port = startPort + i;
    try {
      return await listenOnce(server, port);
    } catch (err) {
      if (err && err.code === 'EADDRINUSE') continue;
      throw err;
    }
  }

  throw new Error(`No available port found starting at ${startPort}`);
}

async function main() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  // WebSocket integration point (optional trending ticker)
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.emit('trending:connected', { ok: true });

    // Live search: client emits query as user types, server responds with ranked items.
    socket.on('search:query', async (payload = {}) => {
      try {
        const ingredients = normalizeIngredientList(payload.ingredients);
        const servings = Number(payload.servings) || 1;
        const difficulty = String(payload.difficulty || '').trim();
        const cuisine = String(payload.cuisine || '').trim();
        const dietary = String(payload.dietary || '').trim();
        const sort = String(payload.sort || 'best').trim();

        if (!ingredients.length) {
          socket.emit('search:results', { items: [] });
          return;
        }

        const mongoQuery = {
          ingredientNames: { $in: ingredients },
          ...(difficulty ? { difficulty } : {}),
          ...(cuisine ? { cuisine } : {}),
          ...(dietary ? { dietaryTags: dietary } : {}),
        };

        const candidates = await Recipe.find(mongoQuery)
          .select(
            'title description thumbnailUrl cookTimeMinutes servingsDefault difficulty popularity ingredientNames ingredients.quantity ingredients.nutritionPerUnit'
          )
          .limit(60)
          .lean();

        const items = candidates
          .map((r) => {
            const { matchCount, missingCount, score } = scoreRecipe({
              recipeIngredientNames: r.ingredientNames || [],
              queryIngredients: ingredients,
              popularity: r.popularity,
            });

            return {
              id: r._id,
              title: r.title,
              description: r.description,
              thumbnailUrl: r.thumbnailUrl,
              cookTimeMinutes: r.cookTimeMinutes,
              difficulty: r.difficulty,
              servingsDefault: r.servingsDefault,
              popularity: r.popularity,
              matchCount,
              missingCount,
              score,
              nutrition: computeNutritionTotals(r, servings),
            };
          })
          .sort((a, b) => {
            if (sort === 'popular') {
              if ((b.popularity || 0) !== (a.popularity || 0)) return (b.popularity || 0) - (a.popularity || 0);
              return b.score - a.score;
            }
            if (sort === 'time') {
              if ((a.cookTimeMinutes || 0) !== (b.cookTimeMinutes || 0)) return (a.cookTimeMinutes || 0) - (b.cookTimeMinutes || 0);
              return b.score - a.score;
            }
            return b.score - a.score;
          })
          .slice(0, 20);

        socket.emit('search:results', { items });
      } catch (e) {
        socket.emit('search:results', { items: [] });
      }
    });
  });

  // Emit trending recipes every 10s (simple demo)
  setInterval(async () => {
    try {
      const items = await Recipe.find({})
        .sort({ popularity: -1 })
        .limit(5)
        .select('title popularity thumbnailUrl')
        .lean();
      io.emit(
        'trending:update',
        items.map((r) => ({ id: r._id, title: r.title, popularity: r.popularity, thumbnailUrl: r.thumbnailUrl }))
      );
    } catch (e) {
      // swallow errors to avoid crashing interval
    }
  }, 10000);

  const port = await listenWithFallback(server, START_PORT, PORT_TRIES);
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
