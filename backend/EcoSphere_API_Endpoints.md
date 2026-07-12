# EcoSphere ESG Management Platform — API Endpoints

Base URL: `/api/v1`
Auth: `Authorization: Bearer <token>` on every route except `/auth/*`.
All list endpoints support `?page=&limit=` and are scoped to the caller's `organization_id` automatically (multi-tenant — never pass org id in the body/query).

Standard responses:
- `200 OK` / `201 Created` — success, JSON body
- `400 Bad Request` — validation error
- `401 Unauthorized` / `403 Forbidden` — auth/role failure
- `404 Not Found`
- `409 Conflict` — e.g. duplicate code, insufficient stock/points

---

## 1. Auth & Identity

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register org + first admin user |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current logged-in employee |

---

## 2. Organizations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/organizations/me` | Get current organization details |
| PATCH | `/organizations/me` | Update organization name/status |

---

## 3. Departments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/departments` | List departments (supports `?parent_department_id=`) |
| POST | `/departments` | Create department |
| GET | `/departments/:id` | Get department detail |
| PATCH | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Deactivate department (soft delete → status INACTIVE) |
| GET | `/departments/:id/hierarchy` | Get full sub-tree under this department |
| GET | `/departments/:id/employees` | List employees in this department |

---

## 4. Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees` | List employees (filters: `department_id`, `status`, `role`) |
| POST | `/employees` | Create employee |
| GET | `/employees/:id` | Get employee detail |
| PATCH | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Deactivate employee |
| GET | `/employees/:id/xp-history` | XP/points earning history (CSR + challenges) |
| GET | `/employees/:id/badges` | Badges earned by this employee |
| GET | `/employees/:id/participations` | CSR + challenge participation history |
| GET | `/employees/:id/notifications` | Notifications for this employee |

---

## 5. Categories (shared: CSR_ACTIVITY / CHALLENGE)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List categories (filter `?type=CSR_ACTIVITY\|CHALLENGE`) |
| POST | `/categories` | Create category |
| GET | `/categories/:id` | Get category detail |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Archive category |

---

## 6. Emission Factors

| Method | Endpoint | Description |
|---|---|---|
| GET | `/emission-factors` | List emission factors (filter `?status=ACTIVE`) |
| POST | `/emission-factors` | Create emission factor |
| GET | `/emission-factors/:id` | Get detail |
| PATCH | `/emission-factors/:id` | Update (e.g. new `co2e_per_unit`, `valid_to`) |
| DELETE | `/emission-factors/:id` | Deactivate |

---

## 7. Environmental Goals

| Method | Endpoint | Description |
|---|---|---|
| GET | `/environmental-goals` | List goals (filters: `department_id`, `status`) |
| POST | `/environmental-goals` | Create goal |
| GET | `/environmental-goals/:id` | Get detail incl. progress |
| PATCH | `/environmental-goals/:id` | Update target/current value |
| DELETE | `/environmental-goals/:id` | Delete goal |

---

## 8. ESG Policies

| Method | Endpoint | Description |
|---|---|---|
| GET | `/policies` | List policies |
| POST | `/policies` | Create policy |
| GET | `/policies/:id` | Get detail |
| PATCH | `/policies/:id` | Update policy (new version, doc url) |
| DELETE | `/policies/:id` | Archive policy |
| GET | `/policies/:id/acknowledgements` | List who has/hasn't acknowledged |
| POST | `/policies/:id/acknowledge` | Current employee acknowledges the policy |
| POST | `/policies/:id/remind` | Trigger acknowledgement reminder notifications |

---

## 9. Badges

| Method | Endpoint | Description |
|---|---|---|
| GET | `/badges` | List badges |
| POST | `/badges` | Create badge (incl. `unlock_rule` JSON) |
| GET | `/badges/:id` | Get detail |
| PATCH | `/badges/:id` | Update badge / unlock rule |
| DELETE | `/badges/:id` | Deactivate badge |
| GET | `/badges/:id/holders` | List employees who hold this badge |

---

