
# GRAND Auto Luxe — Build Plan

A premium, vehicle-only marketplace for Algeria with auctions, reels-style browsing, 72h trial → 1000 DZD/month paywall, and an admin panel.

## 1. Backend (Lovable Cloud)

Enable Cloud first. Schema:

- **profiles** — `id (uuid, fk auth.users)`, `first_name`, `last_name`, `dob`, `place_of_birth`, `phone (UNIQUE, NOT NULL)`, `trial_started_at (timestamptz default now())`, `subscription_status (enum: trial | active | locked) default 'trial'`, `subscription_until (timestamptz)`.
- **user_roles** — `user_id`, `role (enum app_role: admin|user)` + `has_role()` security-definer fn.
- **vehicles** — brand, model, year, mileage, fuel_type, transmission, engine_type, wilaya, phone, photos (text[]), video_url, price_type (fixed|auction), fixed_price, starting_price, auction_ends_at, current_highest_bid, current_highest_bidder, status (active|closed), seller_id.
- **bids** — vehicle_id, bidder_id, amount, created_at. Trigger validates amount > current_highest_bid and updates vehicle.
- **payments** — user_id, screenshot_url, status (pending|approved|rejected), submitted_at.
- **Storage buckets**: `vehicle-media` (public), `payment-receipts` (private).
- **Phone uniqueness** enforced by UNIQUE constraint → friendly error in signup handler.
- **RLS**: public read on vehicles; insert/update restricted to owners; bids insert if subscription active or in trial; admin policies via `has_role`.

## 2. Auth flow

- TanStack route `/auth` with signup form (first/last name, DOB, place of birth, phone). Email+password under the hood (use phone as login identifier surrogate via email like `{phone}@grandautoluxe.app` to keep Supabase auth simple, OR collect email too — going with **email + phone**, since Supabase needs email for auth).
- Profile row created via trigger on signup; phone uniqueness via UNIQUE index → catch error and show red premium box.
- `_authenticated/` layout (managed) gates the app.

## 3. Trial / Paywall

- `useSubscription()` hook computes: `if status='active'` → unlocked; `if status='trial' and now - trial_started_at < 72h` → unlocked; else → show locked paywall modal globally.
- Paywall card: gold border, copy from spec, Baridimob account name + RIP placeholder, file upload to `payment-receipts` → creates `payments` row pending.

## 4. Feed

- `/` home: filters bar (brand, model, year, min/max price, fuel, transmission, wilaya — all 58 Algerian wilayas), tabs **Reels** / **Grid**.
- Reels: vertical snap-scroll feed of vehicle videos, overlaid price/model/countdown.
- Grid: premium cards.

## 5. Listing detail `/vehicle/$id`

- Photo carousel + video, specs, Call/WhatsApp gold buttons.
- If fixed price → show price + contact buttons.
- If auction → current highest bid badge + live countdown + "Place a Bid" button (modal). Validates > current. After timer = 0 → "Bidding Closed"; seller sees "Contact Winning Bidder" → reveals winner phone.

## 6. Post Ad `/post`

- Form: up to 5 photos + 1 vertical video, brand/model/year/mileage/engine/fuel/transmission/wilaya/phone, price type toggle (Fixed / Auction → starting price + duration 24h/48h/72h).

## 7. Admin `/admin`

- Gated by `has_role(admin)`. Tabs: Users, Listings (delete non-compliant), Pending Payments (view receipt, approve → set subscription_status='active', subscription_until=+30d).

## 8. Design system

- Matte black `#121212` bg, deep charcoal `#1a1a1a` surfaces, brushed gold `#D4AF37` accents, premium red `#C8102E` for errors.
- Typography: Playfair Display (headings) + Inter (body).
- Tokens in `src/styles.css` (oklch). Button variants: `gold`, `gold-outline`, `destructive-premium`.

## Scope of this first build

Ship the full architecture end-to-end with realistic UI polish on all main screens. Reels view uses video element with snap scroll. No real payment processor — Baridimob receipt upload + admin approval only (as specified).
