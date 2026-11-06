# Blog_Platform

Open Margin, a community blog. Express + TypeScript + MongoDB API in `nodeapp/`, React + Vite frontend in `reactapp/`, Kotlin + Jetpack Compose Android app in `androidapp/`.

The models in `nodeapp/src/model/` are the database design.

## Get the code

```bash
git clone https://github.com/Parfai27/Blog_Platform.git
cd Blog_Platform
git checkout Parfait
git checkout -b <your-name>-<feature>
```

Build your part on your own branch, starting from `Parfait`, which has the API work so far.

## Run the API

You need Node 20 or newer and MongoDB (local or Atlas).

```bash
cd nodeapp
npm install
cp .env.example .env
npm run dev
```

Fill `.env` before starting:

- `MONGO_URI`, for example `mongodb://127.0.0.1:27017/open-margin`
- `JWT_SECRET`, any long random string
- `CLOUDINARY_*`, needed for sign-up, because a profile image is required
- `SENDGRID_API_KEY` and `EMAIL_FROM` for reset emails. For local testing you can set `ALLOW_DEV_RESET_CODE=true` instead, and the reset code comes back in the response
- `LLM_API_KEY` for the AI assistant, or set `MOCK_AI=true` to use fake suggestions

`ALLOW_DEV_SESSION` and `ALLOW_DEV_RESET_CODE` are for your own machine only. They are ignored when `NODE_ENV=production`. With `ALLOW_DEV_SESSION=true`, the editor at `/write` signs in as a local "Dev Writer" account (created on first use), so you can save posts without signing up.

The API runs on http://localhost:1000. Check it with `GET /api/health`.

## Test with Postman

Import `nodeapp/postman/Open-Margin.postman_collection.json`. Log in, then paste the token after `Bearer ` in the Authorization header of protected requests. When you add an endpoint, add a request for it to this collection.

Auth routes are rate-limited (for example 10 logins per 15 minutes per IP). Restart the API to reset the limits while testing.

## Run the frontend

```bash
cd reactapp
npm install
npm run dev
```

Vite forwards `/api` requests to the API on port 1000. To use an API on another port, start Vite with `API_URL`, for example `API_URL=http://localhost:1099 npm run dev`.

For sample stories to show up, run `npm run seed:sample` inside `nodeapp` once.

### Pages

| Address | Page |
|---|---|
| `/` | Homepage with the latest stories |
| `/blogs`, `/search?q=` | All stories, and search results (filter by category and tag, sort) |
| `/posts/:slug` | A story with likes, comments, and reporting |
| `/categories/:slug`, `/authors/:id` | A category's stories, and an author's profile |
| `/about` | About Open Margin |
| `/register`, `/login`, `/forgot-password` | Accounts |
| `/write`, `/write/:id`, `/my-posts`, `/settings` | Writing and your profile (logged in) |
| `/admin/reports`, `/admin/categories`, `/admin/users` | Admin area (admins only) |

### Where things are

- `src/lib/api.js` is the only way the app talks to the API. Use `api("/posts")`; it adds the login token and returns the reply's `data`.
- `src/context/` holds the login state. Read it with `useAuth()`.
- `src/components/ui/` has the shared Figma pieces: Button, Badge, TagChip, Avatar, form fields, Modal, and loading and error states.
- Colours and fonts are defined once in `src/index.css` (`bg-brand`, `text-muted`, `font-serif`, ...). Use those instead of colour codes.

### Production build

```bash
cd reactapp
npm run build
```

This creates `reactapp/dist`. When that folder exists, the API serves the site too, so http://localhost:1000 shows the whole app.

## Run the Android app

Open the `androidapp/` folder in Android Studio and press Run. The emulator talks to the API at `http://10.0.2.2:1000/`. See [androidapp/README.md](androidapp/README.md) for using a real phone.

## API so far

| Method | Path | Auth |
|---|---|---|
| GET | `/api/health` | none |
| POST | `/api/auth/signup` | none (form-data with `avatar` file) |
| POST | `/api/auth/login` | none |
| POST | `/api/auth/forgot-password` | none |
| POST | `/api/auth/reset-password` | none |
| GET | `/api/auth/me` | token |
| PATCH | `/api/users/me` | token (form-data or JSON) |
| GET | `/api/ai/usage` | token |
| POST | `/api/ai/titles`, `/summary`, `/tags`, `/improve` | token |
| GET | `/api/categories`, `/api/categories/:slug` | none |
| POST | `/api/categories` | admin |
| PATCH, DELETE | `/api/categories/:id` | admin |
| GET | `/api/tags?search=` | none |
| GET | `/api/posts?search=&category=&tag=&author=&sort=&page=&limit=` | none (published only) |
| GET | `/api/posts/:slug` | none (published only) |
| POST | `/api/posts` | token (creates a draft) |
| PATCH | `/api/posts/:id` | token, own post |
| POST | `/api/posts/:id/cover` | token, own post (form-data `cover` file) |
| POST | `/api/posts/:id/publish`, `/api/posts/:id/unpublish` | token, own post |
| GET | `/api/posts/mine`, `/api/posts/mine/:id` | token |
| DELETE | `/api/posts/:id` | token, own post or admin |
| GET | `/api/users/:id` | none (public author profile) |
| GET, POST | `/api/posts/:id/like` | token (POST likes or unlikes) |
| GET | `/api/posts/:id/comments` | none |
| POST | `/api/posts/:id/comments` | token |
| DELETE | `/api/comments/:id` | token, own comment or admin |
| POST | `/api/reports` | token |
| GET | `/api/admin/reports?status=open\|resolved\|all` | admin |
| PATCH | `/api/admin/reports/:id/resolve` | admin |
| GET | `/api/admin/users?search=&status=active\|blocked` | admin |
| PATCH | `/api/admin/users/:id/block`, `/api/admin/users/:id/unblock` | admin |

## Helper scripts

Run these inside `nodeapp`:

- `npm run make-admin -- someone@example.com` turns an existing account into an admin, so you can test admin routes.
- `npm run seed:categories` adds City, Food, Craft, and Field Notes. Running it again skips the ones that exist.
- `npm run seed:sample` adds the categories, 8 sample authors, their published posts (with tags, likes, and comments), and one draft. These are the same stories the homepage shows today. The sample login password is `SAMPLE_PASSWORD` in `nodeapp/src/data/sample-content.ts`. Running it again skips what exists. It refuses to run with `NODE_ENV=production`.

A quick start for a fresh database: `npm run seed:sample`, then sign up yourself and run `npm run make-admin -- your@email.com`.

Use `authenticate` from `nodeapp/src/middleware/auth.middleware.ts` on any route that needs a logged-in user. It also blocks users an admin has blocked. Add `requireAdmin` after it for admin-only routes.
