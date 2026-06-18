This is a very large multi-feature upgrade. I'll break it into phased, shippable batches so the app keeps working between turns. Here's the proposed roadmap — please confirm or reorder.

## Phase 1 — Foundations (DB + currency + seller controls)
- **DB migrations** (one combined migration):
  - `pending_subscriptions` (user_id, plan: monthly|yearly, amount, receipt_url, status, reviewed_at)
  - extend `vehicles`: `status` ('pending'|'active'|'sold'|'rejected'), `is_featured`, `featured_until`, `paint_condition`, `documents_status`, `transaction_types[]`, `is_vip`
  - extend `profiles`: `is_banned`, `is_showroom`, `showroom_name`, `showroom_logo`, `showroom_description`, `trial_started_at`
  - `vehicle_reports`, `admin_logs`, `notifications`, `broadcast_messages`, `car_alerts`, `messages` (buyer/seller chat), `showroom_reviews`, `stories` (videos), `vehicle_images` already exist
  - RLS + GRANTs for each
- **Algerian currency util** (`formatDZD`, `formatCentimes`, parsers) + price input that accepts millions/centimes
- **Seller dashboard actions**: edit / delete / mark-as-sold with gold "SOLD / تم البيع" overlay on cards
- **Horizontal image carousel** on vehicle detail page

## Phase 2 — Checkout + Paywall + Admin v2
- **Manual checkout page** with copy buttons for HEGUEHOUG LOKMANE CHAOUKI / RIP 007 99999 0043958063 39 / CCP 0043958063 clé 39, plan dropdown (1,000 / 10,000 DA), receipt upload → `pending_subscriptions`
- **3-day trial paywall** modal triggered from `trial_started_at`
- **Admin dashboard expansion**: tabs for Pending Subscriptions (approve/reject + revenue widget), Users (ban/reactivate/reset password via admin server fn), Moderation Queue (pre-approval), Reports, VIP/Showroom promotion, Broadcast, Activity Logs

## Phase 3 — Market filters + Compare + Chat
- Smart filters on browse + post forms (paint, docs, transaction types)
- "Luxury Compare" — select 2 vehicles, side-by-side overlay
- In-app chat (messages table + realtime) with the 4 Arabic quick templates

## Phase 4 — Alerts + Showrooms + Stories
- Car alerts CRUD + match trigger on new listing → notification
- Showroom profile route + 5-star reviews
- Stories/Reels horizontal rail on home, 30s vertical clips, gold CTA → vehicle page

## Notes
- All UI keeps the dark-luxury / glowing gold #D4AF37 theme already in `styles.css`
- Password reset by admin requires `supabaseAdmin` + role check in a server fn
- Stories use existing `vehicle-media` bucket (or new `stories` bucket if needed)
- Each phase is independently deployable

**Scope of this plan is roughly 2–4 full work sessions.** I recommend approving Phase 1 first, then I'll proceed sequentially. Reply with "go phase 1" (or specify a different order / subset) to start.
