# G-livery

Campus food logistics: students order from cafeteria live menus, runners fulfill deliveries, kitchens manage their own QR e-menus, and admin oversees the platform. **Food and delivery are paid off-platform.** Platform revenue is runner subscriptions.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL (Neon in production) · Auth.js · Cloudinary · Flutterwave (runner subscriptions only)

## Local setup

1. Install Node 20+. For a local database, either run `npx prisma dev` (Prisma Postgres) or `docker compose up -d` (Docker Postgres on port 5433). On Windows, use `127.0.0.1` instead of `localhost` in `DATABASE_URL`.
2. Copy env and point `DATABASE_URL` / `DIRECT_URL` at that database:

```bash
cp .env.example .env
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

### Demo logins (from seed)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@g-livery.app` | `Admin123!` |
| Cafeteria | `kitchen@g-livery.app` | `Kitchen123!` |
| Runner | `runner@g-livery.app` | `Runner123!` |
| Student | `student@g-livery.app` | `Student123!` |

Seeded kitchen: `/cafeteria/campus-grill` · seeded runner link: `/r/amaka-runs`

## Environment

See `.env.example`. Production:

- **Vercel** for the app (`AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`)
- **Neon** `DATABASE_URL` (pooled) and `DIRECT_URL` (migrations)
- **Cloudinary** for menu photos
- **Flutterwave** keys + webhook `https://<domain>/api/webhooks/flutterwave`

Cafeteria accounts are **admin-created only**. Runner subscriptions can be paid via Flutterwave or flipped manually in the admin panel.

### Google sign-in

Create an OAuth 2.0 Web client in Google Cloud Console and set `AUTH_GOOGLE_ID` plus `AUTH_GOOGLE_SECRET`. Authorized redirect URIs:

- `http://localhost:3000/api/auth/callback/google`
- `https://g-livery-run.vercel.app/api/auth/callback/google`

Google is available on login, student signup, and agent signup. New Google users take the role of the page they started from. Existing emails (including cafeteria and admin) only sign in.
