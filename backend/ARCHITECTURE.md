# EcoSphere — Architecture & Coding Conventions

Reference this file for HOW to build every module. Reference `EcoSphere_API_Endpoints.md`
for WHAT endpoints to build. Reference `ecosphere_schema_trimmed.sql` for the DB shape.

---

## 1. Layering (non-negotiable for every module)

```
routes.ts       -> URL + HTTP verb + middleware chain + which controller method
controller.ts   -> req/res only. Extract input, call service, set status, send JSON, next(err) on failure
service.ts      -> ALL business logic + ALL SQL. No req/res here. Throws typed errors, doesn't catch them.
types.ts        -> zod schemas (request validation) + TS interfaces (input/output shapes)
```

Rules:
- SQL only ever appears inside `*.service.ts`. If you find yourself writing a query in a controller, stop.
- Controllers never contain `if` statements about business rules (e.g. "if stock <= 0"). That belongs in the service, which throws a `ConflictError` the controller doesn't need to know about.
- Every controller method follows the same try/catch/next(err) shape shown in `auth.controller.ts`.
- Every service method takes plain arguments (not `req`), returns plain data (not a Response).

---

## 2. Folder-per-module

Every entry in the API endpoints doc's section headers (Departments, Employees, Categories, Emission Factors, etc.) gets its own folder under `src/modules/<name>/` with exactly these files:
`<name>.routes.ts`, `<name>.controller.ts`, `<name>.service.ts`, `<name>.types.ts`.

Do not create a shared "generic CRUD" abstraction across modules — each module's service is explicit and readable, even if repetitive. This matters more for an agent building fast than DRY-ness.

---

## 3. Multi-tenancy — apply to EVERY query, no exceptions

Every table except lookup/reference data has `organization_id`. `tenant.middleware.ts` decodes the JWT and attaches `req.user = { employeeId, organizationId, role }`.

**Every service method that touches the DB must filter by `organization_id`.** Example:

```typescript
// CORRECT
await pool.query(
  `SELECT * FROM departments WHERE department_id = $1 AND organization_id = $2`,
  [departmentId, organizationId]
);

// WRONG — leaks cross-tenant data
await pool.query(`SELECT * FROM departments WHERE department_id = $1`, [departmentId]);
```

Controllers pass `req.user.organizationId` into every service call. Never trust an `organization_id` from the request body/query — always take it from the verified JWT.

---

## 4. Standard response shapes

```jsonc
// Single resource
{ "data": { ...resource } }

// List (paginated)
{
  "data": [ ...resources ],
  "meta": { "page": 1, "limit": 20, "total": 143 }
}

// Error (thrown by service, formatted by error.middleware.ts)
{ "error": { "message": "Reward is out of stock", "code": "CONFLICT" } }
```

---

## 5. Error classes (in `shared/utils/errors.ts`)

```typescript
export class NotFoundError extends Error     { status = 404; }
export class ValidationError extends Error   { status = 400; }
export class UnauthorizedError extends Error { status = 401; }
export class ForbiddenError extends Error    { status = 403; }
export class ConflictError extends Error     { status = 409; }
```

`error.middleware.ts` catches these, sends `{ error: { message, code } }` with the matching status. Anything not matching one of these classes → `500`, log it, send a generic message (never leak stack traces to the client).

---

## 6. Auth & RBAC

- `auth.middleware.ts`: verifies JWT, attaches `req.user`. Reject with `401` if missing/invalid/expired.
- `rbac.middleware.ts`: takes a list of allowed roles, e.g. `rbac(['SUPER_ADMIN', 'ESG_MANAGER'])`. Apply on routes that mutate master data or approve things.
- Route-level pattern:

```typescript
router.post('/', authMiddleware, rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(createDeptSchema), departmentsController.create);
router.get('/', authMiddleware, departmentsController.list); // any authenticated role can read
```

- Role → access mapping is defined in `EcoSphere_API_Endpoints.md` section "Role-based access summary." Follow it exactly per module.

---

## 7. Validation

Every `POST`/`PATCH` route has a zod schema in that module's `*.types.ts`, applied via `validate.middleware.ts` before the controller runs. Controllers should never receive malformed `req.body` — that's what this middleware exists to guarantee.

---

## 8. Naming conventions

- DB columns: `snake_case` (matches schema exactly).
- TS variables/interfaces: `camelCase` — convert at the service boundary (query result rows are snake_case from `pg`; map to camelCase before returning, OR use a light mapper util in `shared/utils/mapKeys.ts`). Pick one approach and apply it everywhere, don't mix.
- Route files: plural resource names (`departments.routes.ts`, not `department.routes.ts`).
- IDs in URLs: always the primary key column name minus table prefix, e.g. `/departments/:id` where `id` = `department_id`.

---

## 9. Background jobs

Live in `src/jobs/`, one file per job (see API doc section 
"Background jobs" for the list: auto emission calc, badge auto-award, overdue issue flagging, policy reminder, score recalculation).

Each job:
- Is a plain async function, callable both by a scheduler (`node-cron`) AND by a manual `POST /.../trigger` admin endpoint — build the manual trigger first, wire up the scheduler only if time allows.
- Reads relevant toggles from `esg_configurations` before running (e.g. skip auto-calc entirely if `auto_emission_calculation_enabled = false`).
- Never throws uncaught — wrap in try/catch, log failures, don't crash the process.

See `BUSINESS_RULES.md` for the exact logic each job must implement.

---

## 10. Environment variables (`backend/.env`)

```
DATABASE_URL=postgres://user:pass@localhost:5432/ecosphere
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
PORT=4000
NODE_ENV=development
```

---

## 11. Build order for the agent (matches the 8-hour plan)

1. `config/`, `db/schema.sql`, `db/seed.ts`, `middleware/` (auth, tenant, error, validate)
2. `modules/auth`, `modules/departments`, `modules/employees` — login must work end to end first
3. `modules/categories`, `modules/emission-factors`, `modules/badges`, `modules/rewards`, `modules/policies`, `modules/environmental-goals` — master data CRUD, all follow the identical pattern
4. `modules/operational-records`, `modules/carbon-transactions`, `jobs/autoEmissionCalc.job.ts`
5. `modules/csr-activities`, `modules/participations`
6. `modules/challenges`, `modules/challenge-participations`, `jobs/badgeAutoAward.job.ts`, `modules/leaderboard`
7. `modules/audits`, `modules/compliance-issues`, `jobs/overdueIssueFlag.job.ts`
8. `modules/scores`, `modules/dashboard`, `modules/reports`, `modules/settings`, `modules/notifications`

Each numbered step should be a working, testable slice before moving to the next — don't build all routes.ts files first and all services after.
