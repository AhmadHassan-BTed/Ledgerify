# Changelog

All notable changes to the **Ledgerify** e-commerce analytics dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-10-13

### Fixed
- **Multi-Sheet Phantom Order Duplication (UK Orders 540 vs. 960)**:
  - Fixed an issue where workbooks with multiple sheets (such as `UK Orders.xlsx`) defaulted to `All Sheets (Combined)`, combining non-order reporting sheets (`Returning Cust.`, `Summary`, `Aug - Summary`, `Refunds`) into the active orders list.
  - Non-order sheets previously lacked an `Order #` column and had auto-generated IDs (`#1` ... `#418`), which bloated the total order volume from **540 orders** to **960 orders**.
  - Updated `XlsxParser` to detect and only parse true transaction ledgers (`isLedger`), skipping reference summary and customer frequency tables so zero phantom orders are produced.
  - Updated `DataContext` to default directly to the detected master `Ledger` sheet rather than forcing `All Sheets (Combined)`.
  - Updated `All Sheets (Combined)` logic to prefer the master `Ledger` sheet when present and strictly omit non-ledger sheets.

### Added
- **Customer Email Search**:
  - Global `FilterBar` search input now explicitly supports and guides customer email lookups (`Search by customer email (e.g. user@gmail.com), name, order #...`).
  - Added an inline search bar inside the **Customer Intelligence & VIP Leaderboard** card in `ExecutiveView` to search customers by email or name in real-time.
  - Prominently styled customer emails in monospace with click-to-select and direct dashboard filtering.
  - Added customer email search support inside `DrillDownModal` transaction registers.
- **Customer Order Frequency Filtering (2+ Orders)**:
  - Added `minCustomerOrders` state to `FilterContext` and a dedicated **Orders Placed** filter in `FilterBar`:
    - `All Buyers`
    - `2+ Orders (Repeat Buyers)`
    - `3+ Orders (Loyal Buyers)`
    - `5+ Orders (VIP Buyers)`
  - Selecting `2+ Orders` dynamically filters the entire dashboard (Net Revenue, Order Volume, Customer Retention, Charts, Cohorts) to only customers who have placed 2 or more orders (for UK: **87 repeat buyers**, **217 orders**, **£7,483.36**).
  - Added quick order tier filter pills (`All`, `2+ Orders`, `3+ Orders`, `VIP`) inside the Executive Overview Customer Leaderboard card.
  - Added a 1-click **"Apply 2+ Orders Filter to Dashboard"** shortcut.
  - Added a `2+ Orders` quick filter tab inside `DrillDownModal` transaction registers.
- **Customer Intelligence Directory Modal (`CustomerDirectoryModal.tsx`)**:
  - Added a modal accessible via **"Inspect All Buyers"** in the Executive Overview.
  - Browse, search by email or name, filter by order frequency tiers, and sort by lifetime spend, order count, or last order date.
  - Includes full CSV export (`Export CSV`) for the customer directory.
  - Direct links to open each customer's individual purchase dossier.

---

## [1.1.0] - 2026-10-12

### Added
- **Multi-Dataset Comparison Matrix**: Arbitrary N-way comparison across unlimited simultaneous files with custom baseline selection.
- **Geographic Distribution Mapping**: High-intent city detection and Meta/Google ad spend allocation recommendations.
- **Statistical Pacing & Regression Run-Rate Engine**: Linear regression for month-end forecast projections and daily pace targets.
- **Interactive Drill-Down Modals**: Full transaction registers for KPI cards, customer dossiers, category breakdowns, and revenue trajectories.
- **Multi-Tier Browser Session Persistence**: Dual IndexedDB and localStorage architecture preserving all workbook states, comparison setups, and active filters across page reloads.
- **Developer & Data Quality Audit Mode**: Data health scoring, missing field penalty auditing, anomaly detection, and dev-mode toggling in `SettingsModal`.

---

## [1.0.0] - 2026-10-10

### Added
- Initial release of Ledgerify e-commerce dashboard.
- Drag-and-drop `.xlsx` Shopify ledger file ingestion with dynamic column normalization.
- Executive CEO, Finance & P&L, Inventory & Stock, Operations & Logistics, and Marketing role-based views.
- Obsidian dark mode design with Tailwind CSS and role-based chromatic accent themes.
- Recharts-powered revenue line charts, stacked category breakdowns, and cohort retention visualizers.
