# Tasks — 6. Pricing, points, payment & ranking

Spec: [`docs/spec/06-pricing-points-payment.md`](../spec/06-pricing-points-payment.md)

---

### BIZ-01 · PricingService
**Milestone:** M2 · **Component:** API · **Depends on:** DATA-04, DATA-05 · **Refs:** spec 06 §6.1
- [ ] `estimate(service, items, provider, at)` → line items (unit_price, discount_percent, line_total) + estimated_total + promotion
- [ ] Choose the best active promotion per subservice for the provider at that time
- [ ] Rounding to 2 decimals per line (use `brick/math` or bcmath, never floats)
- [ ] `khr(usd)` helper (rounded to 100 riel) — mirrored in the apps' `Price` widget
- [ ] Unit tests: no promotion, partial promotion, two overlapping promotions, rounding

**Acceptance criteria**
- 2 × $15.00 with a 10% promotion + 1 × $15.00 without = $42.00 (example in spec 04 §4.9)

---

### BIZ-02 · ABA PayWay client
**Milestone:** M4 · **Component:** API · **Depends on:** ARCH-06 · **Refs:** spec 06 §6.2
- [ ] `PayWayClient::purchase(payment)` → checkout URL / ABA deeplink / QR string (build the hash per PayWay docs)
- [ ] `PayWayClient::checkTransaction(tranId)`
- [ ] `PayWayClient::verifyPushback(payload)` hash verification
- [ ] Sandbox config; record raw requests and responses (redacted) in `payway_payload`
- [ ] Tests with `Http::fake` fixtures

**Acceptance criteria**
- A purchase works against the PayWay sandbox from a local tinker session (manual check)

---

### BIZ-03 · PaymentService (cash + PayWay flow)
**Milestone:** M4 · **Component:** API · **Depends on:** BIZ-02, BIZ-04, FLOW-08 · **Refs:** spec 06 §6.2, BR-50..54
- [ ] `startPayment(job, method, points)`: only `completed` jobs; validate points (≤ balance, ≤ max % of agreed_total); cancel a previous pending payment and return its points; hold points; compute `points_discount` and `final_total`; create the payment
- [ ] `final_total = 0` → immediate success
- [ ] Cash: pending until `confirmCash(job, technician)` → `MarkJobPaid`
- [ ] PayWay: call purchase, return checkout data; webhook → success
- [ ] `payments:reconcile` every 5 min: pending PayWay payments older than 30 min → check-transaction → success or failed (return points)
- [ ] Admin `markPaid` and `refund` (reverses earned points with `adjust`)
- [ ] Outstanding settlement query grouped by provider

**Acceptance criteria**
- Switching from PayWay to cash returns and re-holds points correctly; the balance is never negative

---

### BIZ-04 · PointsService (ledger, FIFO, expiry)
**Milestone:** M4 · **Component:** API · **Depends on:** DATA-09 · **Refs:** spec 06 §6.3, BR-60..65
- [ ] `credit(user, points, type, refs)` → creates a lot with `remaining` and `expires_at = +12 months`
- [ ] `debit(user, points, type, refs)` → consumes lots ordered by `expires_at`, locks the user row, fails if insufficient
- [ ] `returnHold(transaction)` → restores consumed lots (expired lots stay expired)
- [ ] `earnForJob(job)` (customer by amount paid, technician fixed per job)
- [ ] `points:expire` daily command
- [ ] Keep `users.points_balance` in sync; a `points:verify` command recomputes and reports drift
- [ ] Unit tests: FIFO across lots, partial lot consumption, expiry, concurrent debits

**Acceptance criteria**
- Two concurrent debits that together exceed the balance: one succeeds, one fails

---

### BIZ-05 · Rewards redemption
**Milestone:** M5 · **Component:** API · **Depends on:** BIZ-04, DATA-09 · **Refs:** spec 06 §6.3 Rewards
- [ ] `RedeemReward`: active reward, in stock, enough points → hold points, decrement stock, status `requested`
- [ ] `ApproveRedemption`, `RejectRedemption` (refund points + restore stock), `FulfilRedemption`
- [ ] Notifications to the technician on every change

**Acceptance criteria**
- Rejecting a redemption restores both the points and the stock

---

### BIZ-06 · Provider search (PostGIS)
**Milestone:** M2 · **Component:** API · **Depends on:** DATA-03, DATA-04 · **Refs:** spec 06 §6.4, §6.5
- [ ] `ProviderSearch` query builder: freelancers + company members (using the company's location, radius, offerings and hours) with all eligibility filters
- [ ] Modes: `companies` (grouped by company), `technicians`, `nearby` (ordered by distance)
- [ ] Sort by `rank_score` or distance; limit; include `distance_m`
- [ ] Working-hours check in Asia/Phnom_Penh time for the requested `appointment_at`
- [ ] GiST indexes verified with `EXPLAIN`
- [ ] Feature tests with seeded providers at known distances

**Acceptance criteria**
- Search over 1,000 seeded providers returns in < 1 s locally (NFR-31)

---

### BIZ-07 · RankingService
**Milestone:** M4 (stats counters in M2) · **Component:** API · **Depends on:** DATA-07, FLOW-05 · **Refs:** spec 06 §6.4, BR-30, BR-31
- [ ] Bayesian average with the global mean `m` and prior `C` from settings
- [ ] Acceptance rate over 90 days (`counts_for_ranking`, statuses counted as accepted)
- [ ] `rank_score = bayes × (w_r + w_a × acceptance)` for technicians and companies
- [ ] Incremental update jobs on rating create/hide and assignment response; nightly `ranking:recalculate`
- [ ] Unit tests with hand-calculated examples

**Acceptance criteria**
- A technician with 3 × 5★ and a technician with 50 × 4.8★: the second ranks higher with C = 10

---

### BIZ-08 · Dashboard & report aggregates
**Milestone:** M6 · **Component:** API · **Depends on:** BIZ-03 · **Refs:** ADM-60, 63
- [ ] Queries: jobs by status, completed, cancelled, revenue cash vs PayWay, new customers/technicians, daily series for a date range
- [ ] CSV export builders (jobs, payments, settlements) streamed with `LazyCollection`

**Acceptance criteria**
- Dashboard numbers match a manual SQL check on seeded data
