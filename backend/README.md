# Del Antonio Backend API

Rock-themed pizzeria REST API built with Node.js + Express + TypeScript + Prisma + PostgreSQL.

## Setup

1. Copy `.env.example` to `.env` and fill in values
2. `npm install`
3. `npx prisma migrate dev --name init`
4. `npm run db:seed`
5. `npm run dev`

## API Endpoints

### Public
- `GET /health` — Health check
- `GET /api/menu/categories` — All categories with items
- `GET /api/menu/categories/:slug` — Single category
- `POST /api/orders` — Place an order
- `GET /api/customers/lookup?phone=xxx` — Phone autocomplete
- `POST /api/customers/deletion-request` — GDPR right to erasure
- `POST /api/auth/login` — Admin login

### Admin (JWT required)
- `GET /api/orders` — List orders (paginated)
- `PATCH /api/orders/:id/status` — Update order status
- `POST /api/menu/items` — Create menu item
- `PUT /api/menu/items/:id` — Update menu item
- `PATCH /api/menu/items/:id/toggle` — Toggle item active
- `GET /api/customers` — List customers

## Database Setup (free options)
- **Neon**: https://neon.tech (free tier, serverless PostgreSQL)
- **Supabase**: https://supabase.com (free tier)
- **Local**: `docker run -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres:16`

## Deployment (free options)
- **Render**: https://render.com (free tier, sleeps after 15min)
- **Fly.io**: https://fly.io (free tier)
