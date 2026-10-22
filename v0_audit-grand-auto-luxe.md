# Grand Auto Luxe — implementation audit

Date: 2026-10-20

## Architecture verified
- TanStack Start + Vite, not Next.js.
- Authentication and text/application state use Firebase Realtime Database; Firestore and Firebase Storage are initialized but current media upload code uses Cloudinary.
- Cloudinary unsigned uploads are implemented for images and videos in `src/lib/cloudinary.ts`.
- Grandou route exists at `src/routes/api/grandou.ts`, uses `@google/genai`, `GEMINI_API_KEY`, and `gemini-2.5-flash`; it streams text and accepts history/image payloads.
- Admin dashboard is a large existing Firebase-backed route at `src/routes/admin.tsx`.

## Requested feature classification

| Area | Classification | Evidence / issue |
| --- | --- | --- |
| Public vehicle browsing/search | EXISTS AND WORKS, needs hardening | `src/routes/index.tsx`; filters, sorting, cards, favorites/compare UI exist. Data fallback and malformed records need continued validation. |
| Vehicle detail/contact | PARTIALLY IMPLEMENTED | `src/routes/vehicle.$id.tsx`, `src/routes/car.$id.tsx`; contact, compare, Grandou analysis exist, but ownership/security and analytics coverage need verification. |
| Firebase phone/password auth | EXISTS BUT BROKEN/INSECURE | `src/hooks/use-auth.tsx`; client-readable password and hardcoded admin password, localStorage session/admin bypass, no server authorization boundary. |
| 72-hour trial | PARTIALLY IMPLEMENTED | Profile fields and access logic exist; exact feature entitlements, expiry notification, and server-side enforcement are incomplete. |
| Individual/showroom subscriptions | PARTIALLY IMPLEMENTED | `src/routes/plans.tsx`, `checkout.tsx`, admin subscription tabs. Four plans currently include yearly plans even though the requested contract specifies only monthly 1,000/2,500 DZD. Manual payment is not atomic/idempotent. |
| Payment proof workflow | EXISTS BUT BROKEN/INCOMPLETE | Checkout and admin receipt UI exist; proof access, duplicate prevention, approval audit, and Firebase-only persistence need repair. |
| Paid pinning/featured posts | PARTIALLY IMPLEMENTED | `pinned` fields and pin icons exist in feed/admin, but no complete request entity, proof workflow, deterministic schedule/expiration, audit trail, or owner/admin controls. |
| Smart Buy: compare | PARTIALLY IMPLEMENTED | `src/lib/compare.ts`, `CompareTray.tsx`; comparison UI exists, but persistent saved comparisons and entitlement rules are incomplete. |
| Smart Buy: price check | PARTIALLY IMPLEMENTED | `calculateDeal` and Grandou analysis exist; comparable count/history transparency and insufficient-data handling require verification. |
| Saved vehicles/searches/alerts | PARTIALLY IMPLEMENTED | favorites exist in feed/detail; saved searches and real notification scheduling are not established end-to-end. |
| Listings CRUD/moderation | PARTIALLY IMPLEMENTED | post/edit/my-listings/admin listing tabs exist; server-side ownership, duplicate detection, limits, and correction workflow require repair. |
| Reels | EXISTS AND WORKS, needs verification | `post-reel.tsx`, `reels.tsx`, Cloudinary video upload; media failure/empty/loading states and listing links need testing. |
| Stories | PARTIALLY IMPLEMENTED | `post-story.tsx`, `StoriesStrip.tsx`; expiration and cleanup need reliable Firebase timestamp checks. |
| Seller/showroom profiles | PARTIALLY IMPLEMENTED | `seller.$id.tsx`; inventory and profile exist, verification workflow and private document handling are incomplete. |
| Analytics | PARTIALLY IMPLEMENTED | admin analytics and seller fields exist; metrics must be tied to recorded events and not demo counters. |
| Messaging | PARTIALLY IMPLEMENTED | messages/unified inbox routes and Firebase hooks exist; authorization, block/report, unread consistency need verification. |
| Offers/appointments | PARTIALLY IMPLEMENTED | appointments exist; offer negotiation and complete authorization/notification flow are not confirmed. |
| Moderation/reports | EXISTS BUT INCOMPLETE | admin reports tab exists; policy, sanctions, audit trail and seller/listing report UX need completion. |
| Grandou AI | EXISTS AND WORKS, needs validation | Streaming/history/image path exists. Cloudinary URL fetch needs content-type/size allowlisting and request limits. |

## Highest-priority repairs
1. Remove yearly subscription UI and centralize exactly 1,000 DZD individual monthly and 2,500 DZD showroom monthly.
2. Replace client-trusted admin/password/session behavior with Firebase Auth or a server-authorized Firebase pattern without deleting existing users.
3. Implement Firebase pinning requests with owner validation, Cloudinary proof URL, explicit admin approval, scheduled/expired status checks, and idempotent audit records.
4. Add real saved-search/price-alert persistence and notification records.
5. Add verification/report workflow safeguards and test mobile routes.

## Architecture constraint
Per the latest project instruction, Supabase is banned. No Supabase packages, clients, environment variables, migrations, storage, or references should be introduced. Firebase is the text/database source and Cloudinary is the media source.