## 10. Rewards & Redemption

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rewards` | List rewards (catalog) |
| POST | `/rewards` | Create reward |
| GET | `/rewards/:id` | Get detail |
| PATCH | `/rewards/:id` | Update reward / stock |
| DELETE | `/rewards/:id` | Deactivate reward |
| POST | `/rewards/:id/redeem` | Current employee redeems reward (checks stock + points balance, deducts points) |
| GET | `/redemptions` | List redemptions (admin: all; employee: own) |
| GET | `/redemptions/:id` | Get redemption detail |
| PATCH | `/redemptions/:id` | Update status (FULFILLED / CANCELLED) |

---

## 11. Operational Records (Purchase / Manufacturing / Expense / Fleet)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/operational-records` | List records (filters: `source_type`, `department_id`, `is_processed`, date range) |
| POST | `/operational-records` | Create a record (single endpoint, `source_type` in body) |
| GET | `/operational-records/:id` | Get detail |
| PATCH | `/operational-records/:id` | Update record |
| DELETE | `/operational-records/:id` | Delete record (only if not yet processed) |
| POST | `/operational-records/:id/calculate` | Manually trigger emission calculation for this record |

---

## 12. Carbon Transactions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/carbon-transactions` | List (filters: `department_id`, `source_type`, date range) |
| POST | `/carbon-transactions` | Create manual carbon transaction |
| GET | `/carbon-transactions/:id` | Get detail |
| PATCH | `/carbon-transactions/:id` | Update manual transaction |
| DELETE | `/carbon-transactions/:id` | Delete manual transaction |
| GET | `/carbon-transactions/summary` | Aggregated CO2e (filters: `department_id`, date range, group by day/month/department) |
| POST | `/carbon-transactions/auto-calculate` | Batch-process all unprocessed `operational_records` (respects `auto_emission_calculation_enabled` setting) |

---

## 13. CSR Activities

| Method | Endpoint | Description |
|---|---|---|
| GET | `/csr-activities` | List activities (filters: `category_id`, `department_id`, `status`) |
| POST | `/csr-activities` | Create activity |
| GET | `/csr-activities/:id` | Get detail |
| PATCH | `/csr-activities/:id` | Update activity / status |
| DELETE | `/csr-activities/:id` | Archive activity |
| GET | `/csr-activities/:id/participants` | List participants + approval status |

---

## 14. Employee (CSR) Participation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/csr-activities/:id/participate` | Current employee joins/logs participation (with proof upload) |
| GET | `/participations` | List (admin: all; employee: own). Filters: `employee_id`, `csr_activity_id`, `approval_status` |
| GET | `/participations/:id` | Get detail |
| PATCH | `/participations/:id/approve` | Approve — awards points, blocked if `evidence_required` and no proof |
| PATCH | `/participations/:id/reject` | Reject participation |

---

## 15. Audits

| Method | Endpoint | Description |
|---|---|---|
| GET | `/audits` | List audits (filters: `department_id`, `status`) |
| POST | `/audits` | Create/schedule audit |
| GET | `/audits/:id` | Get detail |
| PATCH | `/audits/:id` | Update audit / status / findings |
| DELETE | `/audits/:id` | Cancel audit |
| GET | `/audits/:id/issues` | List compliance issues raised from this audit |

---

## 16. Compliance Issues

| Method | Endpoint | Description |
|---|---|---|
| GET | `/compliance-issues` | List (filters: `status`, `severity`, `owner_employee_id`, overdue flag) |
| POST | `/compliance-issues` | Create issue (requires `owner_employee_id` + `due_date`) — triggers notification |
| GET | `/compliance-issues/:id` | Get detail |
| PATCH | `/compliance-issues/:id` | Update status/severity/owner |
| DELETE | `/compliance-issues/:id` | Close/delete issue |
| GET | `/compliance-issues/overdue` | List all OPEN issues past due date |

---

## 17. Challenges

| Method | Endpoint | Description |
|---|---|---|
| GET | `/challenges` | List (filters: `category_id`, `status`, `difficulty`) |
| POST | `/challenges` | Create challenge (starts as DRAFT) |
| GET | `/challenges/:id` | Get detail |
| PATCH | `/challenges/:id` | Update challenge |
| PATCH | `/challenges/:id/status` | Transition lifecycle (Draft→Active→Under Review→Completed, or →Archived anytime) |
| DELETE | `/challenges/:id` | Delete draft challenge |
| GET | `/challenges/:id/participants` | List participants + progress |

