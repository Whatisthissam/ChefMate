import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { connectDB } from '../src/config/db.js';
import { createApp } from '../src/app.js';
import { Recipe } from '../src/models/Recipe.js';

let mongo;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.CLIENT_ORIGIN = 'http://localhost:5173';

  mongo = await MongoMemoryServer.create();
  await connectDB(mongo.getUri());

  await Recipe.create({
    title: 'Test Tomato Pasta',
    description: 'Simple pasta.',
    popularity: 10,
    servingsDefault: 1,
    ingredients: [
      {
        name: 'tomato',
        quantity: 2,
        unit: 'piece',
        nutritionPerUnit: { calories: 22, carbs: 4.8, fat: 0.2, protein: 1.1 },
      },
      {
        name: 'pasta',
        quantity: 200,
        unit: 'g',
        nutritionPerUnit: { calories: 3.5, carbs: 0.7, fat: 0.01, protein: 0.12 },
      },
    ],
    steps: ['Boil pasta', 'Add sauce'],
  });
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.disconnect();
});

test('GET /api/recipes/search returns ranked recipes', async () => {
  const app = createApp();

  const res = await request(app).get('/api/recipes/search?ingredients=tomato,onion');

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.items)).toBe(true);
  expect(res.body.items.length).toBeGreaterThan(0);

  const item = res.body.items[0];
  expect(item.title).toBe('Test Tomato Pasta');
  expect(typeof item.score).toBe('number');
});
