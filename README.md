# Tasks CRUD (MongoDB + Express + React)


## Features

- Create task (title, status defaults to `pending`)
- Read tasks (list)
- Update task (edit title, toggle status `pending` ↔ `completed`)
- Delete task
- Optional filter (All / Pending / Completed)

## Prerequisites

- Node.js
- MongoDB running locally (or a MongoDB Atlas connection string)

### Quick MongoDB via Docker (optional)

If you have Docker Desktop installed:

```bash
cd tasks-crud-mvp
docker compose up -d
```

## Backend (Express + Mongoose)

1. Configure env:

   - Copy `server/.env.example` to `server/.env`
   - Set `MONGODB_URI`

2. Run API:

```bash
cd tasks-crud-mvp/server
npm run dev
```

API endpoints:

- `GET /health`
- `POST /api/tasks`
- `GET /api/tasks?status=pending|completed` (optional)
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Frontend (React + Vite)

Run UI:

```bash
cd tasks-crud-mvp/client
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`.

