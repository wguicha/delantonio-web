# Del Antonio Web — Contexto del Proyecto

Pizzería "Del Antonio" con temática rock. Villanueva de la Reina, Jaén, España.
Stack: Vite + React + TS + Tailwind (frontend) / Node.js + Express + Prisma + PostgreSQL (backend).

## Estado: COMPLETO (7/7 fases)

- [x] Phase 1 — Setup & arquitectura
- [x] Phase 2 — Backend completo
- [x] Phase 3 — Landing page + fundación frontend
- [x] Phase 4 — OrderPage (carrito + formulario pedido)
- [x] Phase 5 — AdminPage (pedidos, menú, clientes)
- [x] Phase 6 — SSE tiempo real + WhatsApp "listo" + fix admin menu
- [x] Phase 7 — Deploy (vercel.json + render.yaml)

## Arrancar en local

```bash
# 1. PostgreSQL
docker run -d --name delantonio-db -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=delantonio_db -p 5432:5432 postgres:16

# 2. Backend
cp backend/.env.example backend/.env
# Editar DATABASE_URL → postgresql://postgres:password@localhost:5432/delantonio_db
cd backend && npm install
npm run db:migrate
npm run db:seed      # crea admin/admin123 + menú completo
npm run dev          # → http://localhost:3001

# 3. Frontend
cp .env.example .env
npm install && npm run dev  # → http://localhost:5173
```

## Credenciales de desarrollo
- Admin panel: `http://localhost:5173/admin/login` — `admin` / `admin123`
- Backend health: `http://localhost:3001/health`

## Reglas del proyecto
- Todo código interno en **inglés**, UI en **español**
- Pedidos solo para recoger (no delivery)
- RGPD España/UE — checkboxes obligatorios en formulario de pedido
- Teléfonos españoles únicamente (6xx, 7xx, 9xx)
- WhatsApp Business API directa con Meta (no Twilio)
- Mínimo 30 minutos de antelación para pedidos
- Zod v4 en frontend (usa `error` no `errorMap`, usa `.boolean().refine()` no `z.literal(true, {errorMap})`)
- Zod v3 en backend (usa `errorMap`)

## Arquitectura frontend
```
src/
  pages/         — HomePage, OrderPage, AdminPage, LoginPage, PrivacyPage, LegalPage, CookiesPage
  components/
    layout/      — Header (con badge carrito), Footer, Logo, CookieBanner
    menu/        — MenuSection (tabs categoría), MenuItemCard (precio simple/media/entera)
    ui/          — LoadingSpinner
    router/      — ProtectedRoute
  store/         — cartStore (Zustand+persist), authStore (Zustand+persist)
  services/      — api (axios + JWT interceptor), menuService, orderService, authService
  hooks/         — useMenu (fetch + fallback a staticMenuData)
  data/          — menuData.ts (datos estáticos de fallback + ROCK_BAND_PIZZAS set)
  types/         — index.ts (Category, MenuItem, CartItem, Order, Customer, etc.)
```

## Arquitectura backend
```
backend/
  src/
    controllers/ — menuController, orderController, customerController, authController
    routes/      — menu, orders, customers, auth
    services/    — whatsappService (Meta API), phoneValidationService
    middleware/  — auth (requireAuth + requireAuthSSE para EventSource), rateLimiter, errorHandler
    config/      — env.ts, database.ts
  prisma/
    schema.prisma
    seed.ts
    migrations/
```

## API Endpoints

### Públicos
- `GET /health`
- `GET /api/menu/categories` — solo items activos
- `POST /api/orders` — crea pedido (valida teléfono, tiempo, geoloc)
- `GET /api/customers/lookup?phone=xxx` — autocomplete nombre
- `POST /api/customers/deletion-request` — RGPD derecho al olvido
- `POST /api/auth/login`

### Admin (JWT en header o `?token=` para SSE)
- `GET /api/orders/events` — SSE tiempo real (EventSource)
- `GET /api/orders`
- `PATCH /api/orders/:id/status` — envía WhatsApp al cliente cuando → READY
- `GET /api/menu/admin/categories` — TODOS los items (incluyendo inactivos)
- `PUT /api/menu/items/:id`
- `PATCH /api/menu/items/:id/toggle`
- `GET /api/customers`

## Diseño & Temática
- Colores: `#080808` negro, `#dc2626` rojo, dorado, gris metálico
- Fuentes: Bebas Neue (títulos), Roboto Condensed (texto)
- Clases Tailwind custom: `rock-black`, `rock-red`, `rock-red-bright`, `rock-gold`, `rock-card`, `rock-border`, `rock-metal`, `rock-metal-light`, `rock-white`, `rock-dark`
- Botones con `clipPath: polygon(Xpx 0%, 100% 0%, calc(100% - Xpx) 100%, 0% 100%)` — efecto paralelogramo
- Pizzas rock: Metallica, Iron Maiden, AC/DC, RollingStone, Ramones, Extremoduro, Barricada, Marea, Rockera, Cabronazo

## Deploy
- **Frontend** → Vercel (auto-detecta Vite, `vercel.json` incluido para SPA routing)
  - Env: `VITE_API_URL=https://tu-backend.onrender.com/api`
- **Backend** → Render (`render.yaml` incluido, `rootDir: backend`)
  - DB: Neon o Supabase (PostgreSQL free tier)
  - El `start:prod` ejecuta `prisma migrate deploy` antes de arrancar
  - `ADMIN_PASSWORD` en env vars de Render antes de correr el seed

## Pendiente antes de ir live
- [x] Completar dirección real y teléfono en `index.html` (Schema.org) — **DONE**
- [x] Coordenadas reales de la pizzería en `PIZZERIA_LAT` / `PIZZERIA_LNG` — **DONE (38.7732, -3.6410)**
- [ ] Añadir `/public/og-image.jpg` (imagen Open Graph para redes sociales)
- [ ] Configurar WhatsApp Business API en Meta Developer Console
- [ ] Cambiar `ADMIN_PASSWORD` en producción (default: admin123)
