# Grand Auto Luxe implementation audit

## Scope reviewed
Reviewed the TanStack Start/Vite app, route tree, Firebase and Supabase clients, vehicle feed/detail routes, engagement handlers, auth hooks, admin/subscription references, migrations, and current browser preview.

## Classification
- Vehicle feed/detail: **EXISTS BUT BROKEN/INCOMPLETE** — the UI reads vehicles and bids from Firebase Realtime Database only. When Firebase configuration or the realtime service is unavailable, the feed becomes empty and the detail route can remain unavailable even though Supabase credentials are present. This matches the intermittent error/blank-page reports.
- Likes/favorites/views/inquiries: **PARTIALLY IMPLEMENTED** — Supabase tables and client calls exist, but feed data is Firebase-only and some detail interactions still use Firebase/local fallback. Persistence and cross-surface consistency are therefore not guaranteed.
- Comments: **PARTIALLY IMPLEMENTED** — detail comments use browser localStorage, not durable shared storage.
- Subscriptions/payment workflow: **EXISTS PARTIALLY** — plan/paywall/admin references and pending subscription migration exist; end-to-end entitlement enforcement and callback/idempotency need a separate phase.
- Featured/pinned posts: **PARTIALLY IMPLEMENTED** — vehicle `is_featured/featured_until` schema and client-side `pinned` ordering exist; paid request, proof storage, admin approval, audit history, and server-side expiration are not complete in the reviewed implementation.
- Grand Smart Buy/Grandou: **EXISTS PARTIALLY** — Grandou UI/API exists; price analysis, saved searches, alerts, and comparison are separate/incomplete surfaces.
- Messaging/appointments/reels/stories/admin: **EXISTS PARTIALLY** — routes/components and some migrations exist, but full end-to-end verification requires a separate feature pass.

## Priority repair in this pass
1. Keep Firebase as an optional legacy source, but fall back to Supabase for vehicle feed and vehicle detail.
2. Make loading failures recoverable with a real error state and retry rather than rendering a blank/error shell.
3. Use the same Supabase source for related vehicles and ownership lookup where Firebase is unavailable.
4. Preserve existing URLs, branding, authentication, and existing data.

## Pending phases
- Consolidate all engagement mutations behind one durable Supabase contract and migrate local comments.
- Complete paid pinning with secure proof storage, admin approval, audit history, and server-side expiration.
- Complete subscription entitlement enforcement and payment idempotency review.
- Complete Grand Smart Buy alerts/searches/comparison and end-to-end messaging analytics review.
