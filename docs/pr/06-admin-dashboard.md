# 6. Admin dashboard (`admin/`)

Not estimated in the original spec.

## 6.1 Access

| ID | Requirement | Pri |
| -- | ----------- | --- |
| ADM-01 | Admin login with email + password. | M |
| ADM-02 | Multiple admin accounts; roles/permissions (e.g. super admin, operator) *(assumption — single role acceptable for v1)*. | S |

## 6.2 Technician & company approval

| ID | Requirement | Pri |
| -- | ----------- | --- |
| ADM-10 | Queue of pending freelancer and company registrations. | M |
| ADM-11 | Review profile and documents (certificate, patent, company profile); approve or reject with reason. Applicant is notified. | M |
| ADM-12 | Suspend / reactivate any technician, company or customer account. | M |

## 6.3 Services & prices

| ID | Requirement | Pri |
| -- | ----------- | --- |
| ADM-20 | CRUD main services (name, icon/image, order, active). | M |
| ADM-21 | CRUD subservices (main service, name, description, base price, unit, active). | M |
| ADM-22 | Manage reason lists: job rejection reasons, low-rating reasons. | M |

## 6.4 Promotions

| ID | Requirement | Pri |
| -- | ----------- | --- |
| ADM-30 | Review pending promotions; approve (triggers customer push) or reject with reason. | M |
| ADM-31 | List and deactivate any promotion. | M |

## 6.5 Users & jobs overview

| ID | Requirement | Pri |
| -- | ----------- | --- |
| ADM-40 | Search/list customers, technicians, companies with detail pages (profile, jobs, ratings, points). | M |
| ADM-41 | Search/list jobs with filters (status, date, service, technician, company, payment method). | M |
| ADM-42 | Job detail with full timeline (JOB-12), proposals, payment and rating. | M |
| ADM-43 | Intervene on a job: cancel, reassign, mark paid/refunded, with mandatory note *(assumption on allowed actions)*. | S |
| ADM-44 | Moderate ratings (hide inappropriate reviews/images). | S |

## 6.6 Settings & content

| ID | Requirement | Pri |
| -- | ----------- | --- |
| ADM-50 | Configure: response timeout (default 15 min), cancellation cutoff (2 h), appointment alert lead time, point earn/redeem rates and max redeem per job. | M |
| ADM-51 | Edit terms & conditions content (customer and technician). | M |
| ADM-52 | Manually adjust user points with reason (BR-64). | S |

## 6.7 Reports & settlements

| ID | Requirement | Pri |
| -- | ----------- | --- |
| ADM-60 | Dashboard: jobs by status, completed jobs, revenue (cash vs PayWay), new users, over a date range. | M |
| ADM-61 | Settlement report: PayWay amounts collected per freelancer/company, settled vs outstanding. | M |
| ADM-62 | Record a settlement (amount, date, reference, note) against a freelancer/company. | M |
| ADM-63 | Export reports to CSV/Excel. | S |
