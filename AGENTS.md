<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PROD_CORE

Academic front-end prototype (ENSPY Yaounde, 2025-2026). Multi-tenant manufacturing/production management system.

## Architecture

- **No backend.** All data comes from `lib/mock-db.ts` — seed data. Types in `lib/types.ts`. Wrapped in `providers/MockFeedProductionProvider.tsx` (React Context). No API routes, no database.
- **App Router** with three role-based shells: `owner/` (NEW), `manager/`, and `operator/`, plus landing (`/`), login, register, and org-selector routes.
- **3 rôles** : `owner` (Chef d'entreprise), `manager` (Responsable d'agence), `operator` (Opérateur).
- **Auth mock** : `lib/auth.ts` + `providers/AuthProvider.tsx` — vérifie email+password contre mock-db, session persistée dans localStorage.

## Référence

- **Plan complet** : `phases.md` — 8 phases, dépendances, fichiers concernés.

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

## Comptes de test (Phase 1 — mock)

```
Chef d'entreprise  : david@alpha-feed.com / password
Resp. agence (multi): marie@alpha-feed.com / password123
Resp. agence (mono) : paul@alpha-feed.com / password123
Opérateur           : jean@alpha-feed.com / password123
Opérateur           : fatima@alpha-feed.com / password123
```

## Other notes

- `AGENTS.md` and `CLAUDE.md` are gitignored (`.gitignore` line 44-45). Agent instruction changes are not tracked by git.

## Session Progress (June 29, 2026)

### DONE — Phase 1 (Data Model & Seed Data)

**Types**
- Created `lib/types.ts` with all existing types extracted from `lib/mock-db.ts` + new entities (User, Organization, Agency, Employee, ThirdParty, Permission, CustomRole, Subscription, MachineAssignment, FinishedGoodsTransaction)
- `lib/mock-db.ts` now imports from `./types` and re-exports everything for backward compat

**Seed data added**
- 5 Users (1 owner, 2 managers, 2 operators) with real credentials
- 1 Organization ("Alpha Feed & Manufacturing")
- 3 Agencies (mixed fabrication/vente, fabrication only, vente only)
- 5 Employees linking users to org/agencies with roles
- 15 Permissions across 5 categories
- 3 Default custom roles (manager, operator, +1 custom)
- 4 ThirdParties (2 suppliers, 2 clients) with associated materials/products
- 1 Active subscription
- 2 MachineAssignments (operators linked to machines)
- 3 FinishedGoodsTransactions

**Permissions system**
- Created `lib/permissions.ts` with ALL_PERMISSIONS, DEFAULT_ROLES, roleHasPermission()

**Existing data preserved**
- All materials, products, BOMs, machines, quality gates, production lines, orders, ledger untouched
- Added `agencyId`, `orgId` fields with defaults for backward compat
