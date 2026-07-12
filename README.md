# 🌿 EcoSphere — ESG Management Platform

> A full-stack ESG (Environmental, Social, Governance) Management Platform built for a hackathon. EcoSphere integrates operational data, employee participation, and compliance activities into a single real-time dashboard — with gamification to drive sustainability behavior.

---

## 📚 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Business Workflow](#core-business-workflow)
- [ESG Scoring Model](#esg-scoring-model)
- [Modules & API Routes](#modules--api-routes)
- [Background Jobs](#background-jobs)
- [Role-Based Access Control](#role-based-access-control)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Frontend Views](#frontend-views)
- [Key Business Rules](#key-business-rules)
- [Multi-Tenancy](#multi-tenancy)
- [Reference Documentation](#reference-documentation)

---

## Overview

EcoSphere helps organizations monitor and improve their ESG performance across four pillars:

| Pillar | What it covers |
|---|---|
| 🌍 **Environmental** | Carbon accounting, emission factors, sustainability goals, carbon reports |
| 🤝 **Social** | CSR activities, employee participation, community engagement |
| ⚖️ **Governance** | Policies, audits, compliance tracking, issue management |
| 🎮 **Gamification** | Challenges, badges, XP, reward redemptions, leaderboards |

---

## Tech Stack

### Backend
| Tool | Version | Purpose |
|---|---|---|
| Node.js + Express | ^5.2.1 | REST API server |
| TypeScript | ^7.0.2 | Type safety |
| PostgreSQL + `pg` | ^8.22.0 | Primary database |
| Prisma | ^7.8.0 | DB client / migrations |
| JWT (`jsonwebtoken`) | ^9.0.3 | Auth (access + refresh tokens) |
| bcrypt | ^6.0.0 | Password hashing |
| Zod | ^4.4.3 | Request validation |
| Helmet + CORS | latest | Security headers |
| tsx | ^4.23.0 | TypeScript runner (dev) |

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16.2.10 | React framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first styling |
| Axios | ^1.18.1 | HTTP client |
| Lucide React | ^1.24.0 | Icon library |

---

## Project Structure

```
oddo/
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Express app entry point
│   │   ├── config/                   # DB pool, app config
│   │   ├── middleware/               # auth, rbac, error, validate, tenant
│   │   ├── jobs/                     # Background automation jobs
│   │   │   ├── autoEmissionCalc.job.ts
│   │   │   ├── badgeAutoAward.job.ts
│   │   │   └── overdueIssueFlag.job.ts
│   │   ├── modules/                  # Feature modules (routes/controller/service/types)
│   │   │   ├── auth/
│   │   │   ├── departments/
│   │   │   ├── employees/
│   │   │   ├── categories/
│   │   │   ├── emission-factors/
│   │   │   ├── badges/
│   │   │   ├── rewards/
│   │   │   ├── policies/
│   │   │   ├── environmental-goals/
│   │   │   ├── operational-records/
│   │   │   ├── carbon-transactions/
│   │   │   ├── csr-activities/
│   │   │   ├── participations/
│   │   │   ├── challenges/
│   │   │   ├── challenge-participations/
│   │   │   ├── leaderboard/
│   │   │   ├── audits/
│   │   │   ├── compliance-issues/
│   │   │   ├── scores/
│   │   │   ├── dashboard/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── notifications/
│   │   ├── shared/                   # Shared utilities (errors, mapKeys, etc.)
│   │   └── types/                    # Global type definitions
│   ├── prisma/                       # Prisma schema & migrations
│   ├── ARCHITECTURE.md
│   ├── BUSINESS_RULES.md
│   ├── EcoSphere_API_Endpoints.md
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── page.tsx                  # Login / landing page
    │   ├── layout.tsx
    │   └── dashboard/
    │       └── page.tsx              # Main dashboard shell
    ├── components/
    │   ├── AppShell.tsx              # Navigation sidebar + layout
    │   └── views/
    │       ├── AdminDashboard.tsx
    │       ├── EmployeeDashboard.tsx
    │       ├── Environmental.tsx
    │       ├── Gamification.tsx
    │       ├── Governance.tsx
    │       ├── Reports.tsx
    │       ├── Settings.tsx
    │       └── Social.tsx
    ├── services/                     # API call wrappers
    ├── hooks/                        # Custom React hooks
    ├── context/                      # Auth / global state context
    └── lib/                          # Utility functions
```

Every backend module follows a strict 4-file pattern:
```
modules/<name>/
  <name>.routes.ts      # URL mapping + middleware chain
  <name>.controller.ts  # req/res only, delegates to service
  <name>.service.ts     # ALL business logic + ALL SQL
  <name>.types.ts       # Zod schemas + TypeScript interfaces
```

---

## Core Business Workflow

```
Master Configuration
  (Departments · Categories · Emission Factors · Goals · Policies · Challenges)
                          |
                          v
         Daily Business Operations
   (Purchase · Manufacturing · Expense · Fleet)
                          |
                          v
            Carbon Transactions
         (AUTO-calculated or MANUAL)
                          |
                          v
  Employee Participation (CSR) · Challenges · Policy Acks · Audits
                          |
                          v
   Environmental Score · Social Score · Governance Score
                          |
                          v
              Department Total Score
                          |
                          v
         Overall ESG Score (weighted average)
                          |
                          v
       Organization Dashboard & Reports
```

---

## ESG Scoring Model

| Component | Default Weight |
|---|---|
| Environmental Score | 40% |
| Social Score | 30% |
| Governance Score | 30% |

> Weights are configurable per organization via `esg_configurations`.

The **Overall ESG Score** is computed live via the `v_organization_score` database view — it is never stored. Department scores are stored per period in the `department_scores` table.

---

## Modules & API Routes

All routes are prefixed with `/api/v1`. Every route except `/auth/*` requires:
```
Authorization: Bearer <access_token>
```

### 1. Auth & Identity
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register org + first SUPER_ADMIN |
| POST | `/auth/login` | Login, returns JWT access + refresh tokens |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current logged-in employee |

### 2. Departments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/departments` | List departments |
| POST | `/departments` | Create department |
| GET | `/departments/:id` | Get department detail |
| PATCH | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Soft-deactivate department |
| GET | `/departments/:id/hierarchy` | Get full sub-tree |
| GET | `/departments/:id/employees` | List employees in department |

### 3. Employees
| Method | Endpoint | Description |
|---|---|---|
| GET | `/employees` | List employees (filter by `department_id`, `status`, `role`) |
| POST | `/employees` | Create employee |
| GET | `/employees/:id` | Get employee detail |
| PATCH | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Deactivate employee |
| GET | `/employees/:id/xp-history` | XP/points earning history |
| GET | `/employees/:id/badges` | Badges earned |
| GET | `/employees/:id/participations` | CSR + challenge history |
| GET | `/employees/:id/notifications` | Employee notifications |

### 4. Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List (filter `?type=CSR_ACTIVITY\|CHALLENGE`) |
| POST | `/categories` | Create category |
| GET | `/categories/:id` | Get detail |
| PATCH | `/categories/:id` | Update |
| DELETE | `/categories/:id` | Archive |

### 5. Emission Factors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/emission-factors` | List emission factors |
| POST | `/emission-factors` | Create emission factor |
| GET | `/emission-factors/:id` | Get detail |
| PATCH | `/emission-factors/:id` | Update |
| DELETE | `/emission-factors/:id` | Deactivate |

### 6. Environmental Goals
| Method | Endpoint | Description |
|---|---|---|
| GET | `/environmental-goals` | List goals |
| POST | `/environmental-goals` | Create goal |
| GET | `/environmental-goals/:id` | Get detail |
| PATCH | `/environmental-goals/:id` | Update |
| DELETE | `/environmental-goals/:id` | Delete |

### 7. Operational Records
| Method | Endpoint | Description |
|---|---|---|
| GET | `/operational-records` | List records |
| POST | `/operational-records` | Create record (triggers auto emission calc) |
| GET | `/operational-records/:id` | Get detail |
| PATCH | `/operational-records/:id` | Update |
| DELETE | `/operational-records/:id` | Delete |

### 8. Carbon Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/carbon-transactions` | List transactions |
| POST | `/carbon-transactions` | Create manual transaction |
| GET | `/carbon-transactions/:id` | Get detail |
| PATCH | `/carbon-transactions/:id` | Update |
| DELETE | `/carbon-transactions/:id` | Delete |
| POST | `/carbon-transactions/auto-calculate` | Trigger auto-calc job manually |

### 9. CSR Activities
| Method | Endpoint | Description |
|---|---|---|
| GET | `/csr-activities` | List activities |
| POST | `/csr-activities` | Create activity |
| GET | `/csr-activities/:id` | Get detail |
| PATCH | `/csr-activities/:id` | Update |
| DELETE | `/csr-activities/:id` | Delete |

### 10. Participations (CSR)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/participations` | List participations |
| POST | `/participations` | Join CSR activity |
| GET | `/participations/:id` | Get detail |
| PATCH | `/participations/:id/approve` | Approve participation (checks evidence) |
| PATCH | `/participations/:id/reject` | Reject participation |

### 11. Challenges
| Method | Endpoint | Description |
|---|---|---|
| GET | `/challenges` | List challenges |
| POST | `/challenges` | Create challenge |
| GET | `/challenges/:id` | Get detail |
| PATCH | `/challenges/:id` | Update |
| DELETE | `/challenges/:id` | Delete |

### 12. Challenge Participations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/challenge-participations` | List participations |
| POST | `/challenge-participations` | Join challenge |
| GET | `/challenge-participations/:id` | Get detail |
| PATCH | `/challenge-participations/:id/complete` | Mark completed (awards XP + triggers badge check) |
| PATCH | `/challenge-participations/:id/approve` | ESG Manager approval |

### 13. Leaderboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/leaderboard` | Employee XP leaderboard |
| GET | `/leaderboard/departments` | Department ESG score rankings |

### 14. Badges
| Method | Endpoint | Description |
|---|---|---|
| GET | `/badges` | List badge definitions |
| POST | `/badges` | Create badge |
| GET | `/badges/:id` | Get detail |
| PATCH | `/badges/:id` | Update |
| DELETE | `/badges/:id` | Delete |

### 15. Rewards
| Method | Endpoint | Description |
|---|---|---|
| GET | `/rewards` | List rewards |
| POST | `/rewards` | Create reward |
| GET | `/rewards/:id` | Get detail |
| PATCH | `/rewards/:id` | Update |
| DELETE | `/rewards/:id` | Delete |
| POST | `/rewards/:id/redeem` | Redeem reward (deducts points, decrements stock) |

### 16. Policies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/policies` | List policies |
| POST | `/policies` | Create policy |
| GET | `/policies/:id` | Get detail |
| PATCH | `/policies/:id` | Update |
| DELETE | `/policies/:id` | Delete |
| POST | `/policies/:id/acknowledge` | Employee acknowledges policy |

### 17. Audits
| Method | Endpoint | Description |
|---|---|---|
| GET | `/audits` | List audits |
| POST | `/audits` | Create audit |
| GET | `/audits/:id` | Get detail |
| PATCH | `/audits/:id` | Update |
| DELETE | `/audits/:id` | Delete |
| POST | `/audits/:id/findings` | Add finding to audit |

### 18. Compliance Issues
| Method | Endpoint | Description |
|---|---|---|
| GET | `/compliance-issues` | List issues |
| POST | `/compliance-issues` | Raise compliance issue |
| GET | `/compliance-issues/:id` | Get detail |
| PATCH | `/compliance-issues/:id` | Update (status, owner, due date) |
| DELETE | `/compliance-issues/:id` | Delete |

### 19. Scores
| Method | Endpoint | Description |
|---|---|---|
| GET | `/scores/department/:id` | Get department ESG scores for a period |
| POST | `/scores/recalculate` | Trigger score recalculation |

### 20. Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Organization-wide ESG summary |
| GET | `/dashboard/employee` | Employee personal dashboard |

### 21. Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/carbon` | Carbon emissions report |
| GET | `/reports/governance` | Governance & compliance report |
| GET | `/reports/social` | Social engagement report |
| GET | `/reports/esg-summary` | Full ESG summary export |

### 22. Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | List notifications for current user |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### 23. Settings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/settings` | Get org ESG configuration |
| PATCH | `/settings` | Update ESG configuration toggles |

### Health Check
```
GET /api/v1/health  ->  { "status": "ok" }
```

---

## Background Jobs

Located in `backend/src/jobs/`. Each job is a plain async function callable both manually (via admin endpoint) and automatically (via a scheduler).

| Job | File | What it does | Toggle |
|---|---|---|---|
| Auto Emission Calculation | `autoEmissionCalc.job.ts` | Processes unprocessed operational records and creates carbon transactions | `auto_emission_calculation_enabled` |
| Badge Auto-Award | `badgeAutoAward.job.ts` | Checks employees against badge unlock rules and awards matching badges | `badge_auto_award_enabled` |
| Overdue Issue Flagging | `overdueIssueFlag.job.ts` | Flips OPEN compliance issues past their `due_date` to OVERDUE | — |

**Job behavior guarantees:**
- Read the relevant `esg_configurations` toggle before running; skip entirely if disabled
- Wrap all execution in `try/catch` — failures are logged but never crash the process
- Idempotent — safe to run multiple times

---

## Role-Based Access Control

Five roles with escalating permissions:

| Role | Access Level |
|---|---|
| `SUPER_ADMIN` | Full access to all modules including org settings |
| `ESG_MANAGER` | Manage master data, approve CSR/challenges, run reports |
| `DEPT_HEAD` | Manage their department's data, view department scores |
| `AUDITOR` | Read-only access + can create/manage audits and compliance issues |
| `EMPLOYEE` | Participate in CSR/challenges, view personal dashboard, redeem rewards |

RBAC is enforced at the route level via `rbac.middleware.ts`:
```typescript
router.post('/', authMiddleware, rbac(['SUPER_ADMIN', 'ESG_MANAGER']), createHandler);
router.get('/', authMiddleware, listHandler); // any authenticated role can read
```

---

## Environment Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm

### Backend — `backend/.env`
```env
DATABASE_URL=postgres://user:password@localhost:5432/ecosphere
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=4000
NODE_ENV=development
```

### Database Setup
```bash
# From the backend/ directory
npx prisma migrate dev      # Run migrations
npx prisma db seed          # Seed initial data
```

---

## Running the Project

### Backend
```bash
cd backend
npm install
npm run dev       # tsx watch — hot reload on port 4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # Next.js dev server on port 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Frontend Views

The frontend is a Next.js App Router application. After login, all content renders inside the `AppShell` sidebar layout.

| View | Description |
|---|---|
| Login / Landing | Authentication entry point — register org or login |
| Admin Dashboard | Org-wide ESG KPIs, score trends, department rankings |
| Employee Dashboard | Personal XP, badges, upcoming tasks, notifications |
| Environmental | Emission records, carbon transactions, goals, factors |
| Social | CSR activities, participation tracking and approvals |
| Governance | Policies, acknowledgements, audits, compliance issues |
| Gamification | Challenges, leaderboard, badge showcase, reward store |
| Reports | ESG reports filtered by period, department, and pillar |
| Settings | ESG configuration toggles, scoring weights, org details |

---

## Key Business Rules

### Auto Emission Calculation
When `auto_emission_calculation_enabled = true`, inserting an operational record automatically:
1. Finds a matching active emission factor valid for the record date
2. Calculates `co2e = quantity × emission_factor.co2e_per_unit`
3. Creates a carbon transaction with `calculation_type = 'AUTO'`
4. Marks the operational record as `is_processed = true`

When disabled, users create carbon transactions manually with `calculation_type = 'MANUAL'`.

### Evidence Requirement (CSR)
When `evidence_required_enabled = true` (org-level or overridden per-activity), approving a CSR participation without a `proof_url` returns `400 ValidationError`.

### Badge Auto-Award
When `badge_auto_award_enabled = true`, the system checks an employee's XP, points, and completed-challenge count against each badge's `unlock_rule` (JSONB) after relevant actions and awards matching badges automatically.

### Reward Redemption
- Points deducted from `employees.total_points_balance`
- Stock decremented in `rewards.stock_quantity`
- `409 Conflict` returned on insufficient points or out-of-stock

### Compliance Issue Lifecycle
```
OPEN --> IN_PROGRESS --> RESOLVED
  |
  v (if past due_date)
OVERDUE
```
Every issue must have an `owner_employee_id` and a `due_date`.

### Standard API Response Shapes
```jsonc
// Single resource
{ "data": { ...resource } }

// Paginated list
{ "data": [...], "meta": { "page": 1, "limit": 20, "total": 143 } }

// Error
{ "error": { "message": "Reward is out of stock", "code": "CONFLICT" } }
```

---

## Multi-Tenancy

EcoSphere is fully multi-tenant. Every database table (except reference/lookup tables) has an `organization_id` column.

- The `organization_id` is **always** extracted from the verified JWT — never from request body or query params
- `tenant.middleware.ts` decodes the JWT and attaches `req.user = { employeeId, organizationId, role }` to every authenticated request
- Every service method filters all queries by `organization_id` — cross-tenant data leakage is impossible by design

---

## Reference Documentation

| Document | Purpose |
|---|---|
| [`backend/EcoSphere_API_Endpoints.md`](./backend/EcoSphere_API_Endpoints.md) | Complete endpoint reference with role-access summary |
| [`backend/ARCHITECTURE.md`](./backend/ARCHITECTURE.md) | Folder structure, layering rules, naming conventions, build order |
| [`backend/BUSINESS_RULES.md`](./backend/BUSINESS_RULES.md) | Exact algorithms for auto-calc, scoring, badge award, redemption |
| [`EcoSphere_Flowcharts.md`](./EcoSphere_Flowcharts.md) | Visual workflow diagrams |

---

---

## Security

EcoSphere is built with defense-in-depth principles across every layer of the stack.

### Authentication & Authorization
- **JWT-based auth** — short-lived access tokens (Bearer) + long-lived refresh tokens. Access tokens are verified on every protected request via `auth.middleware.ts`.
- **bcrypt password hashing** — all passwords are hashed before storage; plaintext passwords never touch the database.
- **Role-Based Access Control (RBAC)** — every mutating route is guarded by `rbac.middleware.ts` which checks `req.user.role` against an explicit allowlist of permitted roles. Read routes require authentication but are otherwise open to all roles.
- **JWT never trusted for `organization_id`** — the org scope comes exclusively from the verified token payload, not from request body or query params, making horizontal privilege escalation impossible.

### Input Validation
- **Zod schemas** on every `POST` / `PATCH` route via `validate.middleware.ts`. Controllers receive only well-typed, pre-validated `req.body` — malformed requests are rejected before business logic runs.
- **Parameterized SQL** — all database queries use `$1`, `$2`, ... placeholders via the `pg` driver, eliminating SQL injection by construction.

### Transport & Headers
- **Helmet.js** sets hardened HTTP security headers on every response (CSP, X-Frame-Options, HSTS, etc.).
- **CORS** configured to restrict cross-origin requests to trusted origins.

### Data Isolation (Multi-Tenancy)
- Every DB query is scoped by `organization_id` extracted from the verified JWT. There is no code path that returns data from a different tenant — cross-tenant data leakage is architecturally impossible.
- Soft deletes (`status = 'INACTIVE'`) are used throughout to preserve audit history without exposing deleted records to end users.

### Error Handling
- Typed error classes (`NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`) allow the global `errorHandler` middleware to return precise HTTP status codes.
- Unhandled or unknown errors return `500` with a generic message — **stack traces are never leaked to the client**.
- Background jobs wrap all execution in `try/catch`; job failures are logged server-side and never crash the process or expose error details externally.

### Sensitive Configuration
- All secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`) are loaded from environment variables via `dotenv` and are never committed to version control (`.gitignore` excludes `.env`).

---

## Scalability

EcoSphere is designed with clear separation of concerns that makes horizontal and vertical scaling straightforward.

### Stateless API Server
- The Express backend is fully stateless — no server-side session storage. JWT tokens carry all identity context, so any number of API server replicas can run behind a load balancer without sticky sessions.

### Database Layer
- **PostgreSQL** is a battle-tested RDBMS that scales vertically (larger instance) and horizontally (read replicas for reporting/dashboard queries).
- **Prisma** provides a managed migration workflow, making schema changes safe and repeatable across environments.
- All list endpoints support `?page=&limit=` pagination to avoid full-table scans on large datasets.
- Database views (`v_organization_score`, `v_department_ranking`) pre-aggregate expensive join computations, keeping dashboard queries fast even as data grows.

### Multi-Tenant Architecture
- The single-schema multi-tenant model (`organization_id` on every table) lets one database instance serve thousands of organizations without schema duplication.
- Adding a new organization requires only a row insert — no schema changes, no new tables.

### Background Job Decoupling
- Computationally intensive tasks (emission calculation, badge evaluation, overdue flagging) are extracted into standalone async jobs in `src/jobs/`. They are decoupled from the request lifecycle so they never block API responses.
- Jobs are designed to be idempotent — safe to retry and safe to run on a separate worker process or container independently of the API server.
- The toggle system (`esg_configurations`) allows individual jobs to be disabled at runtime without code changes or redeployment.

### Module Isolation
- The strict `routes → controller → service` layering and one-folder-per-module structure means individual modules can be extracted into microservices later with minimal refactoring — each service only depends on the shared DB pool and utility helpers.

### Frontend Performance
- Next.js App Router enables server-side rendering and automatic code splitting, keeping initial page loads fast regardless of total application size.
- API calls are centralized in `services/` with Axios, making it easy to add caching (e.g., SWR or React Query) in front of expensive endpoints without touching component code.

### Observability Hooks
- The health endpoint (`GET /api/v1/health`) is ready for load balancer health checks and uptime monitoring out of the box.
- Centralized error logging in `errorHandler` and job `catch` blocks provide a single attachment point for external logging services (Datadog, Sentry, CloudWatch, etc.) when moving to production.

---

## License

MIT