---

## 18. Challenge Participation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/challenges/:id/join` | Current employee joins challenge |
| PATCH | `/challenge-participations/:id/progress` | Update progress % / upload proof |
| GET | `/challenge-participations` | List (admin: all; employee: own). Filters: `challenge_id`, `employee_id`, `approval_status` |
| GET | `/challenge-participations/:id` | Get detail |
| PATCH | `/challenge-participations/:id/approve` | Approve — awards XP, checks badge unlock rules |
| PATCH | `/challenge-participations/:id/reject` | Reject participation |

---

## 19. Leaderboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/leaderboard` | Ranked employees by XP (filters: `department_id`, `period`) |
| GET | `/leaderboard/departments` | Department ESG ranking |

---

## 20. Scoring & Dashboards

| Method | Endpoint | Description |
|---|---|---|
| GET | `/scores/departments` | List department scores (filters: `department_id`, `period_start`, `period_end`) |
| GET | `/scores/departments/:id` | Get latest score for one department |
| POST | `/scores/departments/:id/recalculate` | Trigger recalculation for a period |
| GET | `/scores/organization` | Org-wide Overall ESG Score (weighted rollup, computed live) |
| GET | `/dashboard/environmental` | Environmental dashboard summary (emissions trend, goals progress) |
| GET | `/dashboard/social` | Social dashboard summary (CSR participation, engagement) |
| GET | `/dashboard/governance` | Governance dashboard summary (audits, open issues, compliance rate) |
| GET | `/dashboard/gamification` | Gamification dashboard summary (top performers, active challenges) |
| GET | `/dashboard/overview` | Combined organization-level dashboard |

---

## 21. Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/environmental` | Generate Environmental Report (filters below) |
| GET | `/reports/social` | Generate Social Report |
| GET | `/reports/governance` | Generate Governance Report |
| GET | `/reports/esg-summary` | Generate combined ESG Summary Report |
| POST | `/reports/custom` | Build custom report from combined filters |
| GET | `/reports/:id/export` | Export a generated report (`?format=pdf\|excel\|csv`) |

**Common report filters** (query params on all `/reports/*`): `department_id`, `date_from`, `date_to`, `module` (environmental/social/governance/gamification), `employee_id`, `challenge_id`, `esg_category`.

---

## 22. ESG Configuration (Settings)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/settings/esg-configuration` | Get org's weighting + feature toggles |
| PATCH | `/settings/esg-configuration` | Update weights (must sum to 100) and toggles: `auto_emission_calculation_enabled`, `evidence_required_enabled`, `badge_auto_award_enabled`, `notify_in_app`, `notify_email` |

---

## 23. Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | List current employee's notifications (filter `is_read`) |
| GET | `/notifications/:id` | Get detail |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |

---

## Role-based access summary

| Role | Typical access |
|---|---|
| `SUPER_ADMIN` | Full access to all endpoints, all departments |
| `ESG_MANAGER` | Full CRUD on master/transactional data, reports, configuration |
| `DEPT_HEAD` | Read/write scoped to own department, approve participations for own dept |
| `AUDITOR` | Read/write on `audits`, `compliance-issues`; read-only elsewhere |
| `EMPLOYEE` | Read own profile/history, join CSR & challenges, redeem rewards, acknowledge policies |

---

## Background jobs (not user-facing endpoints, but part of the platform)

| Job | Trigger | Effect |
|---|---|---|
| Auto emission calculation | Scheduled / on new `operational_records` | Creates `carbon_transactions`, marks record `is_processed = true` (if `auto_emission_calculation_enabled`) |
| Badge auto-award | On XP/points/challenge-completion change | Evaluates `badges.unlock_rule` against employee, inserts `employee_badges`, sends `BADGE_UNLOCKED` notification |
| Overdue issue flagging | Scheduled (daily) | Flags `compliance_issues` past `due_date` while `OPEN`, sends `ISSUE_OVERDUE` notification |
| Policy reminder | Scheduled | Sends `POLICY_ACK_REMINDER` to employees without an acknowledgement |
| Score recalculation | Scheduled (e.g. nightly/weekly) | Recomputes `department_scores` for the current period |
