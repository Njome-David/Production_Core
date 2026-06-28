<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PROD_CORE

Academic front-end prototype (ENSPY Yaounde, 2025-2026). Multi-tenant manufacturing/production management system.

## Architecture

- **No backend.** All data comes from `lib/mock-db.ts` — seed data + TypeScript types. Wrapped in `providers/MockFeedProductionProvider.tsx` (React Context). No API routes, no database.
- **App Router** with two role-based shells: `manager/` and `operator/`, plus landing (`/`), login, and org-selector routes.

## Commands

Only these scripts exist in `package.json`:
- `npm run dev` — next dev (Turbopack)
- `npm run build` — next build
- `npm run start` — next start
- `npm run lint` — eslint (v9 flat config, `eslint.config.mjs`)

No test, typecheck, or format scripts. No test framework installed.

## Config quirks

- **Tailwind v4**: uses `@import 'tailwindcss'` in CSS, not `@tailwind` directives. Configured via `postcss.config.mjs` + `@tailwindcss/postcss`.
- **ESLint**: flat config (`eslint.config.mjs`), extends `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`.
- **TypeScript**: strict mode, `@/*` path alias maps to `./*`.
- **No formatter** (Prettier, Biome, etc.) configured.
- **No `opencode.json`** exists.

## Testing

No test framework is installed. Do not attempt to run tests.

## Test login

```
Email:    david@alpha-feed.com
Password: password
```

## Other notes

- `AGENTS.md` and `CLAUDE.md` are gitignored (`.gitignore` line 44-45). Agent instruction changes are not tracked by git.

## Session Progress (June 19, 2026)

### DONE — Session 1

**i18n (EN/FR/ES)**
- Created `lib/i18n/dictionary.ts` ~300 keys across EN/FR/ES
- Moved `LanguageProvider` to `providers/LanguageProvider.tsx`, wrapped root layout
- Translated all pages: landing, login, org-selector, manager (dashboard, insights, inventory, settings, profile), operator (select-station, tablet, profile), sidebar, drawer
- Built-in language switcher on profile and landing header

**Product image & notice**
- Added `imageUrl`, `notice` fields to `Product` type in `lib/mock-db.ts`
- Seed data has real Unsplash URLs + notice text per product

**Settings product modal — third tab**
- Added "Notice & Indications" tab with file upload (→ base64 data URL), live preview, "Remove Image" button, and free-form notice textarea
- Product header (image + name + SKU) pinned above all 3 tabs

**Operator tablet — right panel tabs**
- Tabbed: BOM | Product Info (always) + QC Parameters (gate stations only)
- Product Info tab shows: image, name/SKU, next routing machine, notice/indications, QC action
- QC Parameters tab lists all parameters with min/max/tolerance

**Select-station order counts**
- Each machine/gate card shows PENDING / IN PROGRESS / COMPLETED badge counts (hidden when 0)

**Quality gate costs**
- Added `opCostPerHour`, `operationRate` to `QualityGate` type + seed data costs
- Added `timeInHours` to product quality gate assignments
- QC form in settings now has opCost and throughput fields
- QC costs included in routing cost calculations (settings save + dashboard estCost)

**Timer countdown (not count-up)**
- Reworked `useResilientChronometer` hook: accepts `totalSeconds` + `onComplete` callback
- Counts down from routing step time × 3600 to 0
- Auto-advances MO to next machine/gate when timer hits 0
- Red text warning when < 60s remain
- Persists to localStorage (survives refresh)

**Operator profile — back button**
- Added "Back to Select Station" link at top

**Bottleneck test data**
- Product "Flat Pack Shelf Kit" (SKU-BN-01) routing through `mac_saw_1` → `mac_cnc_1` → `mac_spray_1`
- 4 bottleneck orders: 1 completed, 1 in-progress, 2 pending (3 compete for `mac_cnc_1`)
- BOM uses existing materials

**Material insufficiency checks (dashboard launch order)**
- Validates BOM material quantities against inventory before creating MO
- **Blocks** if insufficient (balance < required) — shows red per-material breakdown
- **Warns** if quantity after deduction falls below threshold — shows amber breakdown
- "Continue Anyway" button for warnings (not for errors)
- Deducts materials via `recordInventoryTransaction(CONSUMPTION)` on order creation

### LEFT TO DO — Next Session

1. **FIFO bottleneck management**: When multiple PENDING orders target the same machine, display queue and auto-assign next in FIFO order after current MO completes. Currently the tablet selects the first match via `find()` — needs explicit queue display + FIFO dispatch.

2. **Material consumption in operator tablet**: Deduct BOM materials in real-time when order starts (not just at launch). Show running material balance during execution. Flag imminent shortages.

3. **Order history / traceability**: Log completed MOs with timestamps, machine routing path, QC results, scrap logged. Display in manager dashboard.

4. **Bottleneck visualization**: Highlight machines with the most queued orders in select-station cards (e.g. "3 PENDING" badge in red/orange when count > 1). Show wait-time estimate.

5. **Notifications system**: Global notification bell in shell headers for material warnings, order completions, machine maintenance.

6. **Polish & edge cases**:
   - Empty states for operator tablet when no MO at station after countdown auto-advance
   - Handle case where totalSeconds = 0 (no routing step time defined) — show infinite timer instead of countdown
   - Handle duplicate MO dispatch to same machine (prevent double-booking)

7. **Possible refinements**:
   - Gate `timeInHours` defaults to 0.25h if not set — might need explicit required field
   - The chronometer `setState` in `useEffect` triggers React 19 lint warning but is functionally correct
   - `any` types in settings page and tablet (pre-existing, not introduced by us)
