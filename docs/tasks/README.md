# Tasks — Sevakam

Status: **Draft v0.1** (2026-11-19) · Derived from [`docs/spec`](../spec/README.md) · Planned for a **solo developer** (one sequential path, no estimates).

## Files (one per spec document)

| File | Spec | Prefix | Tasks |
| ---- | ---- | ------ | ----- |
| [01-architecture.md](01-architecture.md) | Architecture | `ARCH-` | 10 |
| [02-data-model.md](02-data-model.md) | Data model | `DATA-` | 11 |
| [03-job-state-machine.md](03-job-state-machine.md) | Job state machine | `FLOW-` | 11 |
| [04-api.md](04-api.md) | API | `API-` | 21 |
| [05-realtime-notifications.md](05-realtime-notifications.md) | Realtime & notifications | `RT-` | 7 |
| [06-pricing-points-payment.md](06-pricing-points-payment.md) | Pricing, points, payment & ranking | `BIZ-` | 8 |
| [07-customer-app.md](07-customer-app.md) | Customer app | `CAPP-` | 17 |
| [08-technician-app.md](08-technician-app.md) | Technician app | `TAPP-` | 17 |
| [09-admin-dashboard.md](09-admin-dashboard.md) | Admin dashboard | `ADMN-` | 12 |
| [10-testing-delivery.md](10-testing-delivery.md) | Testing & delivery | `QA-`, `DEL-` | 11 |
| | | **Total** | **125** |

Task prefixes are deliberately different from the requirement IDs (`CUS-`, `TEC-`, `ADM-`, …) used in `docs/pr`.

## Task format

```
### <ID> · <Title>
**Milestone:** M0–M7 · **Component:** API | Customer app | Technician app | Admin | Ops · **Depends on:** <task IDs> · **Refs:** <spec section / requirement IDs>
- [ ] subtask checklist
**Acceptance criteria**
- verifiable outcomes
```

Tick the subtask checkboxes as you go; a task is done when every acceptance criterion is met and its tests pass.

## Working order (solo path by milestone)

Within a milestone, work top to bottom. Each milestone ends with something usable end to end.

### M0 — Foundation
`DEL-05` (decide O7 `jobs` vs `bookings` first) → `ARCH-01` → `ARCH-02` → `ARCH-05` → `DATA-01` → `DATA-02` → `DATA-10` → `QA-01` → `API-01` → `API-04` → `API-02` → `API-05` → `ARCH-04` → `ARCH-03` → `ARCH-06` → `ARCH-07` → `QA-02` → `CAPP-01` → `CAPP-02` → `CAPP-03` → `ARCH-08` → `TAPP-01` → `ARCH-09` → `QA-03` → `ADMN-01` → `ADMN-02` → `ARCH-10` → `QA-04`

**Demo:** register and log in on the customer app, technician app and admin.

### M1 — Catalog & onboarding
`DATA-03` → `DATA-04` → `DATA-11` → `API-07` → `API-18` → `ADMN-03` → `ADMN-05` → `API-03` → `API-12` → `API-15` (employees) → `API-17` (approvals) → `ADMN-04` → `API-08` → `CAPP-05` → `CAPP-06` → `TAPP-02` → `TAPP-03` → `TAPP-05` → `TAPP-06` → `TAPP-07` → `TAPP-14` (management screens)

**Demo:** a technician/company registers → admin approves → they set hours, area and services; the customer manages addresses.

### M2 — Booking core
`DATA-06` → `FLOW-01` → `BIZ-01` → `BIZ-06` → `FLOW-02` → `FLOW-03` → `FLOW-04` → `FLOW-05` → `FLOW-06` → `FLOW-07` → `FLOW-08` → `FLOW-10` → `FLOW-11` (expiry, auto-cancel) → `API-09` → `API-10` → `API-14` → `API-15` (jobs) → `CAPP-07` → `CAPP-08` → `CAPP-09` → `CAPP-10` → `CAPP-11` → `CAPP-12` → `TAPP-10` → `TAPP-13`

**Demo:** full booking flow from booking to `completed`, using pull-to-refresh (no realtime yet).

### M3 — Realtime & notifications
`RT-01` → `RT-02` → `RT-03` → `RT-04` → `API-13` → `FLOW-11` (appointment alerts) → `RT-05` → `RT-06` → `TAPP-08` → `TAPP-09` → `TAPP-11` → `RT-07` → `TAPP-12` → `CAPP-17` → `TAPP-17` → `TAPP-14` (history screens)

**Demo:** the incoming-job popup rings, statuses update live, the customer follows the technician on the map.

### M4 — Payment, points, ratings, ranking
`DATA-07` → `DATA-08` → `DATA-09` → `BIZ-04` → `BIZ-02` → `BIZ-03` → `FLOW-09` → `API-21` → `API-11` → `BIZ-07` → `CAPP-13` → `CAPP-14` → `CAPP-15` → `TAPP-16` (points) → `DEL-01` (staging, so PayWay pushbacks can reach the API; or use a tunnel locally)

**Demo:** pay by cash and ABA PayWay sandbox, earn and redeem points, rate the technician; ranking changes.

### M5 — Promotions & rewards
`DATA-05` → `BIZ-05` → `API-16` → `API-19` (promotions, rewards) → `ADMN-08` → `ADMN-10` → `TAPP-15` → `CAPP-16` → `CAPP-09` (promotion entry) → `TAPP-16` (rewards)

**Demo:** a provider creates a promotion → admin approves → customers get a push and book at the discounted price; a technician redeems a reward.

### M6 — Admin operations & reports
`BIZ-08` → `API-17` (users, dashboard) → `API-19` (jobs, ratings) → `API-20` → `ADMN-06` → `ADMN-07` → `ADMN-09` → `ADMN-11` → `ADMN-12` → `QA-05`

**Demo:** admin monitors and intervenes on jobs, moderates ratings, records settlements, exports reports.

### M7 — Hardening & release
`API-06` → `CAPP-04` → `TAPP-04` → `QA-06` → `DEL-01` (production) → `DEL-02` → `DEL-03` → `DEL-04`

**Demo:** apps in TestFlight / Play internal testing against production-like infrastructure.

## Notes

- Some tasks span two milestones (e.g. `API-15`, `API-17`, `API-19`, `FLOW-11`, `TAPP-14`, `TAPP-16`, `CAPP-09`); the part done in each milestone is noted in the working order.
- `(xlsx: N)` in the mobile task files is the original spreadsheet estimate, for reference only.
- When a decision changes, update `docs/spec` first, then adjust the affected tasks here.
