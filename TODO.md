# STITCH — TODO

Everything incomplete or broken across the app, in order of urgency.

---

## 1. Broken right now

### Cart & payments
- [x] `getCartPipeLine` is undefined ([cart.controller.js](backend/src/controller/cart.controller.js)) — add/update/remove save to the DB, then throw and return 500.
- [x] Cart aggregation duplicates items — an item with no `variantId` on a product with variants is repeated once per variant (and the total multiplied). Items whose variant was deleted vanish.
- [x] Charged amount ≠ displayed total — Cart page adds 18% tax, backend charges the subtotal only. `amount * 100` isn't rounded ([paymet.servce.js](backend/src/services/paymet.servce.js)), Razorpay rejects decimals.
- [x] Razorpay handler passes `razorpay_order_id` / `razorpay_payment_id` / `razorpay_signature`, but verify expects camelCase — every verification fails.
- [x] After payment: `navigate` is never imported in [Cart.jsx](frontend/src/features/cart/pages/Cart.jsx), `isValid` is always truthy, cart is cleared even on failure, hook reads `data.order` but backend returns `payment`.
- [x] Razorpay prefill — `user.name` is an object, `user.phoneNumber` should be `user.phone`.
- [x] Payment record snapshots the product base price, not the variant price.
- [x] `verifyOrderController` doesn't check the payment belongs to the logged-in user; no try/catch, no validator.

### Auth & security
- [x] Anyone can register as admin — `adminAproved` is never checked at login or in `authAdmin`.
- [x] `userModel.create(req.body)` lets a user set `adminAproved`, `emailVerification`, `status` ([auth.controller.js](backend/src/controller/auth.controller.js)).
- [x] Password login on a Google-only account → 500 (bcrypt compares against `undefined`). Existing email accounts never get `googleId` linked.
- [x] Google login JWT lasts 7d but the cookie lasts 1d.

### Products
- [x] `addProductVariants` is broken — bad `files` check, `.map` on a Promise, never responds, only `console.log`s ([product.controller.js](backend/src/controller/product.controller.js)).
- [x] Product page reads `isLoading` but the slice field is `loading` → "Product Not Found" flashes ([Product.jsx](frontend/src/features/products/pages/user/Product.jsx)).
- [x] Previous product's variant sticks when navigating to a product without variants; size/colour/quantity carry over.
- [x] Size & colour pickers aren't tied to variants — can add size "L" with M's `variantId`, price and stock.
- [x] `product.sizes` isn't in the schema → always shows XS–XL; products without colourways show fake Onyx/Olive/Wolf ([ProductInfo.jsx](frontend/src/features/products/components/ProductInfo.jsx)).
- [x] `getProductById` returns draft/archived products publicly.

### Admin — Create Product ([CreateProduct.jsx](frontend/src/features/products/pages/admin/CreateProduct.jsx))
- [x] SKU, slug, compare-at, cost per item, charge tax, track quantity, vendor have no `value`/`onChange` — never sent.
- [x] Category & Collection selects aren't bound — every product saves as `MEN'S OUTERWEAR` / `SS24 LUNACORE`.
- [x] Tags UI renders hardcoded chips, input isn't wired — every product gets `['Waterproof','Cordura']`.
- [x] No Gender field — every product is `unisex`.

### Wishlist & navigation
- [x] Wishlist page is hardcoded mock data ([Wishlist.jsx](frontend/src/features/wishlist/pages/Wishlist.jsx)); `/wishlist` route isn't protected.
- [x] Register stores the whole response as the user (`setUser(data)`) ([useAuth.js](frontend/src/features/auth/hook/useAuth.js)).
- [x] Guest "Add to Bag" shows "Not authorized, no token" instead of redirecting to login.

---

## 2. Missing big features

### Orders & checkout
- [x] Order model (Payment is doubling as one) + status lifecycle: processing → shipped → delivered / cancelled.
- [x] Pages: order confirmation (shown on the order page after payment), my orders, order detail, admin Orders, admin Coupons.
- [x] Checkout step with shipping address + address book.
- [x] Stock check at checkout; decrement stock after payment.
- [x] Razorpay webhook (tab closed after paying → payment stuck pending, cart not cleared); backend handling of failed payments.
- [x] Real tax & shipping logic (`chargeTax` is stored but unused; "free shipping over ₹5,000" copy has no logic).
- [x] Promo codes (input + Apply do nothing; no coupon backend).
- [x] "Buy it Now" button.
- [x] Cancellations & refunds.

### Admin panel
- [x] Edit product page, delete / archive, manage variants after creation, delete images from ImageKit.
- [x] Product list: search, category/status filters, list/grid toggle, row & select-all checkboxes, row actions (⋮) menu, real pagination.
- [x] Product list: Category column always "—"; archived shows as "Draft".
- [x] Create page: "Save as Draft", drag-and-drop upload, live storefront preview, "View Live Store Page" link.
- [x] Dashboard, Customers, Analytics, Settings pages (sidebar links are `#`).
- [x] Real admin user chip (hardcoded "Kento Y.") + admin logout.
- [x] Admin approval flow (Settings → Admin Team).
- [x] Variant management UI — handled by the edit page (the separate `addProductVariants` endpoint was removed).

