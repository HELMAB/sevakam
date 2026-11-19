# Technical Specification — Sevakam

Status: **Draft v0.1** (2026-11-19)
Derived from: [`docs/pr`](../pr/README.md) (project requirements) and `Home Service Mobile.xlsx` (original task list and estimates, kept in this folder).

The requirements in `docs/pr` say **what** the system must do. This spec says **how** it is built. Requirement IDs (`JOB-`, `BR-`, `CUS-`, `TEC-`, `ADM-`, `NFR-`) are referenced throughout for traceability.

| # | Document | Contents |
| - | -------- | -------- |
| 1 | [Architecture](01-architecture.md) | Components, tech stack, repo layout, environments, external services |
| 2 | [Data model](02-data-model.md) | PostgreSQL/PostGIS tables, columns, enums, indexes |
| 3 | [Job state machine](03-job-state-machine.md) | Statuses, transitions, guards, side effects, scheduled tasks |
| 4 | [API](04-api.md) | Conventions, auth, endpoint catalogue |
| 5 | [Realtime & notifications](05-realtime-notifications.md) | Reverb channels and events, FCM push types, live location |
| 6 | [Pricing, points, payment & ranking](06-pricing-points-payment.md) | Formulas, ABA PayWay flow, points ledger, rewards, ranking |
| 7 | [Customer app](07-customer-app.md) | Flutter architecture, routes, screens |
| 8 | [Technician app](08-technician-app.md) | Flutter routes and screens by role |
| 9 | [Admin dashboard](09-admin-dashboard.md) | Vue 3 architecture, routes, pages |
| 10 | [Testing & delivery](10-testing-delivery.md) | Test strategy, milestones |
| — | `Home Service Mobile.xlsx` | Original draft task list with estimates |

## Decisions made while writing this spec (2026-11-19)

These answer the open questions in `docs/pr/08-open-questions.md`:

| Topic | Decision |
| ----- | -------- |
| Promotion + price proposal | A technician's **proposed price replaces** the promotional estimate (the technician sees the discounted estimate when proposing). |
| Technician points | Redeemable for **rewards** from an admin catalog. Points are held on request and handed over manually by admin (or refunded if rejected). |
| Points expiry | All points **expire 12 months** after they were earned; when points are spent, the oldest are used first. |
| Owner assignment timeout | Owner has **15 min** to assign; the assigned employee then has their own 15 min. |
| Scheduling | Scheduled bookings only, **≥ 1 h ahead**, inside the provider's **working hours**. |
| Verification | **Email verification code** only; no SMS OTP. |
| Live location | Customer sees the technician's **live location on a map** while the job is `on_the_way`. |
| Company owner | The owner **can also take jobs**. Employees **inherit** the company's subservices, service area and working hours. |
| Currency | Prices are stored in **USD** and also shown in **KHR** using an admin-set exchange rate. |
| Penalties | Acceptance rate (last 90 days) **lowers ranking**; no point deduction. |
| Defaults | Alert 1 h before the appointment; a technician can't cancel a confirmed job; max 5 photos per job; promotions have start/end dates; refunds are manual; rejected registrations can resubmit; no chat. |
| Database | **PostgreSQL 16 + PostGIS**, installed locally by each developer (no Docker). |
| Accounts | **One `users` table with a `role` column**; one email = one role. |
| Mobile | Flutter, **Riverpod + go_router + dio**, layered architecture. |
| Admin | Vue 3 + TypeScript, **shadcn-vue + Tailwind + Pinia**, Vue Router, TanStack Table. |
| Files | **S3-compatible** storage; private documents served via signed URLs. |
| Ranking | `bayesian_rating × (0.7 + 0.3 × acceptance_rate_90d)`, weights admin-configurable. |
