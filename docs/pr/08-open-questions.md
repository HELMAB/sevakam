# 8. Open questions & assumptions

## 8.1 Decisions made (clarification session, 2026-11-19)

| Topic | Decision |
| ----- | -------- |
| Payment | Cash **and** ABA PayWay, chosen per job, paid **after completion**. No commission; PayWay funds settled manually by admin. |
| Pricing | Admin sets a **platform-wide base price** per subservice; technician can propose a different price. |
| Score | **Loyalty points**: earned on completed jobs, redeemable as a discount. Technicians earn points too. |
| Languages | **English only** for now; i18n-ready. |
| Technician accounts | **Freelancer** or **company** (owner creates employee accounts). |
| Booking a company | **Company owner assigns** an employee. |
| Booking a technician | Customer can directly pick freelancers **and** company employees (top 5 / map). |
| Response timeout | **15 minutes**, then customer can cancel or re-assign. |
| Approval | **Admin approves** all freelancers and companies; employees active immediately. |
| Cancellation | Customer can cancel until **2 hours before** appointment; blocked after. |
| Job statuses | Includes **on the way** and **in progress**. |
| Price rejected | Customer **picks another technician** (or cancels). |
| Ranking | **Average rating weighted by completed job count**. |
| Infra | **FCM + Laravel Reverb + Google Maps**. |
| Multiple subservices | Yes, within the **same main service**. |
| Promotions | Visible to **all customers**, require **admin approval**. |
| Offerings | Technicians/companies choose **subservices + service radius**. |
| Admin v1 scope | Approvals, services & prices, users & jobs overview, settings & reports. |

## 8.1a Resolved in the spec session (2026-11-19)

All assumptions A1–A13 below were **accepted**, except: A5 → USD stored **+ KHR display**. Open questions resolved:

| # | Resolution |
| - | ---------- |
| Q1 | Proposed price **replaces** the promotional price. |
| Q2 | Technicians redeem points for **rewards** (admin catalog, manual fulfilment). |
| Q3 | Points **expire after 12 months** (oldest spent first). |
| Q4 | No point penalty; acceptance rate (90 days) **lowers ranking**. |
| Q5 | Owner has **15 min** to assign; the employee then has a separate 15 min. |
| Q6/Q7 | **Scheduled only**, ≥ 1 h ahead, **within working hours**. |
| Q8 | **Yes** — live technician location while on the way. |
| Q9 | **Email verification code** only, no SMS OTP. |
| Q10, Q11 | Still open — see `docs/spec/10-testing-delivery.md` §10.4. |

## 8.2 Assumptions to confirm (all accepted — see 8.1a)

| # | Assumption | Ref |
| - | ---------- | --- |
| A1 | Spec "Duration" values are hours. | 04, 05 |
| A2 | Company owner may also perform jobs and go online. | 01, TEC-20 |
| A3 | Company employees inherit the company's offered subservices and service area. | BR-10 |
| A4 | Company rating = aggregate of employees' ratings. | BR-31 |
| A5 | Currency is USD. | BR-04 |
| A6 | Subservice units (per unit / hour / m²). | BR-01 |
| A7 | Appointment alert default 1 hour before. | JOB-11 |
| A8 | Technician cannot cancel a confirmed job in-app. | JOB-10 |
| A9 | Promotions have start/end dates. | BR-40 |
| A10 | Max 5 photo attachments per job. | CUS-33 |
| A11 | Refunds handled manually by admin. | BR-54 |
| A12 | No in-app chat in v1. | 01 |
| A13 | Rejected registrations can be resubmitted. | BR-21 |

## 8.3 Open questions

| # | Question |
| - | -------- |
| Q1 | When a technician proposes a price on a promoted job, does the promotion % still apply on top of the proposed price? |
| Q2 | Can technicians redeem their points, and for what? |
| Q3 | Do points expire? |
| Q4 | Does a late/no-show by the technician or repeated rejections have any penalty (points, ranking, suspension)? |
| Q5 | How long does the company owner have to assign an employee — same 15-minute timeout? |
| Q6 | Can a customer book a job for "as soon as possible", or only a scheduled date/time? Minimum lead time? |
| Q7 | Must the appointment fall within the technician's working hours? |
| Q8 | Should the customer see the technician's live location while `on_the_way`? |
| Q9 | Phone verification (OTP) required at registration? |
| Q10 | Minimum supported iOS/Android versions. |
| Q11 | Target launch date and release phasing (MVP vs. later features). |
