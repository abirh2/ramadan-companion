# Ponytail Audit — Ramadan Companion

**Date:** 2026-07-03  
**Implemented:** 2026-07-03 (items 1–11, 14 below; items 7, 12, 13 deferred)

### Implementation log (2026-07-03)

| # | Status | Notes |
|---|--------|-------|
| 1 | ✅ Done | Deleted dead accessibility stack; kept `SkipLink` |
| 2 | ✅ Done | `@radix-ui/react-accordion` replaces `radix-ui` umbrella |
| 3 | ✅ Done | Removed 6 unused deps from `package.json` |
| 4 | ✅ Done | Trimmed `orientation.ts`; removed `@capacitor/motion` |
| 5 | ✅ Done | Deleted legacy `supabaseClient.ts` + Jest mock |
| 6 | ✅ Done | Merged into `HadithLanguageSelector` with `variant` prop |
| 7 | 🚧 Deferred | Favorites hook consolidation — medium risk, no behavior change needed now |
| 8 | ✅ Done | Added `src/lib/platform.ts`; unified iOS detection |
| 9 | ✅ Done | Deleted `useRequireAuth.ts`; docs updated |
| 10 | ✅ Done | Removed `formatAmount` passthrough wrappers |
| 11 | ✅ Done | Shortened `timezone.ts` JSDoc |
| 12 | 🚧 Deferred | `quran-hadith/page.tsx` split — works, high regression surface |
| 13 | 🚧 Deferred | Capacitor migration doc archive — docs-only, separate pass |
| 14 | ✅ Done | Deleted `tempt.txt` |

**Scope:** Over-engineering and complexity only (correctness, security, performance out of scope)  
**Method:** Repo-wide scan; ranked biggest cut first

---

## Executive Summary

The app is generally well-structured for its feature set (PWA + Capacitor hybrid, Supabase, prayer/Quran/Hadith). The largest wins are **dead accessibility infrastructure never wired into production**, **duplicate Radix UI packaging**, **unused dependencies**, and **parallel implementations** of the same patterns (favorites hooks, hadith language selectors, iOS detection).

**Estimated net if all recommendations applied:**

| Category | Lines | Dependencies |
|----------|------:|-------------:|
| Dead / unused code | ~750 | — |
| Consolidation (merge duplicates) | ~200 | — |
| Shrink (verbosity, passthrough wrappers) | ~90 | — |
| Optional doc archive | ~5,500 | — |
| **Total (code only)** | **~1,040** | **6–7** |
| **Total (incl. doc archive)** | **~6,540** | **6–7** |

---

## Ranked Findings

### 1. Dead accessibility stack (never imported in `src/`)

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `delete` | `src/lib/accessibility.ts` — 10 exported helpers; **zero production imports**. Only tested. | Inline the 2–3 helpers you actually need at call sites, or delete entirely until Phase 1 of ACCESSIBILITY_PLAN is real work. | `src/lib/accessibility.ts` |
| `delete` | `src/hooks/useAnnouncer.ts` — **zero production imports**. Duplicates live-region logic already in `accessibility.ts`. | Delete hook + tests; use Radix/shadcn built-in live regions where needed. | `src/hooks/useAnnouncer.ts` |
| `delete` | `src/lib/__tests__/accessibility.test.ts` + `src/hooks/__tests__/useAnnouncer.test.tsx` (~328 lines). | Delete with the modules they test. | `src/lib/__tests__/`, `src/hooks/__tests__/` |
| `delete` | `ACCESSIBILITY_PLAN.md` — plan references infrastructure that was built but never integrated. Status "In Progress" since 2025-11-19. | Archive or delete; update `docs/features.md` if any items remain actionable. | `ACCESSIBILITY_PLAN.md` |

**Keep:** `SkipLink` — it *is* used in `src/app/layout.tsx`.

**Effort:** Low. Safe delete batch (~630 lines + plan doc).

