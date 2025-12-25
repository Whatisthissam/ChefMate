# 🍽️ ChefMate

A full-stack recipe recommendation app that helps you discover meals based on the ingredients you have, save favorites, and publish your own recipes.

## ✨ Features

* **Ingredient-based search** with ranking (best / popular / time)
* **Title fallback search** (if ingredient search yields no results)
* **Trending recipes** + cuisine filter
* **Meal categories** (breakfast, lunch, dinner, dessert, snacks, drinks)
* **Recipe details** with serving scaling + nutrition estimate
* **Authentication** (JWT)
* **Saved recipes** (save/unsave)
* **Publish your own recipes**

  * Shows **Published by {username}**
  * Includes **Delete** action for your own published recipes
* **Optional real-time** updates with Socket.IO (server emits trending updates)

## 🛠️ Tech Stack

* **Client**: React (Vite), React Router, Context API
* **UI/Styling**: TailwindCSS, Radix UI primitives, Lucide icons
* **Server**: Node.js, Express
* **Database**: MongoDB + Mongoose
* **Auth**: JWT
* **Real-time**: Socket.IO
* **Testing**: Jest + Supertest

## 📂 Repo Structure

* `client/` React (Vite) frontend
* `server/` Express API + MongoDB models

## 🚀 Getting Started (Local Development)

### ✅ Prerequisites

* Node.js 18+
* MongoDB (local or cloud)

### 1️⃣ Environment variables (keep secrets in `.env`)

Create:

* `server/.env`

Use `server/.env.example` as a template. **Do not commit `.env` files** (they are already ignored by `.gitignore`).

Minimum required server vars:

* `PORT` (default `5001`)
* `MONGODB_URI`
* `JWT_SECRET`
* `JWT_EXPIRES_IN`
* `CLIENT_ORIGIN` (default `http://localhost:5173`)

Client (optional):

* `client/.env.local` with `VITE_SERVER_URL=http://localhost:5001` (only if your server runs on a different port)

### 2️⃣ Install dependencies

```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 3️⃣ Seed data (optional)

```bash
npm run seed
```

### 4️⃣ Run the app

From the repo root:

```bash
npm run dev
```

* **Client**: [http://localhost:5173](http://localhost:5173)
* **Server**: [http://localhost:5001](http://localhost:5001)
* **API Base**: `/api` (Vite proxies `/api` to the server)

## 📜 Scripts

From repo root:

* `npm run dev` — runs client + server together
* `npm run dev:server` — server only
* `npm run dev:client` — client only
* `npm run seed` — seed sample data
* `npm run test` — server tests

## 🔗 API Overview

Base URL (dev): `http://localhost:5001/api`

### 🔐 Auth

* `POST /auth/register` `{ name, email, password }`
* `POST /auth/login` `{ email, password }` → `{ token }`

### 🍲 Recipes

* `GET /recipes/search?ingredients=tomato,onion&servings=2&sort=best`
* `GET /recipes/trending?limit=12&cuisine=Indian`
* `GET /recipes/ingredients/suggest?q=tom`
* `GET /recipes/by-meal?meal=breakfast&limit=10`
* `GET /recipes/:id`
* `POST /recipes` (auth)
* `PUT /recipes/:id` (auth)
* `DELETE /recipes/:id` (auth; restricted to publisher/admin)

### 👤 User Recipes (Published)

* `POST /user-recipes` (auth) — publish a recipe
* `GET /user-recipes/me` (auth) — list recipes you published
* `DELETE /user-recipes/:userRecipeId` (auth) — delete your published recipe

### ❤️ Users (Saved recipes)

* `GET /users/me` (auth)
* `GET /users/me/saved` (auth)
* `POST /users/me/saved` `{ recipeId }` (auth)
* `DELETE /users/me/saved/:recipeId` (auth)

For detailed request/response examples, see `API_POSTMAN_TESTING_GUIDE.txt`.

## 🖼️ Screenshots

### 📸 Application Screenshots

```md

```

## 🔒 Security Notes

* Keep secrets in `.env` files.
* Never commit real credentials, tokens, or database connection strings.
* Use `server/.env.example` as the public template.
