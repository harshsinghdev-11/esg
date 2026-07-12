# EcoSphere — Frontend ↔ Backend Integration Plan

> **Analysis basis:** `frontend/STATIC_DATA_USAGE.md`, `backend/EcoSphere_API_Endpoints.md`, `backend/ARCHITECTURE.md`
> **Frontend:** Next.js 16 / React 19 / TypeScript (no HTTP client library yet)
> **Backend:** Node.js / Express / TypeScript / PostgreSQL — all 23 modules exist under `src/modules/`

---

## Overview

The frontend currently runs entirely on local mock state stored in `EsgContext.tsx` (localStorage + React state).
The backend exposes 23 full REST modules under `/api/v1`. This plan bridges them cleanly with zero breaking UI regressions.

---

## Phase 0 — Foundation (do this before touching any view)

### 0-A. Install HTTP client + token management

```bash
# inside /frontend
npm install axios
```

Create **`frontend/lib/api.ts`** — the single Axios instance used everywhere:

```ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  withCredentials: false,
});

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        const { data } = await axios.post("/api/v1/auth/refresh", { refreshToken: refresh });
        localStorage.setItem("access_token", data.data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api.request(error.config);
      }
      // No refresh token — redirect to login
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
```

Add to **`frontend/.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

### 0-B. Create domain service layer

Create **`frontend/services/`** — one file per backend module section.
Each service file exports typed async functions that wrap `api.ts`.

**File map:**

| Service file | Backend module(s) |
|---|---|
| `services/auth.service.ts` | `/auth/*` |
| `services/departments.service.ts` | `/departments` |
| `services/employees.service.ts` | `/employees` |
| `services/categories.service.ts` | `/categories` |
| `services/emission-factors.service.ts` | `/emission-factors` |
| `services/environmental-goals.service.ts` | `/environmental-goals` |
| `services/operational-records.service.ts` | `/operational-records` |
| `services/carbon-transactions.service.ts` | `/carbon-transactions` |
| `services/csr-activities.service.ts` | `/csr-activities` |
| `services/participations.service.ts` | `/participations`, `/csr-activities/:id/participate` |
| `services/challenges.service.ts` | `/challenges` |
| `services/challenge-participations.service.ts` | `/challenge-participations` |
| `services/policies.service.ts` | `/policies` |
| `services/audits.service.ts` | `/audits` |
| `services/compliance-issues.service.ts` | `/compliance-issues` |
| `services/badges.service.ts` | `/badges` |
| `services/rewards.service.ts` | `/rewards`, `/redemptions` |
| `services/leaderboard.service.ts` | `/leaderboard` |
| `services/scores.service.ts` | `/scores/*` |
| `services/dashboard.service.ts` | `/dashboard/*` |
| `services/reports.service.ts` | `/reports/*` |
| `services/settings.service.ts` | `/settings/esg-configuration` |
| `services/notifications.service.ts` | `/notifications` |

---

### 0-C. Create shared frontend types

Create **`frontend/types/api.types.ts`** — mirrors the backend DB shapes (camelCase).
These replace the loose interfaces currently inside `EsgContext.tsx`.

**Key field mappings** (frontend mock → backend API field):

| Domain | Frontend mock field | Backend API field |
|---|---|---|
| User | `role: "admin" \| "employee"` | `role: "SUPER_ADMIN" \| "ESG_MANAGER" \| "DEPT_HEAD" \| "AUDITOR" \| "EMPLOYEE"` |
| User | `xp`, `level`, `points` | `totalXp`, `totalPointsBalance` (level computed on frontend) |
| Employee | `department: string` (name) | `departmentId: string` (UUID) |
| EmissionFactor | `value: string` | `co2ePerUnit: number`, `unit: string` |
| SustainabilityGoal | `progress: string` (raw %) | `currentValue`, `targetValue`, `unit` |
| CarbonTransaction | `source`, `emissions: string` | `sourceType`, `co2eKg: number` |
| ComplianceIssue | `owner: string` (name) | `ownerEmployeeId: string` |
| Submission | merged type for challenge+CSR | split: `Participation` (CSR) + `ChallengeParticipation` |
| EsgConfig | `envWeight`, `socialWeight`, `govWeight` | `envWeight`, `socialWeight`, `govWeight`, `auto_emission_calculation_enabled`, etc. |

---

### 0-D. Create `AuthContext` (replace the ad-hoc role switch in EsgContext)

Create **`frontend/context/AuthContext.tsx`**:
- Stores `accessToken`, `refreshToken`, `currentUser` (from `/auth/me`)
- Exposes `login(email, password)`, `logout()`, `isAuthenticated`, `currentUser`
- On mount, if `access_token` exists in localStorage, calls `GET /auth/me` to rehydrate
- `currentUser.role` drives all RBAC checks in the UI

> **Critical:** The frontend currently uses `"admin" | "employee"` roles. The backend uses 5 roles.  
> Map like this in `AuthContext`:
> ```ts
> export const isAdmin = (role: string) =>
>   ["SUPER_ADMIN", "ESG_MANAGER"].includes(role);
> export const isDeptHead = (role: string) => role === "DEPT_HEAD";
> export const isAuditor = (role: string) => role === "AUDITOR";
> ```

---

## Phase 1 — Authentication (enables everything else)

### Files to create/modify

#### [NEW] `frontend/app/login/page.tsx` (or update existing `frontend/app/page.tsx`)
- On form submit: call `POST /auth/login` via `auth.service.ts`
- On success: store `accessToken` + `refreshToken` in localStorage, call `/auth/me`, set `AuthContext`
- Redirect based on `currentUser.role` → admin-style roles → admin dashboard, `EMPLOYEE` → employee dashboard

#### [MODIFY] `frontend/components/AppShell.tsx`
- Remove: `switchRole()` local function
- Replace: read role from `AuthContext.currentUser.role`
- Add: `Logout` button calling `POST /auth/logout` then clearing localStorage

---

## Phase 2 — Settings module (master data — other modules depend on this)

> Settings data (`departments`, `employees`, `categories`, `esgConfig`) is used by **every other module** as FK-referenced data or dropdown options. Hydrate these first.

### Create `frontend/hooks/useDomainData.ts`
A single hook that fetches all reference data in parallel on app mount (after auth):
```ts
const { departments } = useDepartments();       // GET /departments
const { employees }   = useEmployees();         // GET /employees
const { categories }  = useCategories();        // GET /categories
const { esgConfig }   = useEsgConfiguration(); // GET /settings/esg-configuration
```

These replace the `departments`, `employees`, `categories`, `esgConfig` slices currently baked into `EsgContext`.

### [MODIFY] `frontend/components/views/Settings.tsx`

| Current static action | New API call |
|---|---|
| `createDepartment()` | `POST /departments` |
| `createEmployee()` | `POST /employees` |
| `addCategory()` | `POST /categories` |
| `updateEsgConfig()` | `PATCH /settings/esg-configuration` |
| Delete/deactivate dept | `DELETE /departments/:id` |
| Delete/deactivate employee | `DELETE /employees/:id` |

Role gate: wrap all mutation buttons with `isAdmin(currentUser.role)` check.

---

## Phase 3 — Environmental module

### [MODIFY] `frontend/components/views/Environmental.tsx`

| Context slice | Replaces with | API endpoint |
|---|---|---|
| `emissionFactors` | `GET /emission-factors` | list + `?status=ACTIVE` |
| `addEmissionFactor()` | `POST /emission-factors` | |
| `sustainabilityGoals` | `GET /environmental-goals` | filter `?department_id=` |
| `addSustainabilityGoal()` | `POST /environmental-goals` | |
| `carbonTransactions` | `GET /carbon-transactions` | filter by dept / date |
| `addCarbonTransaction()` | `POST /carbon-transactions` (manual) | |
| (no current equivalent) | `POST /operational-records/:id/calculate` | manual trigger |
| (no current equivalent) | `GET /carbon-transactions/summary` | aggregated CO2e chart data |
| (no current equivalent) | `GET /dashboard/environmental` | summary KPIs |

**Type migration notes:**
- `EmissionFactor.value: string` → `{ co2ePerUnit: number; unit: string; sourceType: string }`
- `SustainabilityGoal.progress: string` → `{ currentValue: number; targetValue: number; unit: string }` (compute `%` on frontend)
- `CarbonTransaction.emissions: string` → `co2eKg: number`

---

## Phase 4 — Social module

### [MODIFY] `frontend/components/views/Social.tsx`

| Context slice | API endpoint | Notes |
|---|---|---|
| `csrActivities` | `GET /csr-activities` | filter `?status=`, `?department_id=` |
| `createCsrActivity()` | `POST /csr-activities` | admin only |
| `submissions` (csr type) | `GET /participations` | `?csr_activity_id=`, `?approval_status=` |
| `joinActivity()` | `POST /csr-activities/:id/participate` | current user |
| `submitActivityProof()` | `PATCH /participations/:id` (include proof_url) | |
| `approveSubmission()` (csr) | `PATCH /participations/:id/approve` | ESG_MANAGER / DEPT_HEAD |
| `rejectSubmission()` (csr) | `PATCH /participations/:id/reject` | |
| `GET /csr-activities/:id/participants` | participants list per activity | new feature, not in mock |

**Important:** The frontend's merged `Submission` type conflates CSR participations and challenge participations. These must be split into two separate API calls.

---

## Phase 5 — Governance module

### [MODIFY] `frontend/components/views/Governance.tsx`

| Context slice | API endpoint | Notes |
|---|---|---|
| `policies` | `GET /policies` | |
| `createPolicy()` | `POST /policies` | |
| `acknowledgePolicy()` | `POST /policies/:id/acknowledge` | current user |
| `acknowledgements` | `GET /policies/:id/acknowledgements` | per policy |
| `(remind button)` | `POST /policies/:id/remind` | admin only |
| `audits` | `GET /audits` | filter `?department_id=`, `?status=` |
| `scheduleAudit()` | `POST /audits` | |
| `complianceIssues` | `GET /compliance-issues` | filter `?status=`, `?severity=` |
| `addComplianceIssue()` | `POST /compliance-issues` | requires `owner_employee_id` + `due_date` |
| `resolveComplianceIssue()` | `PATCH /compliance-issues/:id` body `{ status: "RESOLVED" }` | |
| `GET /compliance-issues/overdue` | overdue issues alert badge | new feature |
| `GET /audits/:id/issues` | issues from a specific audit | new feature |

**Type migration notes:**
- `ComplianceIssue.owner: string` (name) → `ownerEmployeeId: string` (UUID); resolve display name via employees list
- `Audit.auditor: string` (name) → `auditorEmployeeId: string`

---

## Phase 6 — Gamification module

### [MODIFY] `frontend/components/views/Gamification.tsx`

| Context slice | API endpoint | Notes |
|---|---|---|
| `challenges` | `GET /challenges` | filter `?status=`, `?category_id=`, `?difficulty=` |
| `createChallenge()` | `POST /challenges` | starts as DRAFT |
| `activateChallenge()` | `PATCH /challenges/:id/status` body `{ status: "ACTIVE" }` | |
| `submissions` (challenge type) | `GET /challenge-participations` | |
| `joinChallenge()` | `POST /challenges/:id/join` | current user |
| `submitChallengeProgress()` | `PATCH /challenge-participations/:id/progress` | |
| `approveSubmission()` (challenge) | `PATCH /challenge-participations/:id/approve` | |
| `rejectSubmission()` (challenge) | `PATCH /challenge-participations/:id/reject` | |
| `badges` | `GET /badges` | |
| `createBadge()` | `POST /badges` | include `unlock_rule` JSON |
| `unlockedBadges` | `GET /employees/:id/badges` | for current user |
| `rewards` | `GET /rewards` | |
| `createReward()` | `POST /rewards` | admin only |
| `redeemReward()` | `POST /rewards/:id/redeem` | checks stock + points server-side |
| `redemptions` | `GET /redemptions` | admin: all, employee: own |
| `(leaderboard)` | `GET /leaderboard` | new feature |

**Important:** The `unlock_rule` JSONB field in badges needs a UI builder. Current mock just stores a plain `rule: string`. Replace with a structured form producing JSON like `{ "type": "xp_threshold", "value": 1000 }`.

---

## Phase 7 — Dashboards

### [MODIFY] `frontend/components/views/AdminDashboard.tsx`

| Hard-coded value | API endpoint |
|---|---|
| Overall ESG score + pillar scores | `GET /scores/organization` |
| Department rankings | `GET /leaderboard/departments` |
| Open compliance issues count | `GET /compliance-issues?status=OPEN` (count from meta.total) |
| Environmental summary KPIs | `GET /dashboard/environmental` |
| Social summary KPIs | `GET /dashboard/social` |
| Governance summary KPIs | `GET /dashboard/governance` |
| Gamification summary | `GET /dashboard/gamification` |
| Combined overview | `GET /dashboard/overview` |

### [MODIFY] `frontend/components/views/EmployeeDashboard.tsx`

| Static slice | API endpoint |
|---|---|
| `currentUser` profile | `GET /auth/me` (already in AuthContext) |
| XP/points summary | `GET /employees/:id/xp-history` |
| Challenge progress | `GET /challenge-participations?employee_id=me` |
| CSR progress | `GET /participations?employee_id=me` |
| Pending policy acks | `GET /policies` + check against `GET /employees/:id/acknowledgements` |
| Unlocked badges | `GET /employees/:id/badges` |
| Notifications | `GET /notifications?is_read=false` |

---

## Phase 8 — Reports module

### [MODIFY] `frontend/components/views/Reports.tsx`

| Current | API endpoint |
|---|---|
| `departments` dropdown (only static data used) | Hydrated from `useDomainData` hook |
| Environmental report | `GET /reports/environmental?department_id=&date_from=&date_to=` |
| Social report | `GET /reports/social` |
| Governance report | `GET /reports/governance` |
| ESG summary | `GET /reports/esg-summary` |
| Export | `GET /reports/:id/export?format=pdf\|excel\|csv` |

---

## Phase 9 — Notifications

### Create `frontend/hooks/useNotifications.ts`

- On mount: `GET /notifications?is_read=false`
- Poll every 30s (or use WebSocket if backend adds it later)
- `PATCH /notifications/:id/read` on click
- `PATCH /notifications/read-all`

Wire into `AppShell.tsx` notification bell (already in the UI).

---

## Migration Strategy for `EsgContext.tsx`

> Do NOT delete `EsgContext.tsx` immediately. Migrate domain-by-domain.

### Step-by-step teardown order:

```
EsgContext.tsx (current monolith)
       ↓ Phase 0
AuthContext.tsx (auth + currentUser — extracted first)
       ↓ Phase 2
useDepartments, useEmployees, useCategories, useEsgConfig (reference data hooks)
       ↓ Phase 3–6 (one per sprint/phase)
useEmissionFactors, useGoals, useCarbonTransactions
useCsrActivities, useParticipations
usePolicies, useAudits, useComplianceIssues
useChallenges, useChallengeParticipations, useBadges, useRewards, useRedemptions
       ↓ Phase 7–8
useDashboard, useReports
       ↓ Final
EsgContext.tsx → delete (replaced entirely by individual hooks + AuthContext)
```

Each hook follows this shape:
```ts
export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    departmentsService.list()
      .then((res) => setDepartments(res.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { departments, loading, error, refetch };
}
```

---

## Role-Based UI Gating

The frontend must replicate the backend RBAC table as UI guards.  
Create **`frontend/lib/rbac.ts`**:

```ts
export type BackendRole = "SUPER_ADMIN" | "ESG_MANAGER" | "DEPT_HEAD" | "AUDITOR" | "EMPLOYEE";

export const can = {
  manageOrg:      (r: BackendRole) => ["SUPER_ADMIN"].includes(r),
  manageEmployees:(r: BackendRole) => ["SUPER_ADMIN", "ESG_MANAGER"].includes(r),
  approveCsr:     (r: BackendRole) => ["SUPER_ADMIN", "ESG_MANAGER", "DEPT_HEAD"].includes(r),
  manageAudits:   (r: BackendRole) => ["SUPER_ADMIN", "ESG_MANAGER", "AUDITOR"].includes(r),
  viewReports:    (r: BackendRole) => ["SUPER_ADMIN", "ESG_MANAGER", "AUDITOR"].includes(r),
  redeemReward:   (r: BackendRole) => r === "EMPLOYEE",
  joinChallenge:  (r: BackendRole) => r === "EMPLOYEE",
};
```

Replace all `currentUser.role === "admin"` checks in the views with `can.X(currentUser.role)`.

---

## Error Handling & Loading States

Add a shared `frontend/components/ui/` directory with:
- `LoadingSpinner.tsx` — shown while API calls in-flight
- `ErrorBanner.tsx` — renders `{ error: { message, code } }` from backend
- `EmptyState.tsx` — for lists that return zero results

Every view currently renders static data instantly. After migration, wrap data-dependent sections:
```tsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorBanner message={error} />;
if (!data.length) return <EmptyState message="No records found." />;
```

---

## Backend CORS Configuration

Before the frontend can call the backend, ensure in **`backend/src/index.ts`** or the Express app setup:

```ts
import cors from "cors";
app.use(cors({
  origin: "http://localhost:3000",  // Next.js dev port
  credentials: false,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

---

## Field Name Alignment (Snake → Camel)

The backend service layer maps DB snake_case to camelCase before returning. Confirm each module's `service.ts` does the mapping. Frontend types should use camelCase consistently.

Critical fields to verify across all modules:

| DB column | Expected frontend camelCase |
|---|---|
| `organization_id` | `organizationId` |
| `department_id` | `departmentId` |
| `employee_id` | `employeeId` |
| `head_employee_id` | `headEmployeeId` |
| `co2e_per_unit` | `co2ePerUnit` |
| `source_type` | `sourceType` |
| `is_processed` | `isProcessed` |
| `unlock_rule` | `unlockRule` |
| `total_xp` | `totalXp` |
| `total_points_balance` | `totalPointsBalance` |
| `approval_status` | `approvalStatus` |
| `evidence_required` | `evidenceRequired` |
| `auto_emission_calculation_enabled` | `autoEmissionCalculationEnabled` |

---

## Pagination

Backend lists return:
```json
{ "data": [...], "meta": { "page": 1, "limit": 20, "total": 143 } }
```

Frontend should handle this on all list views. Use default `?limit=50` for most list calls to avoid complex pagination UI in the hackathon scope — but build the type correctly from day one so it can be wired later.

---

## Suggested Execution Order (time-boxed)

```
Hour 1: Phase 0 (api.ts, services/, types/api.types.ts, AuthContext)
Hour 2: Phase 1 (Login page → /auth/login + /auth/me working end-to-end)
Hour 3: Phase 2 (Settings: departments, employees, categories, esgConfig from API)
Hour 4: Phase 3 + 4 (Environmental + Social wired)
Hour 5: Phase 5 + 6 (Governance + Gamification wired)
Hour 6: Phase 7 (Dashboards — replace all hard-coded KPIs)
Hour 7: Phase 8 + 9 (Reports + Notifications)
Hour 8: Phase cleanup — remove EsgContext mock data, test RBAC, fix edge cases
```

---

## Open Questions / Decisions Needed

> [!IMPORTANT]
> **File/image uploads for proof**: `/csr-activities/:id/participate` and `PATCH /challenge-participations/:id/progress` accept a `proof_url`. Does the backend handle multipart file uploads, or does the frontend upload to a CDN first and pass the URL? Clarify before implementing the proof submission UI.

> [!IMPORTANT]
> **`EMPLOYEE` role dashboard routing**: The current frontend routes between "admin" and "employee" views via URL query params. After migration, routing should be based on the JWT role. Decide: single route with conditional rendering, OR two distinct routes (`/dashboard/admin` vs `/dashboard/employee`)?

> [!NOTE]
> **Polling vs WebSocket for notifications**: The spec says "in-app minimum." Simple polling every 30s is sufficient for the hackathon. Wire `GET /notifications` on mount + interval.

> [!NOTE]
> **Level computation**: The backend has no `level` field — only `total_xp`. The frontend currently displays a `level` (e.g., level 12 from 850 XP). Decide on a level formula and compute it on the frontend from `totalXp`.
