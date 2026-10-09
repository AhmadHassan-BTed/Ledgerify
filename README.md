# Ledgerify — Shopify Excel Ledger Intelligence Dashboard

> **A resilient, high-performance client-side analytics platform for Shopify Excel exports with Obsidian dark aesthetics, multi-department intelligence, and dataset comparison.**

---

## ✦ Key Architectural Principles

Ledgerify is engineered with strict adherence to **Separation of Concerns (SoC)** and **Dependency Injection (DI)**, ensuring complete modularity, testability, and zero tight coupling.

```
src/
├── types/                # Domain contracts (NormalizedOrder, Dataset, Analytics models)
├── core/
│   ├── parser/           # SheetJS workbook parser & resilient header normalizer
│   │   ├── IFileParser.ts
│   │   ├── normalizer.ts
│   │   └── xlsxParser.ts
│   ├── storage/          # Client-side IndexedDB persistence abstraction
│   │   ├── IStorageService.ts
│   │   └── indexedDbStorage.ts
│   ├── services/         # Pure domain services (single responsibility)
│   │   ├── FinanceService.ts
│   │   ├── ExecutiveService.ts
│   │   ├── InventoryService.ts
│   │   ├── OperationsService.ts
│   │   ├── AdminDataQualityService.ts
│   │   ├── CreativeService.ts
│   │   ├── MarketingService.ts
│   │   ├── CompareService.ts
│   │   └── SampleDataLoader.ts
│   └── di/               # IoC Container wiring all services via DI
│       └── container.ts
├── context/              # React Context Providers consuming injected services
│   ├── ServiceContext.tsx
│   ├── DataContext.tsx
│   └── FilterContext.tsx
└── components/
    ├── layout/           # Obsidian top navigation, dataset switcher, filter bar
    ├── ui/               # Reusable atomic cards, radial gauges, heatmaps, tables
    ├── charts/           # Obsidian-styled Recharts (area, stacked bars, donuts)
    └── views/            # 8 dedicated team perspective dashboards
```

---

## ✦ 8 Dedicated Departmental Views

1. **Executive (CEO) View**:
   - Month-over-Month (MoM) revenue & volume trajectory.
   - Customer retention rate (unique email duplicate analysis).
   - Radial goal gauge pacing toward monthly targets.
   - New vs. returning buyer acquisition split.

2. **Finance Team View**:
   - Gross & net ledger revenue, Average Order Value (AOV).
   - Category breakdowns (100ml, 50ml, Trio Sets, Discovery Sets).
   - Refund & chargeback liabilities audit table.
   - Stacked monthly category revenue bar charts.

3. **Inventory Management View**:
   - Fragrance velocity parser splitting composite line items (`Visionary`, `Silk Odyssey`, etc.).
   - Top 10 fragrance velocity rankings with horizontal progress meters.
   - Reorder urgency triage table with last sale dates.
   - Physical volume share by bottle size.

4. **Operations & Fulfillment (Overviewer)**:
   - Weekly cycle heatmap tracking order density by day of the week for warehouse staffing.
   - Geographic delivery hotspots (cities & provinces).
   - Order packing complexity distribution (single item vs. multi-pack heavy boxes).
   - Logistics dispatch triage queue.

5. **Technical / Admin (Data Quality)**:
   - Traffic-light health banner (Green / Yellow / Red score).
   - Anomaly detection: Missing emails, missing cities, $0 test orders, high-quantity spikes.
   - Flagged orders audit table with actionable correction tags.

6. **Creative & Visuals (Graphics Studio)**:
   - Automated hero product selection for studio photography.
   - Visual hooks, lighting atmosphere guidelines, and ad format briefs for top 3 fragrances.
   - Packaging trend ratio (Trio gift sets vs solo bottles).
   - Scent demand word cloud pill layout.

7. **SEO & Growth Marketing**:
   - Geo-targeted ad spend allocation ranking top revenue cities.
   - Cross-selling cart affinity matrix (frequently co-purchased fragrance pairs).
   - Customer frequency tiers (single, repeat, VIP brand advocates).
   - Monthly repeat customer cohort retention.

8. **Comparative Analysis Engine**:
   - Multi-file side-by-side benchmarking (e.g. UK Orders vs US Orders).
   - Automated delta variance calculations (`+X%` / `-X%`).
   - Overlay time-series revenue curves.
   - Dimension-by-dimension comparison table.

---

## ✦ Design Aesthetics: Obsidian Dark Theme

Directly inspired by Obsidian's dark workspace:
- **Base Canvas**: Deep charcoal `#0d0d11` and `#121217` with subtle ambient radial glow.
- **Accents**: Signature Obsidian violet & purple (`#7c3aed`, `#8b5cf6`, `#a855f7`, `#c4b5fd`).
- **Cards**: Smooth glassmorphism with crisp `#272732` borders and rounded corners (`rounded-2xl`).
- **Typography**: Crisp Inter sans-serif paired with JetBrains Mono for monetary values and order IDs.

---

## ✦ Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation & Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/Ledgerify.git
cd Ledgerify

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser. The application automatically preloads the bundled UK sample ledger for instant demonstration!

### Building for Production
```bash
npm run build
```
Build output is saved to `./dist`, ready for static hosting on GitHub Pages, Cloudflare Pages, or Vercel.

---

## ✦ License
MIT License.
