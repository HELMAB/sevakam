# 3. Business rules

## 3.1 Services & pricing

| ID | Rule | Pri |
| -- | ---- | --- |
| BR-01 | Admin manages main services and subservices. Each subservice has a **platform-wide base price** and a unit (e.g. per unit, per hour, per m²) *(assumption on units)*. | M |
| BR-02 | Estimated job price = Σ(base price × quantity) for the selected subservices, minus any applicable promotion. | M |
| BR-03 | A technician may propose a different price when accepting; the customer must accept it before the job is confirmed. | M |
| BR-04 | Prices are stored in **USD** and also displayed in **KHR** using an admin-set exchange rate. | M |
| BR-05 | When a technician's price proposal is accepted, it **replaces** the promotional price; no promotion discount is applied on top. | M |

## 3.2 Technician offerings & service area

| ID | Rule | Pri |
| -- | ---- | --- |
| BR-10 | Each freelancer and company selects the subservices they offer. Company employees inherit the company's offerings *(assumption)*. | M |
| BR-11 | Each freelancer/company sets a location and a **service radius**. Only technicians whose area covers the customer's address and who offer all selected subservices are shown. | M |
| BR-12 | Only **approved, active and online** technicians can receive new jobs. | M |

## 3.3 Registration & approval

| ID | Rule | Pri |
| -- | ---- | --- |
| BR-20 | Freelancers and companies require **admin approval** after registration. Until approved, they see a "waiting for confirmation" screen. | M |
| BR-21 | Admin reviews submitted documents (job certificate, patent, company profile) and approves or rejects with a reason. Rejected applicants can update and resubmit *(assumption)*. | M |
| BR-22 | Employees created by an approved company owner are active immediately. The owner can deactivate them at any time. | M |

## 3.4 Ranking

| ID | Rule | Pri |
| -- | ---- | --- |
| BR-30 | "Top technicians" and "top companies" are ranked by **average rating weighted by number of completed jobs** (Bayesian average) multiplied by an **acceptance-rate factor** (last 90 days; rejections and no-responses lower the rank), filtered to those offering the selected subservices and covering the address. No point penalties. | M |
| BR-31 | A company's rating is the aggregate of its employees' job ratings *(assumption)*. | M |

## 3.5 Promotions

| ID | Rule | Pri |
| -- | ---- | --- |
| BR-40 | Freelancers and company owners can create promotions: image, title, description, and a **percentage discount per subservice**, with a start and end date *(assumption on dates)*. | M |
| BR-41 | Promotions require **admin approval** before publishing. On approval, all customers receive a push notification. | M |
| BR-42 | The discount applies when the customer books that freelancer/company (or its employee) for a promoted subservice during the promotion period. | M |
| BR-43 | The owner can deactivate a promotion at any time; existing confirmed jobs keep their discounted price. | M |

## 3.6 Payment

| ID | Rule | Pri |
| -- | ---- | --- |
| BR-50 | Payment happens **after the job is completed**. Customer chooses **cash** or **ABA PayWay** (KHQR / card). | M |
| BR-51 | Cash: the technician confirms cash received in the app; the job becomes `paid`. | M |
| BR-52 | ABA PayWay: the customer pays in-app; the job becomes `paid` on gateway confirmation (server-side callback verified). | M |
| BR-53 | The platform takes **no commission**. PayWay funds are collected by the platform and **settled manually** by admin to the freelancer/company; admin records each settlement. | M |
| BR-54 | Refunds are handled manually by admin *(assumption)*. | S |

## 3.7 Loyalty points (score)

| ID | Rule | Pri |
| -- | ---- | --- |
| BR-60 | Customers earn points when a job is paid, at an admin-configured rate (e.g. 1 point per $1). | M |
| BR-61 | Customers can redeem points as a discount when paying for a job at an admin-configured rate (e.g. 100 points = $1), up to a configurable maximum per job. | M |
| BR-62 | Technicians earn points per completed job at an admin-configured rate and can redeem them for **rewards** from an admin-managed catalog; admin approves and fulfils each request manually (points refunded if rejected). | M |
| BR-65 | Points **expire 12 months** after being earned; the oldest points are spent first. | M |
| BR-63 | Every point change is stored as a transaction (earn, redeem, adjust, expire) and shown in the "score transaction list". | M |
| BR-64 | Admin can manually adjust a user's points with a reason. | S |

## 3.8 Ratings

| ID | Rule | Pri |
| -- | ---- | --- |
| BR-70 | After a job is paid, the customer can rate the technician once: 1–5 stars, optional images, optional description. | M |
| BR-71 | If stars < 5, the customer must select at least one reason from an admin-managed list. | M |
| BR-72 | Ratings are shown on the technician's (and company's) public profile. | M |
