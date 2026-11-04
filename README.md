# Blog_Platform

Open Margin, a community blog. Express + TypeScript + MongoDB API in `nodeapp/`, React + Vite frontend in `reactapp/`.

The database design is in `Open-Margin-Database-Schema.pdf`.

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
- `CORS_ORIGIN`, optional comma-separated frontend origins when calling the API directly (defaults to the local Vite origins)
- `SENDGRID_API_KEY` and `EMAIL_FROM` for reset emails. For local testing you can set `ALLOW_DEV_RESET_CODE=true` instead, and the reset code comes back in the response
- `LLM_API_KEY` for the AI assistant, or set `MOCK_AI=true` to use fake suggestions

`ALLOW_DEV_SESSION` and `ALLOW_DEV_RESET_CODE` are for your own machine only. They are ignored when `NODE_ENV=production`.

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

Vite forwards `/api` requests to the API on port 1000.

The frontend keeps the public blog at `/` and provides `/register`, `/login`,
and `/forgot-password` for account access. Signed-in users can view and update
their profile at `/profile`.

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

Use `authenticate` from `nodeapp/src/middleware/auth.middleware.ts` on any route that needs a logged-in user. It also blocks users an admin has blocked. Add `requireAdmin` after it for admin-only routes.