### Storefront
- [x] "Men's Collection" shows every product — filter by gender; "18 items available" is hardcoded.
- [x] Collection filters (category / size / technical), sort, search, pagination — backend `getAllProducts` takes no query params; text index unused.
- [x] Women's & Accessories collection pages; 404 page.
- [x] Landing page is static — hardcoded USD products, dead "Add to Bag", "42 Items", "Shop All", "View Collection", Instagram, newsletter, footer links.
- [x] Header search.
- [x] Product page: Size Guide, real Materials/Shipping content, show `compareAtPrice`, cap quantity at stock, real related products, slug URLs.

### Wishlist page
- [x] Clear All (needs backend endpoint).
- [x] All / In Stock / On Sale / Sold Out filters, sort.
- [x] "Notify Me" (no backend); real recommendations.

### Account & auth
- [x] Logout (backend + frontend); header shows "Login" even when logged in; header fetches cart/wishlist for guests (401s).
- [x] Forgot / reset password.
- [x] Profile / account page (name, phone, avatar, addresses).
- [x] Email & phone verification.
- [x] Enforce user `status` (blocked users can log in).
- [x] Login: show-password toggle, Remember me, Apple buttons (removed), Terms/Privacy links, newsletter checkbox.
- [x] Redirect back to `state.from` after login.

---

## 3. Backend hardening
- [x] Global error handler + 404 handler.
- [x] Cookie `secure` / `sameSite` from env for production.
- [x] Don't return the JWT in the JSON body; login 404 vs 401 leaks which emails exist.
- [x] Rate limiting, `helmet`; CORS allows any localhost origin in production.
- [x] Multer accepts any file type; orphaned ImageKit uploads when product creation fails.
- [x] Add/update cart: check stock, variant belongs to product, size/colour match variant, quantity limit.
- [x] `moveToCart` isn't atomic.
- [x] Inconsistent responses — new cart from `getCart` has no `totalPrice`; `clearCart` returns an unpopulated cart.
- [x] Tests (`npm test`), `start` script (nodemon moved to devDependencies), backend `.env.example`.

---

## 4. Cleanup & consistency
- [x] Hardcoded `http://localhost:3000` in auth service, Login, Register (everything else uses the `/api` proxy); frontend `.env.example`.
- [x] Typos: `paymet.servce.js`, `foulder`, `adminAproved`, `getsAllProducts`.
- [x] Dead code: unreachable `return result` in storage service, `productdetail` slice field, unused `sizes`/`colorways` in CreateProduct, `RazorpayOrderOptions` import, `console.log`s.
- [x] Duplication: `protect`/`authAdmin` token logic, `validate` helper ×4, `currencySymbols`/`formatPrice` ×6, footer ×5 (different copyright years).
- [x] Consistent price formatting (`₹12450` vs `₹12,450`).
- [x] Remove server-only `passport` deps from the frontend.
- [x] Project README (frontend README is the Vite template).
- [x] Lint warnings (now zero).
