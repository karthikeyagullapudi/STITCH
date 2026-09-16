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

## Deploying (Render)

`render.yaml` deploys everything as **one web service**: Render builds the frontend, and Express serves it alongside the API, so the storefront and `/api` share a domain and the login cookie stays first-party.

1. Push the code to GitHub.
2. In Render: **New → Blueprint**, pick the repository, and fill in the values it asks for (`DB_URI`, Google, ImageKit and Razorpay keys; the optional ones can stay blank). `JWT_SECRET` is generated for you.
3. After the first deploy, note the service URL (e.g. `https://stitch.onrender.com`). `CLIENT_URL` and `GOOGLE_CALLBACK_URL` default to it automatically.
4. **Google Cloud Console** → your OAuth client: add `https://<service-url>` to *Authorized JavaScript origins* and `https://<service-url>/api/auth/google/callback` to *Authorized redirect URIs*.
5. **MongoDB Atlas** → *Network Access*: allow Render to connect (`0.0.0.0/0`, or Render's outbound IPs for your region).
6. **Razorpay** (optional): add a webhook to `https://<service-url>/api/orders/webhook` for `payment.captured` and `payment.failed`, and set `RAZORPAY_WEBHOOK_SECRET` in Render.

Notes:

- The free plan sleeps after ~15 minutes without traffic; the first request afterwards takes about a minute.
- Without SMTP/Twilio settings, verification links, reset links and phone codes appear in the service's **Logs** tab.
- To host the frontend separately instead, build it with `VITE_API_URL` set to the API origin and set `COOKIE_SAME_SITE=none` on the backend (browsers that block third-party cookies, such as Safari, won't keep users signed in).
