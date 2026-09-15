# STITCH

A full-stack techwear store: storefront, accounts, checkout with Razorpay, and an admin panel.

| Part | Stack |
| --- | --- |
| `frontend/` | React 19, Vite, Redux Toolkit, React Router, Tailwind CSS v4 |
| `backend/` | Node.js, Express 5, MongoDB (Mongoose), JWT cookies, Passport (Google OAuth) |
| Services | Razorpay (payments, refunds, webhooks), ImageKit (images), Nodemailer (email), Twilio (SMS) |

## Features

- **Storefront** — collections (all / men / women / accessories) with search, filters, sort and pagination; product pages with variants, size guide and stock-aware quantity; wishlist with back-in-stock alerts.
- **Accounts** — email/password and Google sign-in, email and phone verification, forgot/reset password, profile, avatar and address book.
- **Checkout** — server-priced orders (tax, shipping, promo codes), Razorpay payment, webhook settlement, order history, cancellation with automatic refund.
- **Admin** — dashboard, analytics, products (create/edit/archive/delete, variants, bulk actions), orders, coupons, customers (block/unblock) and settings (tax, shipping, admin approvals).

## Project structure

```
backend/
  server.js                 # connects to MongoDB, starts Express
  src/
    app.js                  # middleware + routers
    config/                 # env loading, DB connection
    routes/ → validator/ → controller/ → model/
    middleware/             # auth, uploads, rate limiting, errors
    services/               # Razorpay, ImageKit, email, SMS
    utils/                  # pure helpers (pricing, pagination)
  tests/                    # node:test unit tests

frontend/src/
  app/                      # router, store, root component
  features/<feature>/
    service/                # axios calls
    state/                  # Redux slice
    hook/                   # handlers used by pages
    pages/ components/
  shared/                   # footer, pagination, info/404 pages, API + format helpers
```

## Getting started

**Prerequisites:** Node.js 20+ and a MongoDB **replica set** (MongoDB Atlas works out of the box) — moving a wishlist item to the bag uses a transaction.

### Backend

```bash
cd backend
cp .env.example .env    # fill in the required values
npm install
npm run dev             # http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173 — /api is proxied to the backend
```

### Scripts

| Where | Command | What it does |
| --- | --- | --- |
| backend | `npm run dev` | Start with auto-reload (nodemon) |
| backend | `npm start` | Start for production |
| backend | `npm test` | Run unit tests |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | Production build to `dist/` |
| frontend | `npm run lint` | Oxlint |

## Configuration notes

- **Email and SMS** — without `SMTP_*` / `TWILIO_*` values, verification links, reset links, back-in-stock emails and phone codes are printed to the backend console, so every flow still works locally.
- **Razorpay** — use test keys while developing. For the webhook, point Razorpay at `https://<api-host>/api/orders/webhook`, subscribe to `payment.captured` and `payment.failed`, and set the same secret as `RAZORPAY_WEBHOOK_SECRET`.
- **Google sign-in** — `GOOGLE_CALLBACK_URL` must match the redirect URI registered in Google Cloud (`http://localhost:3000/api/auth/google/callback` locally).
- **First admin** — admin sign-ups need approval. Approve the very first admin directly in MongoDB by setting `adminApproved: true` on that user; after that, admins approve each other under **Admin → Settings → Admin Team**.

## Deploying

- Set `NODE_ENV=production` on the backend. The session cookie then becomes `Secure` and `SameSite=None`, so the API must be served over HTTPS, and only `CLIENT_URL` is allowed by CORS.
- Build the frontend with `VITE_API_URL` set to the backend origin (see `frontend/.env.example`).
