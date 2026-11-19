# Tasks — 9. Admin dashboard

Spec: [`docs/spec/09-admin-dashboard.md`](../spec/09-admin-dashboard.md) · Component: `admin/`

Each page task includes: typed API functions, page component(s), table/form components, loading/empty/error states, toasts, and Vitest tests for stores/composables.

---

### ADMN-01 · Shared building blocks
**Milestone:** M0 · **Depends on:** ARCH-09 · **Refs:** spec 09 §9.1
- [ ] `DataTable` (TanStack, server pagination/sort/filter synced with the URL query)
- [ ] `usePaginatedQuery`, `useMutation` composables (loading, error, 422 mapping)
- [ ] `StatusBadge`, `ConfirmDialog` (with optional required note/reason), `ImageUpload`, `MoneyInput`, `DateRangePicker`, `JobTimeline`
- [ ] Shared TypeScript types for API resources

**Acceptance criteria**
- A sample list page with filters keeps its state on browser refresh

---

### ADMN-02 · Login & auth store
**Milestone:** M0 · **Depends on:** ADMN-01, API-04 · **Refs:** ADM-01
- [ ] Login page; Pinia auth store (token, me); router guard; logout
- [ ] Persist the token (localStorage with try/catch); 401 → login

**Acceptance criteria**
- A non-admin account gets the "wrong app" message

---

### ADMN-03 · Services & subservices
**Milestone:** M1 · **Depends on:** ADMN-01, API-18 · **Refs:** ADM-20, ADM-21
- [ ] Services list: icon, name, active toggle, drag-and-drop reorder, create/edit dialog with icon upload
- [ ] Subservices page per service: name, unit select, base price, active, sort; create/edit/delete

**Acceptance criteria**
- Reordering services changes the order in the customer app

---

### ADMN-04 · Registration approvals
**Milestone:** M1 · **Depends on:** ADMN-01, API-17 · **Refs:** ADM-10, ADM-11
- [ ] Pending list (type, name, company, submitted at); sidebar badge with a live count (Echo `private-admin`)
- [ ] Detail: personal/company info, phones, map location + radius, document previews (images inline, PDFs in a new tab via signed URL)
- [ ] Approve; Reject with a required reason (pick from `registration_reject` reasons + note)

**Acceptance criteria**
- An approved applicant disappears from the queue and receives the push

---

### ADMN-05 · Reasons, settings, terms pages
**Milestone:** M1 · **Depends on:** ADMN-01, API-18 · **Refs:** ADM-22, ADM-50, ADM-51
- [ ] Reasons: tabs per type, CRUD, reorder, active toggle
- [ ] Settings: grouped forms (Jobs, Points, Ranking, Currency, Uploads) with validation and help text
- [ ] Terms editor (customer/technician) with a rich-text editor (e.g. Tiptap) and preview

**Acceptance criteria**
- Changing `response_timeout_minutes` affects newly created assignments

---

### ADMN-06 · Users: customers, technicians, companies
**Milestone:** M6 · **Depends on:** ADMN-01, API-17 · **Refs:** ADM-12, ADM-40, ADM-52
- [ ] Customers list/search + detail tabs (profile, addresses, jobs, points, ratings given)
- [ ] Technicians list (type, company, approval, online, rating, rank) + detail tabs (profile, documents, jobs, ratings, acceptance stats, online sessions, points, redemptions)
- [ ] Companies list + detail (employees, offerings, hours, service area map)
- [ ] Actions: suspend/reactivate (note), adjust points (± with reason)

**Acceptance criteria**
- A suspended user is immediately logged out of the mobile app

---

### ADMN-07 · Jobs
**Milestone:** M6 · **Depends on:** ADMN-01, API-19 · **Refs:** ADM-41..43
- [ ] Jobs list with filters (status, date range, service, provider, technician, payment method, code search)
- [ ] Job detail: summary, items & prices, photos (lightbox), assignments history table, status timeline, payments, rating
- [ ] Actions with a required note: Cancel, Reassign (provider picker), Mark paid, Refund

**Acceptance criteria**
- Every admin action appears in the job timeline with the admin's name and note

---

### ADMN-08 · Promotions moderation
**Milestone:** M5 · **Depends on:** ADMN-01, API-19 · **Refs:** ADM-30, ADM-31
- [ ] Tabs: Pending · Active · Scheduled · Ended · Rejected; sidebar badge for pending
- [ ] Detail: image, provider, period, items with base vs discounted price
- [ ] Approve, Reject (reason), Deactivate

**Acceptance criteria**
- Approving a promotion that has already started sends the customer push right away

---

### ADMN-09 · Ratings moderation
**Milestone:** M6 · **Depends on:** ADMN-01, API-19 · **Refs:** ADM-44
- [ ] Ratings list (stars filter, technician, date), photo previews, Hide/Unhide

**Acceptance criteria**
- A hidden rating disappears from the technician profile in the customer app

---

### ADMN-10 · Rewards & redemptions
**Milestone:** M5 · **Depends on:** ADMN-01, API-19 · **Refs:** BR-62
- [ ] Rewards catalog CRUD (image, cost, stock, active)
- [ ] Redemptions queue: Approve / Reject (reason) / Fulfil; sidebar badge

**Acceptance criteria**
- The redemption status flow requested → approved → fulfilled works, and rejected refunds the points

---

### ADMN-11 · Dashboard
**Milestone:** M6 · **Depends on:** ADMN-01, BIZ-08 · **Refs:** ADM-60
- [ ] KPI cards (jobs today, completed, cancelled, revenue cash vs PayWay, new customers/technicians)
- [ ] Jobs-by-status chart and daily trend chart; date-range picker

**Acceptance criteria**
- Numbers match the API aggregates for the selected range

---

### ADMN-12 · Settlements & reports
**Milestone:** M6 · **Depends on:** ADMN-01, API-20 · **Refs:** ADM-61..63
- [ ] Outstanding per provider (amount, payment count) → "Record settlement" dialog selecting payments, reference, date, note
- [ ] Settlement history with linked payments
- [ ] Reports page: CSV export buttons with a date range

**Acceptance criteria**
- After recording a settlement, the provider's outstanding amount drops by exactly that amount
