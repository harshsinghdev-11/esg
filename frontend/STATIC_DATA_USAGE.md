# Frontend Static Data Usage Map

This file documents where the current frontend still depends on static mock data so the next step can be a clean migration to API-backed data and role-based access.

## 1. Current situation

The frontend is not yet calling a backend. Most of the app state is currently stored in the shared context provider at [frontend/context/EsgContext.tsx](frontend/context/EsgContext.tsx).

That file:
- seeds the app with mock data on first load
- stores data in React state
- persists the state to localStorage
- exposes the data to all views through the `useEsg()` hook

In short: the UI is currently driven by local static state, not by backend responses.

---

## 2. Main static data source

### Primary source file
- [frontend/context/EsgContext.tsx](frontend/context/EsgContext.tsx)

### What it currently holds
- `currentUser`
- `departments`
- `employees`
- `categories`
- `esgConfig`
- `emissionFactors`
- `sustainabilityGoals`
- `carbonTransactions`
- `csrActivities`
- `challenges`
- `badges`
- `rewards`
- `redemptions`
- `complianceIssues`
- `audits`
- `policies`
- `submissions`
- `acknowledgements`
- `unlockedBadges`
- `notifications`

### Important note
The data is seeded in the provider with hard-coded arrays and then reused across the application. There are no API fetches in the current frontend flow.

---

## 3. Where static data is used

### A. Authentication and role context
Used in:
- [frontend/app/page.tsx](frontend/app/page.tsx)
- [frontend/components/AppShell.tsx](frontend/components/AppShell.tsx)

Current behavior:
- the login page decides whether to route as admin or employee based on the entered email
- the app shell reads `currentUser.role` and the URL query params to determine the active role and view
- role switching is local-only and does not come from a backend session

What this should become:
- backend auth/session verification
- server-provided role and permissions
- protected routes based on role and access rules

---

### B. Admin dashboard
Used in:
- [frontend/components/views/AdminDashboard.tsx](frontend/components/views/AdminDashboard.tsx)

Current static usage:
- `complianceIssues` is used to count open issues and show alerts
- department ranking values are hard-coded in the component
- score values such as overall ESG score and pillar scores are hard-coded

What this should become:
- dashboard metrics from `/dashboard/overview` or similar API endpoints
- filtered and permission-aware metrics per organization/department

---

### C. Employee dashboard
Used in:
- [frontend/components/views/EmployeeDashboard.tsx](frontend/components/views/EmployeeDashboard.tsx)

Current static usage:
- `currentUser` for profile and XP summary
- `submissions` for active challenge and CSR progress
- `acknowledgements` and `policies` for policy obligations
- `unlockedBadges` and `badges` for badge display

What this should become:
- user profile and activity summary from the authenticated user endpoint
- per-user challenge and CSR data from dedicated APIs
- badge and reward data from domain endpoints

---

### D. Environmental module
Used in:
- [frontend/components/views/Environmental.tsx](frontend/components/views/Environmental.tsx)

Current static usage:
- `emissionFactors`
- `sustainabilityGoals`
- `carbonTransactions`
- `departments`

These values drive:
- emission factor lists
- sustainability goal tracking
- transaction history
- department-based views

What this should become:
- emission factor catalog endpoint
- goals endpoint per department/org
- carbon transactions endpoint
- permissions for editing or viewing environmental records

---

### E. Social module
Used in:
- [frontend/components/views/Social.tsx](frontend/components/views/Social.tsx)

Current static usage:
- `csrActivities`
- `submissions`
- `departments`

These values drive:
- CSR activity listings
- employee participation and proof submission
- departmental assignment

What this should become:
- CSR activity management API
- participation API for employees/admins
- role-based action permissions for approval or review

---

### F. Governance module
Used in:
- [frontend/components/views/Governance.tsx](frontend/components/views/Governance.tsx)

Current static usage:
- `policies`
- `audits`
- `complianceIssues`
- `acknowledgements`
- `departments`
- `employees`

These values drive:
- policy publishing and acknowledgement flows
- audit scheduling and tracking
- compliance issue creation and resolution

What this should become:
- policies API
- audits API
- compliance issues API
- acknowledgment API scoped to the logged-in user

---

### G. Gamification module
Used in:
- [frontend/components/views/Gamification.tsx](frontend/components/views/Gamification.tsx)

Current static usage:
- `challenges`
- `submissions`
- `badges`
- `unlockedBadges`
- `rewards`
- `redemptions`
- `employees`

These values drive:
- challenge creation and lifecycle
- challenge participation and progress update
- reward catalog and redemption
- leaderboard-style behavior

What this should become:
- challenge API
- participation API
- reward API
- redemption API
- approval workflow API for submissions

---

### H. Settings module
Used in:
- [frontend/components/views/Settings.tsx](frontend/components/views/Settings.tsx)

Current static usage:
- `departments`
- `employees`
- `categories`
- `esgConfig`

These values drive:
- configuration of departments and employees
- category management
- ESG weighting configuration

What this should become:
- admin-only configuration API
- organization-level settings endpoint
- role-gated CRUD operations

---

### I. Reports module
Used in:
- [frontend/components/views/Reports.tsx](frontend/components/views/Reports.tsx)

Current static usage:
- `departments`

What this should become:
- report generation and export endpoints
- organization-specific analytics data

---

## 4. Static UI values that are not yet wired to data

Some values are still completely hard-coded inside components rather than derived from context state. These should be treated as future API fields:

- dashboard KPI numbers in admin and employee views
- trend chart values
- score labels and percentages
- some status counts and summaries
- static copy and labels that may later be localized or org-specific

---

## 5. Migration plan for API + role-based access

### Recommended next steps
1. Replace the context-driven mock state with API services per domain.
2. Introduce a shared auth/session layer to provide current user and permissions.
3. Move role-based access into the UI and backend rules.
4. Split the current `useEsg()` state into:
   - auth data
   - dashboard data
   - environmental data
   - social data
   - governance data
   - gamification data
   - settings data
5. Protect actions by role and organization scope.

### Suggested API boundaries
- Auth: login, logout, current user, permissions
- Dashboard: summary stats and alerts
- Environmental: factors, goals, transactions
- Social: CSR activities and participation
- Governance: policies, audits, compliance issues
- Gamification: challenges, submissions, badges, rewards
- Settings: departments, employees, categories, org config

---

## 6. Practical transition guide

When replacing static data, use this rule of thumb:
- If the data changes per user, department, or organization, it should become API-backed.
- If the action is sensitive (create, approve, publish, resolve, redeem), it should be role-gated and validated by the backend.
- If the data is purely presentational and fixed, it can stay static until a real backend source is available.

---

## 7. Summary

Today, the frontend is effectively a local mock application. The main static data dependencies are concentrated in [frontend/context/EsgContext.tsx](frontend/context/EsgContext.tsx) and then consumed across the dashboard, environmental, social, governance, gamification, settings, and reports views.

The next step should be to replace that local-state model with:
- API-driven data fetching
- authenticated user context
- role-based access control
- organization-scoped data access
