# 9. Admin dashboard (`admin/`)

## 9.1 Architecture

| Concern | Choice |
| ------- | ------ |
| Framework | Vue 3 `<script setup>` + **TypeScript**, Vite |
| UI | **shadcn-vue** (Reka UI) + Tailwind CSS, lucide icons |
| State | **Pinia** (auth store, settings store; server data fetched per page through composables) |
| Routing | Vue Router with an auth guard (`meta.requiresAuth`) |
| Tables | TanStack Table (server-side pagination, sort, filter via query string) |
| Forms | vee-validate + zod; server 422 errors mapped onto fields |
| HTTP | axios instance with bearer token and 401 → logout |
| Realtime | laravel-echo + pusher-js on `private-admin` (new registrations / promotions counters) |
| Charts | a lightweight chart lib (e.g. vue-chartjs) for dashboard trends |

```
admin/src/
├── main.ts, App.vue, router/, stores/
├── lib/            api.ts (axios), echo.ts, format.ts (money USD/KHR, dates)
├── components/ui/  shadcn-vue generated
├── components/     DataTable, StatusBadge, ConfirmDialog, ImageUpload, MoneyInput, JobTimeline
├── composables/    usePaginatedQuery, useMutation
└── pages/<area>/   list + detail + form views
```

The existing scaffold (`admin/` Vue 3 + Vite, JavaScript) will be migrated to TypeScript and these dependencies added.

## 9.2 Layout

Sidebar + top bar (admin name, logout). Sidebar badges show pending counts for Approvals, Promotions and Reward redemptions.

## 9.3 Pages

| Route | Page | Req |
| ----- | ---- | --- |
| `/login` | Login | ADM-01 |
| `/` | Dashboard: KPI cards (jobs today, completed, cancelled, revenue cash vs PayWay, new customers/technicians), jobs-by-status chart, date-range picker | ADM-60 |
| `/approvals` | Pending registrations table (type, name, company, submitted) | ADM-10 |
| `/approvals/:userId` | Profile, documents (signed-URL preview), map location; Approve / Reject with reason | ADM-11 |
| `/customers`, `/customers/:id` | List + detail (profile, addresses, jobs, points, ratings given); Suspend; Adjust points | ADM-12, 40, 52 |
| `/technicians`, `/technicians/:id` | List (type, company, status, rating, rank) + detail (documents, jobs, ratings, acceptance, online sessions, points) | ADM-12, 40 |
| `/companies`, `/companies/:id` | Company detail with employees, offerings, hours | ADM-40 |
| `/services` | Main services (drag to reorder, icon upload, active toggle) | ADM-20 |
| `/services/:id/subservices` | Subservices with base price, unit, active | ADM-21 |
| `/reasons` | Tabs by reason type | ADM-22 |
| `/promotions` | Tabs pending / active / ended / rejected; detail with items; Approve / Reject / Deactivate | ADM-30, 31 |
| `/jobs` | Filters: status, date range, service, provider, technician, payment method, code search | ADM-41 |
| `/jobs/:id` | Summary, items & prices, photos, assignments history, status timeline, payments, rating; actions: Cancel, Reassign, Mark paid, Refund (note required) | ADM-42, 43 |
| `/ratings` | List with stars filter; Hide / Unhide | ADM-44 |
| `/rewards` | Reward catalog CRUD | — |
| `/reward-redemptions` | Requests; Approve / Reject / Fulfil | — |
| `/settlements` | Outstanding per provider; record a settlement (selects unsettled payments); history | ADM-61, 62 |
| `/reports` | Exports (jobs, payments, settlements) to CSV | ADM-63 |
| `/settings` | Grouped forms: Jobs (timeouts, cutoff, lead time, alert), Points, Ranking weights, Currency (KHR rate), Uploads | ADM-50 |
| `/pages/:slug` | Terms editor (customer / technician), rich text | ADM-51 |

v1 has a single admin role (ADM-02 is "should"). Admin accounts are created with `php artisan admin:create`.
