# Ledgerify - Project Action Plan & Pending Items (TODO)

> **Status Snapshot**: Dev server running (`localhost:5173`). Repo migrated to GitHub with all 145 stars preserved and GitHub Pages live at `https://ahmadhassan-bted.github.io/.github/`.
> This document captures all open items, bug fixes, user questions, and feature requests ready to be picked up in the next session.

---

## 1. Direct Answers & UX Architecture Decisions

### Q1: "Why does it open stuff in the form of tabs? And why does it open tabs in a repeated way?"
- **Current Behavior**: The app currently treats each dataset/view like a dynamic browser tab, appending new tabs to the tab strip repeatedly whenever a view or dataset is opened. This clutters the UI and confuses non-technical users.
- **Solution for Next Session**:
  - **Remove repeated tab proliferation**. Replace the tab spam with **clean single-view in-place navigation** (matching the modern reference design).
  - When clicking "Executive", "Finance", "Inventory", etc., it smoothly switches the active view in-place—no new tabs created, no duplicate tabs accumulated.
  - If multiple datasets exist, switch them via a clean dataset selector pill/dropdown in the top navigation bar rather than opening new tabs.

### Q2: "Comparison should ONLY enable if 2 XLS files are uploaded, with naming & region dropdown (UK, USA, UAE, etc.)"
- **Solution for Next Session**:
  - **Gate Compare Mode**: The "Compare" toggle/button will remain disabled (with a tooltip "Upload a second dataset to enable comparison") until exactly 2 datasets are uploaded.
  - **Dataset Naming & Region Tagging on Upload**:
    - When a user uploads an Excel file, show a quick, elegant dialog:
      - **Dataset Name**: Text input with smart default (e.g., "UK Orders 2025" or "USA Store").
      - **Region Dropdown**: Pre-populated with popular regions:
        - 🇬🇧 United Kingdom (UK)
        - 🇺🇸 United States (USA)
        - 🇦🇪 United Arab Emirates (UAE)
        - 🇪🇺 European Union (EU)
        - 🇨🇦 Canada (CA)
        - 🇦🇺 Australia (AU)
        - 🌐 Global / Other
  - In Compare View, use these custom names and region flags in side-by-side metric headers (e.g. "🇬🇧 UK vs 🇺🇸 USA").

### Q3: "Dev Mode in Settings to show Health and Data Quality"
- **Solution for Next Session**:
  - Add a **"Developer & Data Quality Mode"** toggle in the Settings drawer/panel (default: **OFF**).
  - **When OFF (Standard Executive Mode)**: The interface is clean, uncluttered, and 100% focused on business KPIs, sales, customers, and inventory. No technical jargon, no raw schema logs.
  - **When ON (Dev Mode)**: Unlocks the Admin Data Quality view, sheet inspection logs, parsing health, and raw column mappings.

---

## 2. High Priority Bugs & Layout Fixes

- [ ] **Fix "Category Revenue Distribution" Card Overflowing Box**:
  - **Issue**: In `FinanceView.tsx` (and other views using `CategoryDonutChart`), the card contains the donut chart and legend items (`50ml`, `100ml`, `Discovery`, `Trio`, `Order`).
  - **Root Cause**: `CategoryDonutChart.tsx` currently applies `sm:flex-row`. When placed in a 1/3 grid column (`lg:col-span-1`), the screen width triggers `sm:flex-row`, attempting to fit a `192px` chart side-by-side with a `~180px` legend within a `~300px` container. This pushes the text and percentages outside the card border.
  - **Fix**:
    - Change `CategoryDonutChart` to a responsive stacked layout when inside compact containers (e.g. vertical stack or container query / flex-col by default).
    - Add `min-w-0` and truncation safeguards to all flex children.
    - Ensure all card containers have `overflow-hidden` or proper padding so elements strictly remain within their boxes.

- [ ] **Dashboard Outer Frame & Breathing Room**:
  - Ensure the main dashboard container does not cause horizontal scrollbars or bleed past the viewport.
  - Maintain breathing room matching the obsidian executive design reference (`max-w-7xl` or `max-w-[1400px]` with balanced margins).

---

## 3. High-Level Summary & Logical Grouping (Preventing User Overwhelm)

- [ ] **Top Customers & Top Stuff Showcase**:
  - Add high-level cards / leaderboards so executives instantly see:
    - **Top Customers**: Top spending VIP buyers, order counts, lifetime spend, status pills (`Achieved`, `On-Process`).
    - **Top Products / Scents**: Top revenue-generating fragrances and format yields.
    - **Top Geographic Hubs**: Dominant regions/countries.
  - Present summary totals first so users don't get bogged down in raw numbers before seeing the big picture.

- [ ] **Logical Dashboard Hierarchy**:
  - **Hero Bar**: Greeting ("Morning, Arthur" / "Welcome, Executive"), active dataset/region badge, timeframe selector.
  - **Primary Overview**: Core revenue/order KPIs + category breakdown.
  - **Analytical Performance**: Trajectory curve + customer activity patterns + top performers leaderboard.

---

## 4. Interactivity: Sortable Columns & Clickable Visualizations (Drill-Down)

- [ ] **Sortable Columns on Tables**:
  - Make all column headers in `Table.tsx` and data views interactive.
  - Clicking a header toggles sort between Ascending, Descending, and Default, displaying sort indicators (`▲`/`▼`).

- [ ] **Clickable Visualizations & In-Depth Drill-Down Modal**:
  - **Category Donut / Bar Charts**:
    - Clicking a category slice (e.g., `50ml`, `100ml`, `Discovery`) opens an **In-Depth Drill-Down Modal**.
    - Displays: total units sold for that format, revenue contribution, top scents in that format, and the itemized list of orders.
  - **Top Customers List**:
    - Clicking any customer opens their detailed customer dossier: past orders, items purchased, date history, and lifetime value.
  - **Activity Heatmap / Daily Charts**:
    - Clicking a day or bar reveals all orders placed during that time bucket.

---

## 5. Next Session Step-by-Step Implementation Checklist

1. [ ] **Card Overflow**: Fix `CategoryDonutChart.tsx` layout and add flex boundaries.
2. [ ] **Navigation & Tabs**: Eliminate tab duplication; make navigation switch views in-place.
3. [ ] **Compare Mode Gating & Region Dropdown**:
   - Require 2 datasets to enable Compare.
   - Add naming input & Region dropdown (`UK`, `USA`, `UAE`, etc.) on upload.
4. [ ] **Settings Dev Mode**: Add "Developer & Data Quality Mode" toggle.
5. [ ] **Sortable Tables**: Add click-to-sort headers in `Table.tsx`.
6. [ ] **Drill-Down Modal**: Create `DrillDownModal.tsx` and wire click handlers to charts & customer rows.
7. [ ] **Build & Deploy**: Verify with `npm run build` and push to GitHub.
