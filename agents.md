# AGENTS.md — EcoSphere: ESG Management Platform

This file gives every agent working in this workspace the standing context for the project.
Read this first, then follow the pointers below to the detailed docs.

---

## 1. What we're building

EcoSphere is an ESG (Environmental, Social, Governance) Management Platform for a hackathon,
built to be delivered in **8 hours**.

**Background:** Organizations are expected to monitor carbon emissions, promote employee
well-being, and maintain governance compliance. Most ERP systems collect operational data,
but ESG reporting today is manual, disconnected, and hard to monitor in real time.

**Goal:** Build a platform that integrates operational data, employee participation, and
compliance activities into one dashboard — while using gamification to drive sustainability
behavior.

**The four pillars:**
- **Environmental** — carbon accounting, emission factors, sustainability goals, carbon reports
- **Social** — CSR activities, employee participation, engagement
- **Governance** — policies, audits, compliance tracking, governance reports
- **Gamification** — challenges, badges, XP, rewards, leaderboards

**The core business workflow (this is the spine of the whole app):**
```
Master Configuration (Departments, Categories, Emission Factors, Goals, Policies, Challenges)
        ↓
Daily Business Operations (Purchase / Manufacturing / Expense / Fleet)
        ↓
Carbon Transactions (auto or manual calculated)
        ↓
Employee Participation (CSR) · Challenge Participation · Policy Acknowledgements · Audits
        ↓
Environmental Score · Social Score · Governance Score
        ↓
Department Total Score
        ↓
Overall ESG Score  (weighted: Environmental 40% / Social 30% / Governance 30%, configurable per org)
        ↓
Organization Dashboard & Reports
```

Everything you build should trace back to this workflow — if a feature doesn't feed into or
read from this pipeline, it's out of scope for the 8-hour build.

---

## 2. Scope discipline (read this before adding anything)

This is a hackathon, not a production build. The following are explicitly **in scope, not
optional**, because they directly support the core modules:
- Reward Redemption (points/XP → catalog reward, stock-gated)
- Notification System (in-app minimum, for: compliance issue raised, CSR/Challenge approval
  decisions, policy acknowledgement reminders, badge unlocks)
- Auto Emission Calculation (toggleable)
- Evidence Requirement for CSR approval (toggleable)
- Badge Auto-Award (toggleable)
- Compliance Issue Ownership + overdue flagging

The following are explicitly **optional / bonus** — build only if core scope is done early:
- Department ESG rankings (a view already exists for this — `v_department_ranking`)
- Smart dashboard visualizations
- Mobile-responsive polish

**Do not** build features not mentioned anywhere in the reference docs (no speculative
"nice to have" modules — e.g. no separate diversity-metrics module, no training-completion
module — these were deliberately cut from the schema to fit the time budget).

---

## 3. Reference docs — read these before writing code

| File | What it's for | Read it when... |
|---|---|---|
| `ecosphere_schema_trimmed.sql` | The full Postgres schema, source of truth for every table/column/enum | Before writing any query or migration |
| `EcoSphere_API_Endpoints.md` | Every REST endpoint, grouped by module, with role-access summary | Before adding/changing a route |
| `ARCHITECTURE.md` | Folder structure, routes/controller/service layering, naming conventions, env vars, build order | Before creating a new module or file |
| `BUSINESS_RULES.md` | The exact algorithms for auto-calc, badge-award, redemption, scoring, lifecycle transitions, notifications | Before implementing any "smart"/automated logic |

If something in code conflicts with one of these docs, the doc wins — flag the conflict rather
than silently deviating.

---

## 4. Tech stack

- Backend: Node.js + Express + TypeScript
- DB: PostgreSQL (see `ecosphere_schema_trimmed.sql`)
- Auth: JWT (access + refresh), bcrypt for password hashing
- Frontend: React + TypeScript + Vite
- Validation: zod
- Multi-tenant: every table scoped by `organization_id`, taken from the verified JWT — never
  from the request body/query

---

## 5. Domain vocabulary (so agents don't reinvent terms)

- **Employee** — a user of the platform. Has a `role` (SUPER_ADMIN, ESG_MANAGER, DEPT_HEAD,
  AUDITOR, EMPLOYEE), belongs to one `department`, accrues `total_xp` and
  `total_points_balance`.
- **Department** — org unit, can be nested (`parent_department_id`), has a `head_employee_id`.
- **Category** — shared master data used by both CSR Activities and Challenges, distinguished
  by `type`.
- **Emission Factor** — a CO2e-per-unit conversion value used to turn operational data into
  carbon numbers.
- **Operational Record** — a single merged table standing in for Purchase / Manufacturing /
  Expense / Fleet source data (the spec gave no distinct fields per source type).
- **Carbon Transaction** — the calculated emission, either `AUTO` (from an operational record)
  or `MANUAL`.
- **CSR Activity** vs **Challenge** — CSR Activities are company-organized social initiatives
  (tracked via `employee_participations`); Challenges are gamified sustainability tasks
  (tracked via `challenge_participations`). These are deliberately **separate** tables — don't
  merge them.
- **Badge** — auto-awarded achievement, unlocked when an employee's XP/points/completed-challenge
  count satisfies a JSONB `unlock_rule`.
- **Reward** — catalog item redeemable for points, stock-limited.
- **Compliance Issue** — a governance violation, always has an `owner_employee_id` and
  `due_date`; flips to `OVERDUE` if still `OPEN` past due date.
- **Department Score** / **Organization Score** — department scores are stored per period;
  the organization-level "Overall ESG Score" is *not* stored, it's computed live as a weighted
  average via the `v_organization_score` view.

---

## 6. Working agreement for agents

- Follow `ARCHITECTURE.md`'s build order (section 11) — don't jump ahead to reports/dashboards
  before the core data pipeline (operational records → carbon transactions → scores) works.
- Every module = `routes.ts` + `controller.ts` + `service.ts` + `types.ts`, no exceptions
  (see `ARCHITECTURE.md` §1-2).
- SQL only in `*.service.ts` files.
- Every DB query scoped by `organization_id` from `req.user`, never trust a client-supplied org id.
- When implementing any "auto" behavior (emission calc, badge award, overdue flagging,
  notifications), check `BUSINESS_RULES.md` for the exact algorithm before implementing —
  don't infer the logic from the endpoint name alone.
- Prefer a working, seeded, demoable slice over a complete-but-untested one — this is a time-
  boxed hackathon build.
