# 4. Customer app (`app/customer_app`)

Spec estimate: ~190 (units assumed hours).

## 4.1 Onboarding & account

| ID | Requirement | Pri |
| -- | ----------- | --- |
| CUS-01 | First screen (splash/intro) with entry to login or register. | M |
| CUS-02 | Register with name, surname, email, phone number and password. | M |
| CUS-03 | Login with email + password. | M |
| CUS-04 | Login with Facebook. | M |
| CUS-05 | Login with Apple (required on iOS when social login exists). | M |
| CUS-06 | Forgot password: reset via email link/OTP. | M |
| CUS-07 | Edit profile: name, surname, phone number, email. | M |
| CUS-08 | Upload/change profile photo. | M |
| CUS-09 | Manage addresses: add/edit/delete with a label (Home, Office, …) and a location picked on the map; set a default. | M |
| CUS-10 | Change language (English only in v1; switcher ready for more). | M |
| CUS-11 | Terms and conditions page (content managed by admin). | M |
| CUS-12 | Score: show current points and a paginated list of point transactions. | M |

## 4.2 Discovery

| ID | Requirement | Pri |
| -- | ----------- | --- |
| CUS-20 | Home screen lists main services. | M |
| CUS-21 | Home screen lists top companies (BR-30). | M |
| CUS-22 | Promotion notification page: list of active promotions received. | M |
| CUS-23 | Promotion detail page with a "Book now" action pre-selecting the company/technician and subservices. | M |
| CUS-24 | View technician profile: photo, name, company, rating, completed jobs, reviews, certificates *(assumption on fields)*. | M |

## 4.3 Booking

| ID | Requirement | Pri |
| -- | ----------- | --- |
| CUS-30 | Flow A: main service → subservice(s) → fill job detail → choose company **or** technician. | M |
| CUS-31 | Flow B: company → main service → subservice(s) → fill job detail. Job goes to the company owner for assignment (JOB-02). | M |
| CUS-32 | Add more subservices from the **same main service** to the job, each with its own quantity. | M |
| CUS-33 | Job detail form: photo attachments (up to N, *assumption: 5*), quantity per subservice, remark, appointment date & time, address. | M |
| CUS-34 | Choose technician from "top 5 technicians" list (BR-30). | M |
| CUS-35 | Choose technician from nearest technicians on a map (Google Maps), filtered per BR-11/BR-12. | M |
| CUS-36 | Show price estimate (base price × quantity − promotion) in USD and KHR before submitting. Points are redeemed at payment (CUS-46). | M |

## 4.4 Job tracking

| ID | Requirement | Pri |
| -- | ----------- | --- |
| CUS-40 | View job detail and current status, updated in realtime. | M |
| CUS-41 | Receive cost proposal from technician: accept or reject (JOB-06). | M |
| CUS-42 | Confirm new appointment time proposed by technician: approve or reject (JOB-07). | M |
| CUS-43 | Select another technician (and update appointment time) after rejection, expiry or technician rejection. | M |
| CUS-44 | Cancel job when the technician doesn't respond/confirm, or per JOB-09 rules. | M |
| CUS-45 | Job history: list completed and not-completed (cancelled/expired) jobs. | M |
| CUS-46 | Pay for a completed job: choose cash or ABA PayWay (BR-50..52) and optionally redeem points. | M |
| CUS-47 | See the technician's live location on a map while the job is "on the way" (JOB-14). | M |
| CUS-48 | Verify email with a 6-digit code after registration (no SMS OTP). | M |

## 4.5 Rating

| ID | Requirement | Pri |
| -- | ----------- | --- |
| CUS-50 | Evaluate technician: stars (1–5). | M |
| CUS-51 | Attach images to the evaluation. | M |
| CUS-52 | Select reason(s) from options when stars < 5. | M |
| CUS-53 | Free-text description. | M |
