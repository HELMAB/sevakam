# Project Requirements — Sevakam

Status: **Draft v0.1** (2026-11-19)
Source: `docs/spec/Home Service Mobile.xlsx` + clarification session with the product owner.

| # | Document | Contents |
| - | -------- | -------- |
| 1 | [Overview](01-overview.md) | Goal, users & roles, scope, system components, tech stack, glossary |
| 2 | [Job lifecycle](02-job-lifecycle.md) | Job statuses, transitions, timeouts, cancellation |
| 3 | [Business rules](03-business-rules.md) | Pricing, promotions, payment, loyalty points, ranking, approval |
| 4 | [Customer app](04-customer-app.md) | Functional requirements for `app/customer_app` |
| 5 | [Technician app](05-technician-app.md) | Functional requirements for `app/technician_app` |
| 6 | [Admin dashboard](06-admin-dashboard.md) | Functional requirements for `admin/` |
| 7 | [Non-functional](07-non-functional.md) | Notifications, realtime, security, i18n, performance |
| 8 | [Open questions](08-open-questions.md) | Decisions still pending and assumptions to confirm |

## Requirement IDs

Each requirement has a stable ID so it can be referenced from tickets, commits and tests:

| Prefix | Area |
| ------ | ---- |
| `JOB-` | Job lifecycle |
| `BR-`  | Business rules |
| `CUS-` | Customer app |
| `TEC-` | Technician app |
| `ADM-` | Admin dashboard |
| `NFR-` | Non-functional |

Priority: **M** = must have for v1, **S** = should have, **C** = could have / later.
Items marked *(assumption)* were not explicitly decided and need confirmation — they are also listed in [Open questions](08-open-questions.md).
