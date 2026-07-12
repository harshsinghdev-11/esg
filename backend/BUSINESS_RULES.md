# EcoSphere — Business Rules & Algorithms

These are the rules the problem statement calls out explicitly (Section 8: Core Configuration
& Business Rules) plus the scoring logic (Section 5/6). Implement exactly this — don't infer
different behavior. Each rule states: trigger, preconditions, effect, and which toggle (if any)
gates it in `esg_configurations`.

---

## 1. Auto Emission Calculation

**Toggle:** `esg_configurations.auto_emission_calculation_enabled`

**Trigger:** new row inserted into `operational_records`, OR the scheduled job runs, OR `POST /carbon-transactions/auto-calculate` is called manually.

**Logic:**
```
FOR EACH operational_record WHERE is_processed = false:
  IF auto_emission_calculation_enabled == false:
      SKIP (leave is_processed = false; record stays for manual entry)
  ELSE:
      factor = operational_record.emission_factor_id
              -> emission_factors row (must be ACTIVE and valid_from <= record_date
                 AND (valid_to IS NULL OR valid_to >= record_date))
      IF no valid factor found:
          SKIP + log a warning (don't fail the whole batch)
      ELSE:
          co2e = operational_record.quantity * factor.co2e_per_unit
          INSERT INTO carbon_transactions (
            organization_id, department_id,
            source_type = operational_record.source_type,
            operational_record_id = operational_record.id,
            emission_factor_id = factor.id,
            quantity = operational_record.quantity,
            co2e_emitted = co2e,
            calculation_type = 'AUTO',
            transaction_date = operational_record.record_date,
            created_by = NULL  -- system-generated
          )
          UPDATE operational_records SET is_processed = true WHERE id = operational_record.id
```

**Manual override:** when the toggle is off (or for ad-hoc entries), a user can `POST /carbon-transactions` directly with `calculation_type = 'MANUAL'`, no `operational_record_id` link required.

---

## 2. Evidence Requirement (CSR Activities)

**Toggle:** `esg_configurations.evidence_required_enabled` (org-level default) — can also be overridden per-activity via `csr_activities.evidence_required`.

**Trigger:** `PATCH /participations/:id/approve`

**Logic:**
```
effective_requirement = csr_activity.evidence_required OR org.evidence_required_enabled
IF effective_requirement == true AND employee_participation.proof_url IS NULL:
    REJECT the approve action -> 400 ValidationError
    ("Cannot approve without proof: evidence is required for this activity")
ELSE:
    SET employee_participations.approval_status = 'APPROVED'
    SET employee_participations.approved_by = current_user
    SET employee_participations.approved_at = now()
    SET employee_participations.points_earned = csr_activities.points_value
    UPDATE employees SET total_points_balance += points_earned WHERE employee_id = ...
    TRIGGER notification: CSR_APPROVAL_DECISION -> employee
    -> then re-run Badge Auto-Award check (Rule 4) for this employee
```

Same pattern applies to `PATCH /challenge-participations/:id/approve`, using `challenges.evidence_required` and awarding `xp_awarded` (set from `challenges.xp`) to `employees.total_xp` instead of points.

---

## 3. Reward Redemption

**Trigger:** `POST /rewards/:id/redeem`

**Logic:**
```
reward = SELECT * FROM rewards WHERE reward_id = :id AND organization_id = current_org
IF reward.status != 'ACTIVE': REJECT -> 409 ConflictError ("Reward unavailable")
IF reward.stock <= 0: REJECT -> 409 ConflictError ("Out of stock")
IF employee.total_points_balance < reward.points_required:
    REJECT -> 409 ConflictError ("Insufficient points balance")

-- all in one DB transaction:
BEGIN
  UPDATE employees SET total_points_balance -= reward.points_required WHERE employee_id = current_employee
  UPDATE rewards SET stock -= 1 WHERE reward_id = reward.id
  INSERT INTO reward_redemptions (employee_id, reward_id, points_spent, status)
    VALUES (current_employee, reward.id, reward.points_required, 'PENDING')
COMMIT
```
Never let stock go negative or balance go negative — check inside the transaction (or rely on the `CHECK (stock >= 0)` / `CHECK (total_points_balance >= 0)` constraints as a hard backstop, and catch the resulting DB error as a `ConflictError`).

---

## 4. Badge Auto-Award

**Toggle:** `esg_configurations.badge_auto_award_enabled`

**Trigger:** after any change to an employee's `total_xp`, `total_points_balance`, or completed-challenge count (i.e. call this check at the end of Rule 2's approve flows, and after challenge completion).

**Logic:**
```
IF badge_auto_award_enabled == false: RETURN (no-op)

candidate_badges = SELECT * FROM badges
                    WHERE organization_id = employee.organization_id AND status = 'ACTIVE'
                    AND badge_id NOT IN (SELECT badge_id FROM employee_badges WHERE employee_id = employee.id)

FOR EACH badge IN candidate_badges:
  rule = badge.unlock_rule   -- JSONB, e.g. {"metric":"total_xp","operator":">=","value":500}
  actual_value = resolve(rule.metric, employee)
      -- supported metrics: "total_xp", "total_points_balance", "completed_challenge_count"
      -- completed_challenge_count = COUNT(*) FROM challenge_participations
      --     WHERE employee_id = employee.id AND approval_status = 'APPROVED'
  IF compare(actual_value, rule.operator, rule.value) == true:
      INSERT INTO employee_badges (employee_id, badge_id) VALUES (employee.id, badge.id)
      TRIGGER notification: BADGE_UNLOCKED -> employee
```
`compare` supports at minimum: `>=`, `>`, `==`, `<=`, `<`. Keep the metric/operator vocabulary small and documented — don't let the agent invent new ones per badge without updating this resolver.

