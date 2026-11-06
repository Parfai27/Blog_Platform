# Open Margin

A community blog where people read, write, and share stories. Authors get an AI writing assistant that suggests titles, summaries, and tags, and helps improve a paragraph.

## Tech stack

- **Backend:** Node.js, Express, TypeScript, MongoDB (`nodeapp/`)
- **Frontend:** React, Vite, Tailwind CSS (`reactapp/`)

## Getting started

You need Node.js 20 or newer and MongoDB.

**API**

```bash
cd nodeapp
npm install
cp .env.example .env
npm run dev
```

Fill in `.env` before starting. The API runs on http://localhost:1000. To add sample stories, run `npm run seed:sample` once.

**Frontend**

```bash
cd reactapp
npm install
npm run dev
```

## Testing the API

Import `nodeapp/postman/Open-Margin.postman_collection.json` into Postman.
