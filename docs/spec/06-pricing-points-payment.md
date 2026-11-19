# 6. Pricing, points, payment & ranking

## 6.1 Price calculation (`PricingService`)

For a job with items *i* targeting provider *P* at time *t*:

```
promo        = active promotion of P at t that covers subservice_i (best discount if several)
disc_i       = promo ? promo.discount_percent(subservice_i) : 0
line_total_i = round(base_price_i × quantity_i × (1 − disc_i/100), 2)
estimated_total = Σ line_total_i
```

- The base price and discount are **snapshotted** into `job_items` at booking (or on reassignment, T14).
- **Price proposal (T7):** the technician sees `estimated_total` (already discounted) and proposes `proposed_total`. If the customer accepts, `agreed_total = proposed_total` — the proposal **replaces** the promotional estimate and no further promotion discount is applied.
- Otherwise `agreed_total = estimated_total`.
- KHR display: `round(usd × khr_per_usd / 100) × 100`.

## 6.2 Payment

### Flow

```
job completed (T17)
   └─► customer opens Pay screen: shows agreed_total, points balance, max redeemable
        POST /customer/jobs/{id}/payments { method, points }
          ├─ validates points ≤ balance and points_discount ≤ agreed_total × max_redeem_percent
          ├─ holds the points (redeem transaction, FIFO lots) and sets points_discount, final_total
          ├─ creates payment(status=pending, amount=final_total)
          │
          ├─ method=cash ──► technician sees "Confirm cash received $X"
          │                   POST /technician/jobs/{id}/confirm-cash ─► payment success ─► T18
          │
          └─ method=payway ─► API calls PayWay purchase (tran_id = payment id + suffix)
                               returns checkout_url / abapay_deeplink / qr_string
                               app opens ABA Mobile (deeplink) or a WebView checkout
                               PayWay ─► POST /webhooks/payway (pushback)
                                         verify hash → check-transaction API → status APPROVED
                                         ─► payment success ─► T18
                               app listens for payment.updated (or polls GET /customer/payments/{id})
```

- **Switching method or retrying:** while a payment is `pending`/`failed`, the customer may start a new one. The previous pending payment is cancelled and its held points are returned and re-held for the new payment.
- If `final_total = 0` (fully covered by points), the payment succeeds immediately.
- A PayWay payment that stays unconfirmed for 30 min is checked via check-transaction, then marked `failed` if not approved.
- Refunds (BR-54) are manual: admin marks the payment `refunded` (ADM-43) after refunding outside the system; the customer's points earned for the job are reversed with an `adjust` transaction.
- **Settlement (BR-53):** outstanding = Σ successful PayWay payments with `settlement_id IS NULL`, grouped by the job's provider. Admin records a settlement, which links those payments.

## 6.3 Points (`PointsService`)

| Event | Who | Points |
| ----- | --- | ------ |
| Job paid (T18) | customer | `floor(final_total × points_earn_per_usd)` — on the amount actually paid, excluding the points discount |
| Job paid (T18) | technician who did the job | `technician_points_per_job` |
| Redeem at payment | customer | −points; discount = `points / points_redeem_per_usd` USD |
| Reward request | technician | −`reward.points_cost` (`reward_hold`) |
| Reward rejected | technician | +held points (`reward_refund`, a new lot with a fresh 12-month expiry) |
| Admin adjustment | any | ± with a note |
| Expiry | any | −remaining of lots past `expires_at` |

Rules:
- Every positive transaction creates a **lot** with `remaining = points` and `expires_at = now + 12 months`.
- Spending (redeem / reward_hold / negative adjust) consumes lots ordered by `expires_at ASC` (oldest first) and decrements `remaining`. It fails if the balance is insufficient.
- All changes run in one DB transaction with `SELECT … FOR UPDATE` on the user; `users.points_balance` is kept in sync.
- Payment cancelled or failed → the held redeem points are returned to their original lots (`remaining` restored; expired lots are returned as already expired).

### Rewards (technicians)
- Admin manages a catalog (`name`, `image`, `points_cost`, `stock`).
- A technician request creates `reward_redemptions(status=requested)`, holds the points and decrements stock.
- Admin **approves** → hands the reward over offline → **fulfils**; or **rejects** → points refunded, stock restored.

## 6.4 Ranking (`RankingService`)

For each technician and each company (company = all jobs and ratings of its members, plus company-level assignments the owner answered):

```
m  = global average stars (all visible ratings)
C  = settings.ranking_prior_count            (10)
n  = rating_count,  S = sum of stars
bayes = (C × m + S) / (C + n)                         # 1..5

offers_90d  = assignments in last 90 days with counts_for_ranking = true
accepts_90d = those with status in (accepted, price_proposed, time_proposed, assigned)
acceptance  = offers_90d = 0 ? 1 : accepts_90d / offers_90d

rank_score = bayes × (w_r + w_a × acceptance)         # w_r = 0.7, w_a = 0.3 (settings)
```

- Expired and rejected assignments count against acceptance; `customer_declined` counts as accepted (the technician did respond).
- Updated incrementally on rating creation and assignment response (queued), and fully recalculated nightly.
- **Top companies** (CUS-21): eligible companies (§3.4 rules 5–6 when an address and subservices are given) ordered by `rank_score DESC`, ties broken by `completed_jobs_count`.
- **Top 5 technicians** (CUS-34): eligible technicians (freelancers + company members, online, covering the address, offering all subservices, open at `appointment_at`) ordered by `rank_score DESC`.
- **Nearby map** (CUS-35): same eligibility, ordered by distance. A technician's position on the map is their provider's base location (company location for members); the live location is never exposed in search.

## 6.5 Provider search query (sketch)

```sql
-- freelancers
SELECT tp.*, ST_Distance(tp.location, :point) AS distance_m
FROM technician_profiles tp
JOIN users u ON u.id = tp.user_id AND u.status = 'active'
WHERE tp.type = 'freelancer' AND tp.approval_status = 'approved'
  AND tp.is_active AND tp.is_online
  AND ST_DWithin(tp.location, :point, tp.service_radius_km * 1000)
  AND (SELECT count(*) FROM provider_subservices ps
       WHERE ps.provider_type = 'technician' AND ps.provider_id = tp.user_id
         AND ps.subservice_id = ANY(:subservice_ids)) = :n_subservices
  AND EXISTS (SELECT 1 FROM working_hours wh
       WHERE wh.provider_type = 'technician' AND wh.provider_id = tp.user_id
         AND wh.weekday = :dow AND :local_time BETWEEN wh.opens_at AND wh.closes_at)
UNION ALL
-- company members: same filters, using the company's location/radius/offerings/hours
…
```