---

## 5. Compliance Issue Ownership & Overdue Flagging

**Trigger (creation):** `POST /compliance-issues` — `owner_employee_id` and `due_date` are REQUIRED fields, reject with `400 ValidationError` if missing. On successful creation, immediately send `COMPLIANCE_ISSUE_RAISED` notification to `owner_employee_id`.

**Trigger (overdue job, scheduled daily):**
```
FOR EACH compliance_issue WHERE status = 'OPEN' AND due_date < CURRENT_DATE:
    UPDATE compliance_issues SET status = 'OVERDUE' WHERE id = issue.id
    TRIGGER notification: ISSUE_OVERDUE -> issue.owner_employee_id
```
`v_overdue_compliance_issues` view already encodes the read-side of this (`status = 'OPEN' AND due_date < CURRENT_DATE`) — the job above is what actually flips the status and fires the notification.

---

## 6. Policy Acknowledgement Reminders

**Trigger:** scheduled job (e.g. weekly), or manual `POST /policies/:id/remind`.

**Logic:**
```
FOR EACH esg_policy WHERE status = 'ACTIVE' AND requires_ack = true:
  outstanding_employees = SELECT employee_id FROM employees
    WHERE organization_id = policy.organization_id AND status = 'ACTIVE'
    AND employee_id NOT IN (
        SELECT employee_id FROM policy_acknowledgements WHERE esg_policy_id = policy.id
    )
  FOR EACH employee IN outstanding_employees:
    TRIGGER notification: POLICY_ACK_REMINDER -> employee
```

---

## 7. Scoring — Department & Organization ESG Scores

This is the core rollup described in Section 5/6 of the problem statement.

### 7a. Department scores (stored in `department_scores`, one row per period)

Each pillar score is 0-100. Exact formulas are intentionally left flexible for the hackathon — pick simple, defensible ones and document them in your README. Suggested minimum viable formulas:

```
environmental_score (per department, per period) =
    100 - normalize(total_co2e_emitted_in_period, dept_baseline_or_peer_avg)
    -- simplest MVP: compare against the department's environmental_goals target;
    --   score = 100 * (1 - actual_co2e / target_co2e), clamped to [0, 100]

social_score (per department, per period) =
    weighted average of:
      - CSR participation rate = approved_participations / department_employee_count
      - challenge participation rate = approved_challenge_participations / department_employee_count
    -- simplest MVP: score = 100 * (participation_rate), clamped to [0, 100]

governance_score (per department, per period) =
    100
    - (open_compliance_issues * penalty_per_issue, weighted by severity)
    - (missing_policy_acknowledgements_pct * penalty_weight)
    -- simplest MVP:
    --   score = 100 - (overdue_issues * 10) - (100 * unacknowledged_policies / total_required_acks)
    --   clamped to [0, 100]

total_score (department) =
    environmental_score * (env_weight/100)
  + social_score        * (social_weight/100)
  + governance_score    * (gov_weight/100)
    -- weights come from esg_configurations for that organization
```

**Trigger:** `POST /scores/departments/:id/recalculate`, or scheduled job (`jobs/scoreRecalculation.job.ts`), typically nightly or weekly. Upserts a row into `department_scores` for the current `period_start`/`period_end` (e.g. current month).

### 7b. Organization score — NOT stored, computed live

`v_organization_score` (already in the schema) averages each department's **latest** `total_score`
per pillar, then applies `esg_configurations` weights again at the org level. `GET /scores/organization` just selects from this view — no job needed for this part.

---

## 8. Challenge Lifecycle

**Allowed transitions** (enforced in `challenges.service.ts`, `PATCH /challenges/:id/status`):

```
DRAFT         -> ACTIVE | ARCHIVED
ACTIVE        -> UNDER_REVIEW | ARCHIVED
UNDER_REVIEW  -> COMPLETED | ARCHIVED
COMPLETED     -> ARCHIVED   (terminal otherwise)
ARCHIVED      -> (terminal, no further transitions)
```
Any transition not in this table -> `400 ValidationError`. `csr_activities.status` reuses the same enum and the same transition table.

---

## 9. Notification dispatch

Every rule above that says "TRIGGER notification: X" means:
```
INSERT INTO notifications (organization_id, recipient_employee_id, event_type, title, message,
                            related_entity_type, related_entity_id)
VALUES (...)
```
Then, if `esg_configurations.notify_email = true`, also send an email (stub this with a console.log or a simple nodemailer call if time-constrained — in-app insert is the part that must work for the demo).

---

## 10. Quick reference: what each toggle in `esg_configurations` gates

| Toggle | Gates |
|---|---|
| `auto_emission_calculation_enabled` | Rule 1 |
| `evidence_required_enabled` | Rule 2 (org-level default; per-activity/challenge field can still require it independently) |
| `badge_auto_award_enabled` | Rule 4 |
| `notify_in_app` | Whether `notifications` rows get created at all |
| `notify_email` | Whether an email is additionally sent |
| `environmental_weight_pct` / `social_weight_pct` / `governance_weight_pct` | Rule 7 (must sum to 100 — enforced by DB CHECK constraint too) |
