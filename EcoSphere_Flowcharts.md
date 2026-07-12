# EcoSphere - Flowcharts (Admin, Employee, Combined)

Scope: **happy-path only** (no error/rejection branches). High-level, screen/action level — matches the previous workflow doc. Render these with any Mermaid-compatible viewer (GitHub, Notion, VS Code Mermaid extension, mermaid.live).

---

## 1. Admin Flow (Login → every module)

```mermaid
flowchart TD
    A[Admin Login] --> B[ESG Dashboard]

    B --> C[Carbon Mgmt]
    C --> C1[Configure Emission Factors]
    C1 --> C2[Enable Auto Emission Calculation]
    C2 --> C3[View Carbon Transactions]
    C3 --> C4[Set Sustainability Goals]
    C4 --> B

    B --> D[CSR Mgmt]
    D --> D1[Create CSR Activity]
    D1 --> D2[Review Employee Participation Submissions]
    D2 --> D3[Approve Submission]
    D3 --> D4[Points Credited + Notification Sent]
    D4 --> B

    B --> E[Challenge Mgmt]
    E --> E1[Create Challenge - Draft]
    E1 --> E2[Publish Challenge - Active]
    E2 --> E3[Review Challenge Participation]
    E3 --> E4[Approve Submission]
    E4 --> E5[XP Awarded]
    E5 --> E6[Mark Challenge Completed]
    E6 --> B

    B --> F[Badges Mgmt]
    F --> F1[Create Badge + Unlock Rule]
    F1 --> F2[Enable Badge Auto-Award]
    F2 --> F3[System Auto-Assigns Badge When Eligible]
    F3 --> B

    B --> G[Reward Mgmt]
    G --> G1[Create Reward - Points Required, Stock]
    G1 --> G2[Monitor Redemptions & Stock Levels]
    G2 --> B

    B --> H[Govern Mgmt]
    H --> H1[Publish ESG Policy]
    H1 --> H2[Track Policy Acknowledgements]
    H2 --> H3[Schedule Audit]
    H3 --> H4[Assign Auditor]
    H4 --> B

    B --> I[Compliance Issues]
    I --> I1[Issue Raised - from Audit]
    I1 --> I2[Assign Owner + Due Date]
    I2 --> I3[Track Status to Resolved]
    I3 --> B

    B --> J[Reports]
    J --> J1[Select Report Type]
    J1 --> J2[Apply Filters]
    J2 --> J3[Export PDF / Excel / CSV]
    J3 --> B

    B --> K[Settings/Notification]
    K --> K1[Configure Feature Toggles]
    K1 --> K2[Configure Notification Rules]
    K2 --> K3[Set ESG Score Weightage]
    K3 --> B

    B --> L[Profile]
    L --> B
```

---

## 2. Employee Flow (Login → every module)

```mermaid
flowchart TD
    A[Employee Login] --> B[ESG Dashboard]

    B --> C[CSR Activities]
    C --> C1[Browse Active CSR Activities]
    C1 --> C2[Join Activity]
    C2 --> C3[Upload Proof]
    C3 --> C4[Submit for Approval]
    C4 --> C5[Await Admin Approval]
    C5 --> C6[Points Credited + Notification]
    C6 --> B

    B --> D[Challenge]
    D --> D1[Browse Active Challenges]
    D1 --> D2[Join Challenge]
    D2 --> D3[Track Progress]
    D3 --> D4[Submit Proof Before Deadline]
    D4 --> D5[Await Admin Review]
    D5 --> D6[XP Awarded + Notification]
    D6 --> B

    B --> E[View Badges]
    E --> E1[View Unlocked Badges]
    E1 --> E2[View Locked Badges + Unlock Rule Progress]
    E2 --> B

    B --> F[Reward Store]
    F --> F1[Browse Reward Catalog]
    F1 --> F2[Select Reward]
    F2 --> F3[Redeem Using Points]
    F3 --> F4[Points Deducted + Stock Updated]
    F4 --> B

    B --> G[Policies Ack]
    G --> G1[View Published Policy]
    G1 --> G2[Acknowledge Policy]
    G2 --> B

    B --> H[Compliance Issues]
    H --> H1[View Issues Owned by Employee]
    H1 --> H2[Update Resolution Progress]
    H2 --> H3[Mark Resolved Before Due Date]
    H3 --> B

    B --> I[Assign Audits]
    I --> I1[View Assigned Audit]
    I1 --> I2[Record Audit Findings]
    I2 --> B

    B --> J[Profile]
    J --> J1[View XP, Points, Badges Summary]
    J1 --> B

    B --> K[Settings/Notification]
    K --> K1[Manage Notification Preferences]
    K1 --> B
```

---

## 3. Combined Flow — Admin ↔ Employee (all major loops)

Covers: **Challenge, CSR, Reward Redemption, Badge Unlock, Audit/Compliance.**

```mermaid
flowchart TD
    subgraph ADMIN[Admin Actions]
        A1[Create Challenge - Draft]
        A2[Publish Challenge - Active]
        A3[Review Challenge Submission]
        A4[Approve Submission]
        A5[Mark Challenge Completed]

        B1[Create CSR Activity]
        B2[Review CSR Submission]
        B3[Approve CSR Submission]

        C1[Create Reward in Catalog]

        D1[Create Badge + Unlock Rule]
        D2[Enable Badge Auto-Award]

        E1[Schedule Audit]
        E2[Assign Auditor]
        E3[Audit Finding Raises Compliance Issue]
        E4[Assign Owner + Due Date]
    end

    subgraph EMPLOYEE[Employee Actions]
        F1[Browse Active Challenge]
        F2[Join & Track Progress]
        F3[Submit Proof]
        F4[Receive XP]

        G1[Browse CSR Activity]
        G2[Join Activity]
        G3[Submit Proof]
        G4[Receive Points]

        H1[Browse Reward Store]
        H2[Redeem Reward with Points]
        H3[Points Deducted, Stock Reduced]

        I1[XP / Challenge Count Reaches Unlock Rule]
        I2[Badge Auto-Assigned + Notification]

        J1[Perform Assigned Audit]
        J2[Update Compliance Issue Status]
        J3[Resolve Issue Before Due Date]
    end

    %% Challenge loop
    A1 --> A2 --> F1 --> F2 --> F3 --> A3 --> A4 --> F4 --> A5

    %% CSR loop
    B1 --> G1 --> G2 --> G3 --> B2 --> B3 --> G4

    %% Reward redemption loop
    C1 --> H1 --> H2 --> H3

    %% Badge unlock loop (fed by XP/Points from Challenge & CSR)
    D1 --> D2
    F4 --> I1
    G4 --> I1
    D2 --> I2
    I1 --> I2

    %% Audit / Compliance loop
    E1 --> E2 --> J1 --> E3 --> E4 --> J2 --> J3
```

**How to read it:** each dashed pair of Admin/Employee columns is one loop. Example — Challenge loop: Admin publishes → Employee submits proof → Admin approves → Employee gets XP → Admin closes challenge. That same XP (plus CSR Points) feeds the Badge Unlock loop automatically.

---