---

### 2. Duplicate Radix UI dependency strategy

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `yagni` | Both `radix-ui` (umbrella) **and** 9 `@radix-ui/react-*` packages in `package.json`. Accordion is the only component using the umbrella import. | Pick one: add `@radix-ui/react-accordion` and remove `radix-ui`, **or** migrate all shadcn primitives to umbrella imports and drop individual packages. | `package.json`, `src/components/ui/accordion.tsx` |

**Effort:** Low–medium. One package strategy, one lockfile churn.

---

### 3. Unused direct dependencies

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `delete` | `date-fns` — listed in `dependencies` but **never imported in `src/`**. Only pulled transitively by `react-day-picker`. | Remove from direct `dependencies`. | `package.json` |
| `delete` | `lightningcss` — direct dep; already provided by `@tailwindcss/postcss` / Tailwind 4 toolchain. | Remove direct dep; let Tailwind own the version. | `package.json` |
| `delete` | `@capacitor/motion` — imported only for dead code in `orientation.ts` (see #4). | Remove after deleting native orientation path. | `package.json`, `jest.setup.js` |
| `delete` | `whatwg-fetch` — devDependency, **zero imports** in codebase. Jest 30 + Node 22 have fetch. | Remove. | `package.json` |
| `delete` | `baseline-browser-mapping` — devDependency, **zero script/config references**. | Remove. | `package.json` |
| `delete` | `ts-node` — devDependency; scripts use `tsx` exclusively (`capture:social`). | Remove. | `package.json` |

**Effort:** Low. Run `npm install`, verify build + tests.

---

### 4. Dead code in `orientation.ts`

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `delete` | `startOrientationTrackingNative()` (~47 lines) — defined but **never called**. Comment in `startOrientationTracking()` explicitly routes to browser API only. | Delete function + `@capacitor/motion` import. | `src/lib/orientation.ts` |
| `delete` | `testOrientationAvailability()` — exported, **never called** outside the file. | Delete. | `src/lib/orientation.ts` |
| `delete` | `stopOrientationTracking()` — exported, **never called** (cleanup is returned from `startOrientationTracking`). | Delete. | `src/lib/orientation.ts` |
| `delete` | Unused `RotationRate` type import. | Delete import line. | `src/lib/orientation.ts` |

**Effort:** Low (~80 lines + one dep).

---

### 5. Legacy Supabase client

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `delete` | `src/lib/supabaseClient.ts` — legacy `@supabase/supabase-js` singleton. **No production imports**; only mocked in Jest. | Delete file; remove Jest mock block. All callers already use `@/lib/supabase/client` or `server`. | `src/lib/supabaseClient.ts`, `jest.setup.js` |

**Effort:** Trivial (~15 lines).

---

### 6. Duplicate hadith language selectors

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `yagni` | `LanguageSelector` and `HadithLanguageSelector` — same data source (`HADITH_LANGUAGES`), same Radix Select, different prop names and layout. | One component with a `variant?: 'compact' \| 'form'` prop (or `showLabel?: boolean`). | `src/components/hadith/LanguageSelector.tsx`, `src/components/hadith/HadithLanguageSelector.tsx` |

**Call sites:** `quran-hadith/page.tsx` (LanguageSelector), `HadithList.tsx` (HadithLanguageSelector).

**Effort:** Low (~40 lines saved).

---

### 7. Parallel favorites hooks

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `yagni` | `useQuranFavorites` and `useHadithFavorites` — nearly identical (~95 lines each): check on mount, toggle, auth gate. | Single `useFavoriteItem(type, data, checkFn, addFn, removeFn)` or shared base hook. | `src/hooks/useQuranFavorites.ts`, `src/hooks/useHadithFavorites.ts` |
| `yagni` | `useQuranBrowserFavorites` — batch variant for SurahReader; overlaps with `getFavorites` + Set pattern that a unified hook could expose as `useFavorites('quran')`. | Extend unified favorites hook with list mode. | `src/hooks/useQuranBrowserFavorites.ts` |

**Effort:** Medium (~120–150 lines net). Higher value than it looks — every new content type would copy this pattern again.

---

### 8. Triple iOS / browser detection

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `yagni` | `isIOS()` duplicated in `orientation.ts` and `notifications.ts`. | One export from `src/lib/platform.ts` (or reuse `notifications.ts` as canonical). | `src/lib/orientation.ts`, `src/lib/notifications.ts` |
| `yagni` | `getIOSBrowserType()` in `InstallPrompt.tsx` duplicates `getIOSBrowser()` in `notifications.ts` (different return strings). | Import and map, or unify return type once. | `src/components/InstallPrompt.tsx`, `src/lib/notifications.ts` |
| `shrink` | `openMapsApp()` re-detects iOS via raw UA regex. | Reuse shared `isIOS()`. | `src/lib/mapDirections.ts` |

**Effort:** Low (~40 lines).

---

### 9. `useRequireAuth` — documented but unused

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `delete` | `useRequireAuth` — **zero imports in `src/`**; only mentioned in `docs/auth-setup.md`. App uses `ProtectedFeature` wrapper instead. | Delete hook; remove doc references. | `src/hooks/useRequireAuth.ts` |

**Effort:** Trivial.

---

### 10. Charity `formatAmount` passthrough wrappers

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `shrink` | Four files define `const formatAmount = (amount, currency) => formatCurrency(amount, currency)` — identity wrappers. | Call `formatCurrency` directly. | `src/app/charity/page.tsx`, `src/components/charity/ListViewAccordion.tsx`, `src/components/charity/MonthlyView.tsx`, `src/components/charity/ZakatCalculator.tsx` |
| `shrink` | `CharityCard` defines local `formatCurrency` with hardcoded `$` instead of using `@/lib/currency`. | Use shared `formatCurrency(amount, 'USD')` or preferred currency. | `src/components/dashboard/CharityCard.tsx` |

**Effort:** Trivial (~20 lines).

---

### 11. Verbose JSDoc in `timezone.ts`

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `shrink` | ~40 lines of example blocks and coordinate validation comments for a function that wraps `geo-tz.find()`. | 5-line JSDoc + keep validation (or trust geo-tz). | `src/lib/timezone.ts` |

**Effort:** Trivial (~45 lines).

---

### 12. Monolithic `quran-hadith/page.tsx`

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `yagni` | 599-line page component mixing Quran tab, Hadith tab, favorites, language selectors, and daily content. | Extract `QuranHadithTabs`, `QuranDailyPanel`, `HadithDailyPanel` (or route split). Not urgent — works today. | `src/app/quran-hadith/page.tsx` |

**Effort:** Medium. Defer unless actively editing this page.

---

### 13. Capacitor migration doc sprawl

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `delete` | 12 phase/progress markdown files (~5,522 lines). Phase 1–2 marked complete; much content is historical checklist. | Collapse to `docs/capacitor-native.md` (one quick-reference + current status). Archive rest or move to wiki. | `docs/capacitor-migration/` |

**Effort:** Low for archive; medium if consolidating accurate current-state doc.

---

### 14. Root clutter

| Tag | Finding | Replacement | Path |
|-----|---------|-------------|------|
| `delete` | `tempt.txt` — informal UX feedback notes, not project documentation. | Move to issue tracker or delete. | `tempt.txt` |

**Effort:** Trivial.

---

## Recommended Execution Order

Do these in order — each step is independently shippable:

1. **Quick wins (1 PR):** Remove unused deps (#3), delete `supabaseClient.ts` (#5), delete `useRequireAuth` (#9), delete `tempt.txt` (#14).
2. **Dead code (1 PR):** Delete accessibility stack (#1), orientation dead paths (#4), drop `@capacitor/motion`.
3. **Consolidation (1–2 PRs):** Merge hadith language selectors (#6), unify iOS detection (#8), remove `formatAmount` wrappers (#10).
4. **Structural (when touching those areas):** Generic favorites hook (#7), Radix package strategy (#2), split `quran-hadith/page.tsx` (#12).
5. **Docs (optional):** Archive capacitor migration folder (#13), close or rewrite ACCESSIBILITY_PLAN (#1).

---

## Full Finding Index (ponytail format)

```
delete   accessibility.ts + useAnnouncer + their tests + ACCESSIBILITY_PLAN (~630 lines prod/tests). Nothing — wire SkipLink only. [src/lib/accessibility.ts, src/hooks/useAnnouncer.ts, ACCESSIBILITY_PLAN.md]
yagni    radix-ui umbrella + @radix-ui/react-* both installed. Pick one package strategy. [package.json, src/components/ui/accordion.tsx]
delete   date-fns direct dependency (unused in src). react-day-picker brings it transitively. [package.json]
delete   lightningcss direct dependency. @tailwindcss/postcss already depends on it. [package.json]
delete   @capacitor/motion after orientation dead path removed. Browser DeviceOrientationEvent only. [package.json, src/lib/orientation.ts]
delete   whatwg-fetch, baseline-browser-mapping, ts-node devDependencies. Nothing — unused. [package.json]
delete   startOrientationTrackingNative, testOrientationAvailability, stopOrientationTracking. Browser-only tracking already canonical. [src/lib/orientation.ts]
delete   supabaseClient.ts legacy singleton. @/lib/supabase/client + server. [src/lib/supabaseClient.ts, jest.setup.js]
yagni    LanguageSelector + HadithLanguageSelector. One component, variant prop. [src/components/hadith/]
yagni    useQuranFavorites + useHadithFavorites + useQuranBrowserFavorites. useFavorite(type) hook. [src/hooks/]
yagni    isIOS / getIOSBrowser duplicated 3 ways. src/lib/platform.ts (single source). [orientation.ts, notifications.ts, InstallPrompt.tsx, mapDirections.ts]
delete   useRequireAuth hook. ProtectedFeature wrapper already used. [src/hooks/useRequireAuth.ts]
shrink   formatAmount identity wrappers in charity views. formatCurrency directly. [src/app/charity/, src/components/charity/]
shrink   timezone.ts 40-line JSDoc essay. Short JSDoc. [src/lib/timezone.ts]
yagni    quran-hadith/page.tsx 599-line god component. Extract tab panels. [src/app/quran-hadith/page.tsx]
delete   docs/capacitor-migration/ phase docs (~5522 lines) after collapse. Single capacitor-native.md. [docs/capacitor-migration/]
delete   tempt.txt scratch notes. Issue tracker. [tempt.txt]

net: ~1,040 lines, ~6–7 deps possible (code only).
net: ~6,540 lines, ~6–7 deps possible (including doc archive).
```

---

## What Looks Lean Already

- `src/lib/utils.ts` — standard shadcn `cn()` helper; keep.
- `src/hooks/useAuth.ts` — thin context accessor; idiomatic React, not bloat.
- `src/lib/appleAuth.ts` — small, focused, uses Web Crypto correctly.
- `src/lib/rateLimit.ts` — honest about serverless limits; appropriate for scope.
- `src/lib/prayerTimes.ts` + `praytime` — legitimate offline fallback, not duplicate of API for its own sake.
- `ProtectedFeature` — used consistently; better than redirect hook for this UX.
- Puppeteer in `scripts/capture-pages.ts` — dev-only social capture tool; keep if used, not bloat.

---

## Out of Scope (route to normal review)

- Prayer notification timing semantics
- iOS compass `webkitCompassHeading` correctness (working code path — don't "simplify" away)
- RLS / auth security
- `quran-hadith/page.tsx` behavior correctness
- Whether capacitor hybrid architecture should change
