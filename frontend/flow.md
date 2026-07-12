# EcoSphere — User Flow Documentation

This document describes the end-to-end user journeys for both personas — **Admin/Manager** and **Employee** — from onboarding through the core engagement loop.

---

## ADMIN / MANAGER FLOW

### Phase 1 — Setup (first-time use)

1. Login → redirected to Organization Dashboard (empty state, no data yet)
2. Sidebar → Settings → Departments
   - Create departments (e.g. "Operations", "HR", "Manufacturing")
   - Assign department heads
3. Settings → Employees
   - Add employees, assign to departments, set roles
4. Settings → Category Management
   - Create CSR Activity categories (e.g. "Tree Plantation", "Blood Donation")
   - Create Challenge categories (e.g. "Energy Saving", "Waste Reduction")
5. Settings → ESG Configuration
   - Set scoring weights (Env 40% / Social 30% / Gov 30%)
   - Toggle: Auto Emission Calculation ON/OFF
   - Toggle: Evidence Requirement ON/OFF
   - Toggle: Badge Auto-Award ON
6. Settings → Notification Settings
   - Enable in-app notifications for all 4 event types

### Phase 2 — Environmental Setup & Monitoring

7. Environmental → Emission Factors
   - Add factors (e.g. "Diesel: 2.68 kg CO2/litre")
8. Environmental → Sustainability Goals
   - Set a target per department (e.g. "Operations: max 500kg CO2/month")
9. **[Ongoing]** Environmental → Carbon Transactions
   - If auto-calc ON: transactions appear automatically as operational events occur
   - If OFF: Admin manually logs a transaction
10. Environmental → Environmental Dashboard
    - Reviews emissions trend, sees which department is over target

### Phase 3 — Social Program Management

11. Social → CSR Activities → Create new activity
    - Title, category, department, date
12. *(Employees join and submit proof — see Employee Flow)*
13. Social → CSR Activity Detail
    - Reviews submitted proof
    - Approve / Reject each participation
    - On approve: system auto-credits points, checks badges, sends notification
14. Social → Diversity Metrics / Training Completion
    - Reviews passively (mostly read-only reporting pages)

### Phase 4 — Governance Management

15. Governance → ESG Policies → Create new policy
    - Employees get notified to acknowledge (see Employee Flow)
16. Governance → Policies list
    - Monitors acknowledgement rate per policy
17. Governance → Audits → Schedule new audit
    - Assign auditor, department, date
18. After audit conducted → Audit Detail → Add Compliance Issue(s)
    - Set severity, assign Owner, set Due Date
19. Governance → Compliance Issues
    - Monitors open/overdue issues (auto-flagged red)
    - Updates status as issues get resolved

### Phase 5 — Gamification Management

20. Gamification → Challenges → Create new challenge
    - Title, category, XP value, difficulty, evidence required, deadline
    - Status starts as "Draft"
21. Sets Challenge status → "Active" (now visible to employees)
22. *(Employees join, submit progress — see Employee Flow)*
23. Gamification → Approvals Queue
    - Reviews pending Challenge & CSR submissions in one inbox
    - Approve → XP awarded → badge check runs automatically → notification sent
24. Gamification → Badges
    - Creates new badges with unlock rules (e.g. "Complete 5 challenges")
25. Gamification → Rewards Catalog
    - Adds redeemable rewards with points cost and stock
26. Gamification → Leaderboard
    - Monitors engagement, may reference this to plan next challenges
27. Manually or automatically: Challenge status moves to "Under Review" then "Completed" once deadline passes and submissions are processed (or "Archived" if cancelled)

### Phase 6 — Reporting (recurring, e.g. monthly)

28. Reports → Reports Home → selects "ESG Summary Report"
29. Report Viewer → applies filters (department, date range)
30. Exports as PDF → shares with leadership
    **OR**
31. Reports → Custom Report Builder
    - Picks specific metrics/filters → generates ad-hoc report → exports

### Phase 7 — Ongoing loop

32. Returns to Organization Dashboard daily/weekly
    - Sees updated Overall ESG Score, department rankings, alerts
    - Cycle repeats: approve submissions → scores recalculate → review reports

---

## EMPLOYEE FLOW

### Phase 1 — Onboarding

1. Login → redirected to My Dashboard
   - Sees XP: 0, Level 1, no badges yet, points balance: 0
2. Notification bell shows: "New policy requires acknowledgement"
3. Governance → Policies → opens pending policy
   - Reads text → checks "I acknowledge" → Confirm
   - `policy_acknowledgement` recorded

### Phase 2 — Social Participation

4. Social → CSR Activities
   - Browses list, filters by category
5. Opens an activity → clicks "Join"
   - `employee_participation` created (status: pending)
6. Completes the activity in real life
7. My Participations → uploads proof photo/document
   - status still "pending" until admin approves
8. **[Waits]** → Notification received: "Your CSR participation was approved"
   - `points_balance` increases automatically

### Phase 3 — Gamification Engagement (core loop)

9. Gamification → Challenges
   - Browses Active challenges, filters by category/difficulty
10. Opens a challenge → reads description, XP value, deadline
    - clicks "Join Challenge"
    - `challenge_participation` created
11. My Challenges → tracks it under "Active" tab
12. Works on challenge → returns to Submit Progress
    - updates progress %, uploads proof if `evidence_required = true`
13. **[Waits for admin approval]**
14. Notification received: "Challenge approved! +100 XP"
    - XP updates on My Dashboard
    - System auto-checks badge rules in background
15. Notification received (if applicable): "New badge unlocked: Energy Saver!"
    - Badges Gallery shows the badge now unlocked (no longer greyed out)
16. Checks Leaderboard → sees own rank improved

### Phase 4 — Rewards

17. Rewards Catalog → browses available rewards
    - sees own points balance at top
18. Selects a reward with sufficient points → clicks "Redeem"
19. Redemption Confirmation modal → confirms
    - points deducted, reward stock reduced
20. My Redemptions → sees redemption history

### Phase 5 — Ongoing loop

21. Returns to My Dashboard regularly
    - checks XP progress, active challenges, new badges
22. Repeats: join challenge/activity → submit proof → get approved → earn XP/points → redeem rewards
23. Periodically: acknowledges new policies as they're published
24. Can view (read-only) their department's ESG score contribution on My Dashboard

---

## Where the Two Flows Intersect

```
Employee submits (CSR proof / Challenge progress)
        │
        ▼
Admin's Approvals Queue ── Approve/Reject ──┐
        │                                    │
        ▼                                    ▼
Points/XP credited to Employee      Notification sent to Employee
        │
        ▼
Badge Engine checks unlock rules
        │
        ▼
Department Score recalculated ──→ Admin Dashboard updates
```

This intersection point — **Approvals Queue → XP/Points → Badge Engine → Score Recalc** — is the single most important flow to get rock-solid for a demo, since it's the one place both personas' screens visibly react to the same action in real time.

**Suggested live demo script:**
1. Log in as Employee → join a challenge → submit proof
2. Switch to Admin → approve it in the Approvals Queue
3. Switch back to Employee → show XP, badge, and notification updated instantly