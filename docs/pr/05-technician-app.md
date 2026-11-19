# 5. Technician app (`app/technician_app`)

Spec estimate: ~193 (units assumed hours). One app serves freelancers, company owners and company employees; screens are shown according to the role.

## 5.1 Onboarding & account

| ID | Requirement | Roles | Pri |
| -- | ----------- | ----- | --- |
| TEC-01 | First screen with entry to login or register. | All | M |
| TEC-02 | Register as **freelancer** or **company**, including documents required for approval (BR-20). | Freelancer, Owner | M |
| TEC-03 | Login with email + password. | All | M |
| TEC-04 | Login with Facebook. | Freelancer, Owner | M |
| TEC-05 | Login with Apple. | Freelancer, Owner | M |
| TEC-06 | "Waiting for registration confirmation" screen until admin approves; shows rejection reason and allows resubmission. | Freelancer, Owner | M |
| TEC-07 | Forgot password. | All | M |
| TEC-08 | Update profile: name, surname, email, multiple phone numbers. | All | M |
| TEC-09 | Profile photo. | All | M |
| TEC-10 | Address + location (map pin) and service radius (BR-11). | Freelancer, Owner | M |
| TEC-11 | Upload job certificate(s). | Freelancer, Employee | M |
| TEC-12 | Upload patent (business licence). | Freelancer, Owner | M |
| TEC-13 | Company profile: name, logo, description, contact, address *(assumption on fields)*. | Owner | M |
| TEC-14 | Working hours per weekday. | Freelancer, Owner | M |
| TEC-15 | Select offered subservices (BR-10). | Freelancer, Owner | M |
| TEC-16 | Change language (English only in v1). | All | M |
| TEC-17 | Terms and conditions page. | All | M |
| TEC-18 | Score: current points and transaction list. | All | M |

## 5.2 Availability

| ID | Requirement | Roles | Pri |
| -- | ----------- | ----- | --- |
| TEC-20 | Toggle online / offline. Only online technicians receive new jobs. | Freelancer, Employee, Owner* | M |
| TEC-21 | Show current online/offline status prominently. | All | M |
| TEC-22 | Every online/offline change is recorded for history (TEC-62). | All | M |

\* Owner can go online only if they also perform jobs *(assumption)*.

## 5.3 Jobs

| ID | Requirement | Roles | Pri |
| -- | ----------- | ----- | --- |
| TEC-30 | Home page waiting for incoming jobs: push notification + realtime full-screen popup with job summary and response countdown (15 min). | Freelancer, Employee | M |
| TEC-31 | Company owner receives company-level jobs (`pending_assignment`) and assigns an available employee. | Owner | M |
| TEC-32 | List jobs by tab: pending, ongoing, completed. | All | M |
| TEC-33 | Job detail with actions: **accept** (optionally **adjust price** → sends price proposal to customer). | Freelancer, Employee | M |
| TEC-34 | **Reject** with a reason. | Freelancer, Employee | M |
| TEC-35 | **Reject appointment time** with a form to propose a new date/time. | Freelancer, Employee | M |
| TEC-36 | Update progress: on the way → in progress → **complete job**. | Freelancer, Employee | M |
| TEC-37 | Confirm cash received for cash-paid jobs (BR-51). | Freelancer, Employee | M |
| TEC-38 | Receive alert screen before appointment (JOB-11). | Freelancer, Employee | M |
| TEC-39 | Open customer address in Google Maps for navigation. | Freelancer, Employee | S |
| TEC-39a | Share live location with the customer while the job is "on the way" (JOB-14). | Freelancer, Employee, Owner | M |
| TEC-19 | Rewards: browse the catalog, redeem points, track redemption status (BR-62). | All | M |

## 5.4 Promotions

| ID | Requirement | Roles | Pri |
| -- | ----------- | ----- | --- |
| TEC-40 | Promotion form: image, title, description, period, percentage per subservice (BR-40). Submitted for admin approval. | Freelancer, Owner | M |
| TEC-41 | List promotions (pending approval, active, ended) and view detail. | Freelancer, Owner | M |
| TEC-42 | Deactivate a promotion. | Freelancer, Owner | M |

## 5.5 Company: employee management

| ID | Requirement | Roles | Pri |
| -- | ----------- | ----- | --- |
| TEC-50 | Create a new employee account (name, phone, email, temporary password, photo, certificates). | Owner | M |
| TEC-51 | List employees with status (active/inactive, online/offline). | Owner | M |
| TEC-52 | Update employee info. | Owner | M |
| TEC-53 | Activate or deactivate an employee account. | Owner | M |
| TEC-60 | View an employee's job history. | Owner | M |
| TEC-62 | View an employee's online/offline status history (timeline per day). | Owner | M |
