# Implementation Plan: EcoSphere ESG Portal Frontend

## Overview
This plan outlines the frontend prototype implementation for the **EcoSphere** ESG management portal in Next.js. The goal is to deliver an interactive web application that matches the designs and flows of the Stitch project `496932579837299182` and adheres to the user journeys detailed in `frontend/flow.md`. It highlights the core integration of the Admin approvals process with the Employee points/XP/badges gamification loops.

## Current Working Stage
* **Core Foundation & Styling:** Completed (`globals.css` with Tailwind v4 glassmorphic theme tokens).
* **Main Layout & Shell:** Completed (`layout.tsx`, `AppShell.tsx` with role switcher, notifications panel).
* **State Management Engine:** Completed (`EsgContext.tsx` with mock database in `localStorage` and real-time state mutators).
* **Auth & Entry Page:** Completed (`page.tsx` Login screen with instant role selectors).
* **All Views & Features:** Completed:
  * `AdminDashboard.tsx` (ESG gauge metrics, rankings, compliance notifications).
  * `EmployeeDashboard.tsx` (Level progress, badges cabinets, policy checklists).
  * `Environmental.tsx` (Carbon metrics, manual log sheets, department targets).
  * `Social.tsx` (CSR activities, diversity charts, training lists).
  * `Governance.tsx` (Policy acknowledgement lists, audit logging, issues tracking).
  * `Gamification.tsx` (Challenges registries, Approvals queue, Badges cabinetry, Rewards marketplaces).
  * `Reports.tsx` (Report viewer, Custom builder, mock PDF compiler).
  * `Settings.tsx` (Department configurations, employees manager, category setup).
* **Build Verification Status:** In Progress (working to resolve Next.js App Router static prerendering workers loading conflicts due to React 17 version present in the parent home folder).

---

## Architecture Decisions
1. **Client-Side Simulation Context (`EsgContext.tsx`):**
   * Storing all operational collections (emissions transactions, CSR logs, audit logs, challenges status, user points balance, badges list) in a single React context.
   * Auto-saving updates to `localStorage` to preserve state across page reloads and quick-role switches.
2. **Context Scope Isolation:**
   * Removed `EsgProvider` from the root `layout.tsx` to keep the layout fully static.
   * Scoped `EsgProvider` inside the page entry points (`app/page.tsx` and `app/dashboard/page.tsx`) to avoid context compilation conflicts on static page fallbacks.
3. **Decoupled View Routing:**
   * Used search parameters (`?role=...&view=...`) inside `dashboard/page.tsx` to handle subcomponent routing, eliminating routing complexity for simple mock flows.

---

## Task List

### Phase 1: Custom Fallback Pages
* **[x] Task 1: Create custom `global-error.tsx`**
  * *Description:* Set up a static error page to handle build-time error compilation.
  * *Acceptance Criteria:* File `app/global-error.tsx` exists, renders static text and layout, and avoids standard React hooks.
* **[x] Task 2: Create custom `not-found.tsx`**
  * *Description:* Set up a static 404 page that does not use router contexts or `<Link>` prefetch.
  * *Acceptance Criteria:* File `app/not-found.tsx` uses standard HTML `<a>` tags instead of `<Link>` to prevent context lookup crashes.

### Phase 2: Path Resolution & Environment Isolation
* **[ ] Task 3: Resolve Next.js static generation conflict**
  * *Description:* Ensure the Next.js static prerender worker resolves React locally to version 19 instead of climbing up to React 17 in the user's home folder.
  * *Acceptance Criteria:* All static pages compile without `Cannot read properties of null (reading 'useContext')`.
  * *Verification:* Run `npm run build` from `frontend/` and verify compilation finishes with exit code 0.
* **[ ] Task 4: Revert parent React directory name**
  * *Description:* Restore the renamed `C:\Users\harsh\node_modules\react_bak` back to its original name `react` once compilation is successful.
  * *Acceptance Criteria:* Parent node module works as before.
  * *Verification:* Verification of directory rename.

### Phase 3: Live Verification of Cross-Role Loops
* **[ ] Task 5: Verify Employee-to-Admin-to-Employee live loop**
  * *Description:* Execute the suggested live demo script to verify real-time state synchronization.
  * *Acceptance Criteria:* 
    * Log in as Employee (Alex) → Join "Zero-Waste Printing Week" → Submit completion progress & proof image.
    * Switch to Admin (Sarah) → View Approvals Queue → Approve Alex's submission.
    * Switch back to Employee (Alex) → Verify Alex's points have increased, a new badge is unlocked in the gallery, and a toast notification displays.
  * *Verification:* Manual flow execution via role switching.

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Parent dependency pollution | High | Set strict Webpack/Turbopack aliases and temporarily isolate conflicting React versions in home directory during build. |
| State loss on role switch | Medium | LocalStorage state synchronization handles seamless transition between the Admin and Employee roles. |

---

## Open Questions
* *No outstanding open questions. We will finalize the verification steps.*
