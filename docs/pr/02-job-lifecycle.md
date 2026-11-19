# 2. Job lifecycle

## 2.1 Statuses

| Status | Meaning | Waiting on |
| ------ | ------- | ---------- |
| `pending_assignment` | Customer booked a **company**; owner must assign an employee. | Company owner |
| `pending` | Sent to a specific technician; awaiting response. | Technician |
| `price_proposed` | Technician accepted with an adjusted price. | Customer |
| `time_proposed` | Technician rejected the appointment time and proposed a new one. | Customer |
| `confirmed` | Price and time agreed. | Appointment date |
| `on_the_way` | Technician is travelling to the customer. | Technician |
| `in_progress` | Work has started. | Technician |
| `completed` | Technician marked the job complete; payment due. | Customer (payment) |
| `paid` | Payment recorded (cash confirmed or PayWay success). | Customer (rating, optional) |
| `cancelled` | Cancelled by the customer (or system/admin). | — |
| `expired` | No response within the timeout; customer must re-assign or cancel. | Customer |

A rejected job (technician rejects with reason, or customer rejects a price/time proposal) returns to the customer as **needs new technician** — the job keeps its details, and the customer selects another technician (or cancels). The full history of assignments, proposals and reasons is kept.

## 2.2 Main flow

```
Customer books ──► (company) pending_assignment ──owner assigns──► pending
               └─► (technician) ─────────────────────────────────► pending

pending ──accept at base price──────────────► confirmed
        ──accept + adjust price─────────────► price_proposed ──customer accepts──► confirmed
        ──propose new time──────────────────► time_proposed  ──customer approves─► confirmed
        ──reject + reason───────────────────► needs new technician
        ──15 min no response────────────────► expired

price_proposed / time_proposed ──customer rejects──► needs new technician

confirmed ──► on_the_way ──► in_progress ──► completed ──► paid ──► (rated)
```

## 2.3 Requirements

| ID | Requirement | Pri |
| -- | ----------- | --- |
| JOB-01 | A job belongs to one customer, one address, one main service, and has one or more subservices (each with quantity) from that main service. | M |
| JOB-02 | When a customer books a company, the job goes to the company owner (`pending_assignment`), who assigns one of the company's employees. | M |
| JOB-03 | When a customer books a specific technician (freelancer or company employee), the job goes directly to that technician; for employees, the company owner can also see it. | M |
| JOB-04 | The technician (or owner, for `pending_assignment`) must respond within **15 minutes**; otherwise the job becomes `expired` and the customer is notified to pick another technician or cancel. The owner's 15 min and the assigned employee's 15 min are separate windows. The timeout is admin-configurable. | M |
| JOB-04a | Appointments are scheduled only (no "ASAP"): at least **1 hour** ahead and inside the provider's working hours. A proposed new time must follow the same rules. | M |
| JOB-05 | The technician can: accept at the current price; accept with an adjusted price (→ `price_proposed`); propose a new appointment time (→ `time_proposed`); or reject with a reason chosen from a list or free text. | M |
| JOB-06 | The customer accepts or rejects a price proposal. On reject, the customer selects another technician (keeping job details) or cancels. | M |
| JOB-07 | The customer approves or rejects a time proposal. On reject, the customer selects another technician and may set a new appointment time. | M |
| JOB-08 | The technician progresses a confirmed job through `on_the_way` → `in_progress` → `completed`. The customer sees each status change in realtime. | M |
| JOB-09 | The customer can cancel a job any time before acceptance, and after acceptance until **2 hours before** the appointment. After that the cancel action is disabled. | M |
| JOB-10 | A technician cannot cancel a confirmed job in-app *(assumption — contact support/admin)*. | S |
| JOB-11 | The technician receives an alert screen + push notification before each appointment (default **1 hour** before, admin-configurable) *(assumption on default)*. | M |
| JOB-12 | Every status change is recorded with actor, timestamp and reason (audit trail) and visible to admin. | M |
| JOB-13 | The final price is: Σ(subservice base price × quantity) − promotion discount, or the accepted price proposal (which **replaces** the promotional price); then − redeemed points discount (chosen at payment). | M |
| JOB-14 | While the job is `on_the_way`, the customer sees the technician's **live location** on a map. | M |

> Technical design: the statuses `expired` and "needs new technician" are implemented as a single `needs_reassignment` status — see `docs/spec/03-job-state-machine.md`.
