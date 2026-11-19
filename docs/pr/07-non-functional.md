# 7. Non-functional requirements

## 7.1 Notifications & realtime

| ID | Requirement | Pri |
| -- | ----------- | --- |
| NFR-01 | Push notifications via **FCM** for: new job, job status changes, proposals, expiry, appointment alert, promotion published, registration approved/rejected, payment received. | M |
| NFR-02 | In-app realtime updates via **Laravel Reverb** (private channels per user/job) for incoming job popup and live job status. | M |
| NFR-03 | Each user can have multiple device tokens; tokens are removed on logout. | M |
| NFR-04 | Notifications are stored and listable in-app *(assumption — notification inbox)*. | S |

## 7.2 Security

| ID | Requirement | Pri |
| -- | ----------- | --- |
| NFR-10 | API authentication via Laravel Sanctum tokens for mobile apps; session/token auth for admin. | M |
| NFR-11 | Role-based authorization on every endpoint (customer, freelancer, owner, employee, admin); owners only access their own company's data. | M |
| NFR-12 | Passwords hashed; rate limiting on login, register, forgot password. | M |
| NFR-13 | ABA PayWay callbacks verified by signature/hash server-side; never trust client payment status. | M |
| NFR-14 | Uploaded files (photos, documents) validated by type/size; documents are private (signed URLs). | M |
| NFR-15 | Personal data (phone, address, location) visible to a technician only for jobs assigned to them. | M |

## 7.3 Internationalization

| ID | Requirement | Pri |
| -- | ----------- | --- |
| NFR-20 | All user-facing strings in apps, admin and API messages go through i18n resources; English only in v1. | M |
| NFR-21 | Dates/times stored in UTC, displayed in the device timezone (Asia/Phnom_Penh by default) *(assumption)*. | M |

## 7.4 Performance & reliability

| ID | Requirement | Pri |
| -- | ----------- | --- |
| NFR-30 | Timeouts (15-min response, appointment alerts) run via queued/scheduled jobs and are accurate to ±1 minute. | M |
| NFR-31 | Nearby technician search uses geospatial queries and returns within 1 s for typical loads. | S |
| NFR-32 | API list endpoints are paginated. | M |
| NFR-33 | Images are resized/compressed on upload. | S |

## 7.5 Platforms & quality

| ID | Requirement | Pri |
| -- | ----------- | --- |
| NFR-40 | Mobile apps support iOS and Android (minimum versions TBD). | M |
| NFR-41 | API has automated tests (Pest) for job lifecycle, pricing, points and payment rules. | M |
| NFR-42 | Location permission is requested with clear rationale; app works with manual address entry if denied. | M |
