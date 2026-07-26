# VetCloud Quality Sprint — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Fix all crash-level bugs, repair the broken theme system, remove dead code, and consolidate duplicated patterns — making the app stable, visually consistent, and maintainable.

**Architecture:** Phase-based approach: crash bugs → theme repair → dead code removal → structural consolidation. Each phase produces a working, testable app. No new features — only fixes and cleanup.

**Tech Stack:** Expo (React Native web), TypeScript, react-native-paper, lucide-react-native, Express serverless, Neon PostgreSQL

## Global Constraints

- No new npm dependencies
- All changes must pass 
px expo export --platform web without new TS errors
- Existing pre-existing TS errors (4) are out of scope: dd-paciente.tsx birth_date null, disease/[id].tsx:70, pet/[id].tsx:1345 whiteSpace, seed-diseases.ts:673
- Preserve existing API contract with server.js — no backend changes unless fixing a crash
- All new code uses theme tokens from constants/tokens.ts and constants/colors.ts
- Commit after each phase

---

## Phase 1: Crash-Level Bug Fixes (P0)

### Task 1: Fix inventario.tsx missing handleDelete

**Files:**
- Modify: pp/(drawer)/inventario.tsx:116

**Problem:** Line 116 calls handleDelete(item) but this function is never defined. The confirmDelete state (line 42) and modal (lines 183-192) exist but nothing bridges them.

**Fix:**

- [ ] **Step 1: Add the missing handleDelete function**

Add after openEdit (line 51), before handleSave (line 53):

`	ypescript
const handleDelete = (item: any) => {
  setConfirmDelete({ name: item.name, id: item.id });
};
`

- [ ] **Step 2: Verify the fix compiles**

Run: 
px expo export --platform web 2>&1 | Select-String "inventario"
Expected: No errors referencing inventario.tsx

- [ ] **Step 3: Commit**

`ash
git add app/\(drawer\)/inventario.tsx
git commit -m "fix: add missing handleDelete function in inventario"
`

---

### Task 2: Fix diseases.tsx dead route

**Files:**
- Modify: pp/(drawer)/diseases.tsx:47
- Verify: pp/disease/[id].tsx exists

**Problem:** Disease cards navigate to /disease/\ but we need to verify the route exists and works.

- [ ] **Step 1: Verify disease/[id].tsx exists**

`ash
Test-Path "app/disease/[id].tsx"
`

Expected: True. If false, this is a bigger issue — skip to note below.

- [ ] **Step 2: Check if disease/[id].tsx has runtime issues**

Read pp/disease/[id].tsx and verify it:
1. Exports a default component
2. Uses useLocalSearchParams to get the id
3. Fetches disease data from the API
4. Has a proper loading/error state

If the file exists and works, the bug is that the route path is wrong (it should be inside pp/(drawer)/ since diseases.tsx is in the drawer). Check the drawer layout's Stack.Screen registrations.

- [ ] **Step 3: Fix the route path if needed**

If pp/disease/[id].tsx is at root level but diseases.tsx is in the drawer, the navigation may not work. Two options:
- **Option A:** Move pp/disease/[id].tsx → pp/(drawer)/disease/[id].tsx so it's inside the drawer navigator
- **Option B:** Keep it at root level and verify the relative path resolves correctly

- [ ] **Step 4: Commit**

`ash
git add app/\(drawer\)/diseases.tsx app/disease/
git commit -m "fix: resolve disease detail route navigation"
`

---

### Task 3: Fix ThemeContext missing isDark dependency

**Files:**
- Modify: contexts/ThemeContext.tsx:49

**Problem:** The useMemo depends on [user?.color_palette] but not user?.theme_preference. When the user toggles dark mode without changing palette, colors don't recompute.

**Fix:**

- [ ] **Step 1: Add isDark to the useMemo dependency array**

Change line 49 from:
`	ypescript
}, [user?.color_palette]);
`
to:
`	ypescript
}, [user?.color_palette, user?.theme_preference]);
`

- [ ] **Step 2: Verify the fix**

The useMemo now recomputes when either palette or theme preference changes. Dark mode toggle should work instantly.

- [ ] **Step 3: Commit**

`ash
git add contexts/ThemeContext.tsx
git commit -m "fix: add theme_preference to ThemeContext useMemo deps"
`

---

### Task 4: Fix services/files.ts missing auth headers

**Files:**
- Modify: services/files.ts

**Problem:** File upload doesn't include auth headers — unauthenticated uploads possible.

- [ ] **Step 1: Read services/files.ts and add authHeaders**

`	ypescript
import { authHeaders } from './auth';

// In the upload function, add authHeaders to the fetch call:
const res = await fetch(url, {
  method: 'POST',
  headers: {
    ...authHeaders(),
  },
  body: formData,
});
`

- [ ] **Step 2: Commit**

`ash
git add services/files.ts
git commit -m "fix: add auth headers to file upload"
`

---

### Task 5: Fix services/directus.ts get() methods fetching all records

**Files:**
- Modify: services/directus.ts:237,267

**Problem:** pi.diseases.get(id) fetches ALL diseases then picks d[0]. Same for appointments. This is O(n) per get-by-ID call.

**Fix:**

- [ ] **Step 1: Change get() methods to use direct ID endpoint**

For diseases (line 237), change:
`	ypescript
get: (id: string) => apiGet('/items/diseases', { id }).then((d: any[]) => d[0] || null),
`
to:
`	ypescript
get: (id: string) => apiGet(/items/diseases/\),
`

Do the same for appointments.get() — find the matching line and change from list-with-filter to direct ID fetch.

- [ ] **Step 2: Verify server.js supports single-item GET**

Read server.js and find the GET /items/diseases/:id route. If it doesn't exist, we need to add it. If it does, verify it returns { data: {...} } shape.

- [ ] **Step 3: Commit**

`ash
git add services/directus.ts
git commit -m "fix: use direct ID endpoint for get-by-id instead of fetching all"
`

---

### Task 6: Fix services/auth.ts cold start race condition

**Files:**
- Modify: services/auth.ts
- Modify: services/directus.ts
- Modify: services/files.ts

**Problem:** uthHeaders() uses module-level storedToken which is 
ull until getToken() is called. On cold start, API calls before getToken() resolves will send no auth header.

**Fix:**

- [ ] **Step 1: Make authHeaders async, always read from AsyncStorage**

Change uthHeaders to:
`	ypescript
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: Bearer \ } : {};
}
`

- [ ] **Step 2: Update all callers of authHeaders()**

Search for uthHeaders() calls across the codebase. Each caller must now wait the result. Key files:
- services/directus.ts — all piGet, piPost, piPatch, piDelete calls
- services/files.ts — file upload

In directus.ts, the helper functions (piGet, piPost, etc.) already handle headers. Update them to use wait authHeaders().

- [ ] **Step 3: Commit**

`ash
git add services/auth.ts services/directus.ts services/files.ts
git commit -m "fix: make authHeaders async to prevent cold start race condition"
`

---

## Phase 2: Theme System Repair (P2)

### Task 7: Create centralized STATUS_COLORS constant

**Files:**
- Modify: constants/colors.ts

**Problem:** STATUS_CONFIG is duplicated in 3 files with hardcoded hex values. A centralized STATUS_COLORS exists but is unused.

- [ ] **Step 1: Add a unified STATUS_COLORS map to colors.ts**

Add after the existing palette definitions:

`	ypescript
export const STATUS_COLORS = {
  programada: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  confirmada: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  en_consulta: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  completada: { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' },
  cancelada: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  no_asistio: { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
} as const;

export type AppointmentStatus = keyof typeof STATUS_COLORS;
`

- [ ] **Step 2: Commit**

`ash
git add constants/colors.ts
git commit -m "feat: add centralized STATUS_COLORS constant"
`

---

### Task 8: Replace hardcoded STATUS_CONFIG in AppointmentCard

**Files:**
- Modify: components/agenda/AppointmentCard.tsx:34-43,188,192

- [ ] **Step 1: Import STATUS_COLORS and replace local STATUS_CONFIG**

Remove the local STATUS_CONFIG object (lines 34-43). Import STATUS_COLORS from constants/colors.ts. Update all references to use the new constant.

- [ ] **Step 2: Replace hardcoded text colors at lines 188,192**

Change:
`	ypescript
color: '#1A2332'  →  color: colors.text
color: '#8896A8'  →  color: colors.textLight
`

- [ ] **Step 3: Commit**

`ash
git add components/agenda/AppointmentCard.tsx
git commit -m "fix: replace hardcoded colors in AppointmentCard with theme tokens"
`

---

### Task 9: Replace hardcoded colors in AppointmentDetailModal

**Files:**
- Modify: components/agenda/AppointmentDetailModal.tsx:6,8-17,195-196,246-250

- [ ] **Step 1: Replace Ionicons with lucide-react-native**

Change the import from Ionicons to appropriate lucide icons (e.g., AlertTriangle, Clock, User).

- [ ] **Step 2: Replace local STATUS_CONFIG with imported STATUS_COLORS**

- [ ] **Step 3: Replace hardcoded warning colors**

Change:
`	ypescript
backgroundColor: '#FEF3C7'  →  backgroundColor: colors.warning + '20'
color: '#B45309'  →  color: colors.warning
`

- [ ] **Step 4: Replace hardcoded shadow with SHADOWS token**

Change:
`	ypescript
shadowColor: '#000', shadowOpacity: 0.15, ...  →  ...SHADOWS.md
`

- [ ] **Step 5: Commit**

`ash
git add components/agenda/AppointmentDetailModal.tsx
git commit -m "fix: replace hardcoded colors and Ionicons in AppointmentDetailModal"
`

---

### Task 10: Replace hardcoded colors in AgendaSidebar

**Files:**
- Modify: components/agenda/AgendaSidebar.tsx:36-43

- [ ] **Step 1: Replace local STATUS_COLORS with imported centralized version**

Remove the local status color definitions. Import from constants/colors.ts.

- [ ] **Step 2: Commit**

`ash
git add components/agenda/AgendaSidebar.tsx
git commit -m "fix: use centralized STATUS_COLORS in AgendaSidebar"
`

---

### Task 11: Replace hardcoded colors in CurrentTimeLine

**Files:**
- Modify: components/agenda/CurrentTimeLine.tsx:67-90

- [ ] **Step 1: Replace hardcoded hex colors with theme tokens**

| Line | Hardcoded | Replacement |
|------|-----------|-------------|
| 67 | '#EF4444' | colors.error |
| 78 | '#EF4444' | colors.error |
| 84 | '#FEF3C7' | colors.warning + '20' |
| 90 | '#92400E' | colors.text |

- [ ] **Step 2: Commit**

`ash
git add components/agenda/CurrentTimeLine.tsx
git commit -m "fix: replace hardcoded colors in CurrentTimeLine"
`

---

### Task 12: Replace hardcoded colors in Sidebar

**Files:**
- Modify: components/layout/Sidebar.tsx:54-56,104,134,170,197

**Problem:** Sidebar uses hardcoded navy+gold colors that break on bright anime palettes.

- [ ] **Step 1: Replace hardcoded colors with theme tokens**

| Line | Hardcoded | Replacement |
|------|-----------|-------------|
| 55 | '#FFFFFF' | colors.textOnPrimary (define if needed) |
| 56 | '#FFFFFF99' | colors.textOnPrimary + '99' opacity |
| 104 | 'rgba(201,162,39,0.12)' | colors.accent + '1E' |
| 134 | 'rgba(201,162,39,0.12)' | Same |
| 170 | 'rgba(201,162,39,0.12)' | Same |
| 197 | orderTopColor: '#C9A227' | colors.accent |

- [ ] **Step 2: Add textOnPrimary token if needed**

Check if colors.textOnPrimary exists in the palette. If not, add it to constants/colors.ts for each palette variant.

- [ ] **Step 3: Commit**

`ash
git add components/layout/Sidebar.tsx constants/colors.ts
git commit -m "fix: make Sidebar theme-aware for all palettes"
`

---

### Task 13: Replace remaining hardcoded colors (batch)

**Files:**
- Modify: components/agenda/DaySummary.tsx:43-46
- Modify: components/agenda/DayHeader.tsx:70
- Modify: components/ui/GoldDivider.tsx:16-17
- Modify: pp/(drawer)/agenda.tsx:48-49
- Modify: pp/(drawer)/reportes.tsx:12-15
- Modify: components/agenda/AppointmentBlock.tsx:96,100
- Modify: components/agenda/AgendaToolbar.tsx:154-155

- [ ] **Step 1: Fix each file in batch**

For each file, replace hardcoded hex values with the appropriate theme token.

Key replacements:
- DaySummary.tsx: Status colors → STATUS_COLORS
- DayHeader.tsx:70 → colors.accent
- GoldDivider.tsx → colors.accent + '40' and colors.accent + '80'
- genda.tsx error boundary → colors.error, colors.text
- eportes.tsx → Use a stats color array derived from theme
- AppointmentBlock.tsx → colors.text, colors.textLight
- AgendaToolbar.tsx → SPACING.sm, SPACING.md

- [ ] **Step 2: Commit**

`ash
git add -A
git commit -m "fix: replace remaining hardcoded colors across agenda and UI components"
`

---

## Phase 3: Dead Code Removal (P3)

### Task 14: Remove dead components

**Files:**
- Delete: components/agenda/AgendaHeader.tsx (if confirmed unused)
- Delete: components/agenda/AppointmentBlock.tsx (if confirmed unused)
- Delete: components/ui/Input.tsx (if confirmed unused)

- [ ] **Step 1: Verify each component is truly unused**

`ash
rg "AgendaHeader" --type ts --type tsx -l
rg "AppointmentBlock" --type ts --type tsx -l
rg "from.*ui/Input" --type ts --type tsx -l
`

- [ ] **Step 2: Delete confirmed unused files**

- [ ] **Step 3: Commit**

`ash
git add -A
git commit -m "chore: remove dead components (AgendaHeader, AppointmentBlock, ui/Input)"
`

---

### Task 15: Remove unused hooks/useStorage.ts

**Files:**
- Verify: hooks/useStorage.ts

- [ ] **Step 1: Check imports**

`ash
rg "from.*useStorage" --type ts --type tsx -l
`

If no results, it's dead code.

- [ ] **Step 2: Delete if unused**

- [ ] **Step 3: Commit**

`ash
git add -A
git commit -m "chore: remove unused hooks/useStorage.ts"
`

---

### Task 16: Remove AppointmentTooltip dead code

**Files:**
- Modify: pp/(drawer)/agenda.tsx
- Delete: components/agenda/AppointmentTooltip.tsx (if no other consumer)

- [ ] **Step 1: Remove tooltip state and rendering from agenda.tsx**

Remove the 	ooltip/setTooltip state, the AppointmentTooltip import, and its render block.

- [ ] **Step 2: Commit**

`ash
git add -A
git commit -m "chore: remove dead AppointmentTooltip code"
`

---

## Phase 4: Structural Consolidation (P4)

### Task 17: Extract shared utility functions

**Files:**
- Create: utils/date.ts
- Create: utils/format.ts
- Modify: Multiple agenda files

- [ ] **Step 1: Create utils/date.ts with shared functions**

`	ypescript
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return \-\-\;
}
`

- [ ] **Step 2: Create utils/format.ts with shared formatTimeRange**

`	ypescript
export function formatTimeRange(start: string, end: string): string {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  return \ - \;
}
`

- [ ] **Step 3: Update imports in all consuming files**

Files to update:
- components/agenda/useAgendaData.ts — replace local 	oLocalDateKey with import
- components/agenda/useAgendaLayout.ts — replace local 	oLocalDateKey with import
- components/agenda/AppointmentCard.tsx — replace local ormatTimeRange with import

- [ ] **Step 4: Commit**

`ash
git add utils/ components/agenda/
git commit -m "refactor: extract shared toLocalDateKey and formatTimeRange to utils/"
`

---

### Task 18: Consolidate duplicate components

**Files:**
- Evaluate: components/agenda/EmptyState.tsx vs components/ui/EmptyState.tsx
- Evaluate: components/agenda/SkeletonLoader.tsx vs components/ui/Skeleton.tsx

- [ ] **Step 1: Compare the two EmptyState components**

Read both files. Determine which has the richer API. Keep that one, delete the other, update imports.

- [ ] **Step 2: Compare the two Skeleton components**

Same process. The agenda SkeletonLoader is specialized for agenda layouts. The UI Skeleton is generic. Keep both if they serve different purposes.

- [ ] **Step 3: Update imports across the codebase**

- [ ] **Step 4: Commit**

`ash
git add -A
git commit -m "refactor: consolidate duplicate EmptyState and Skeleton components"
`

---

### Task 19: Fix getThumbnailUrl ignoring dimensions

**Files:**
- Modify: services/directus.ts:317-318

- [ ] **Step 1: Implement thumbnail URL with query params**

`	ypescript
export function getThumbnailUrl(id: string, width = 200, height = 200): string {
  return \/assets/\?width=\&height=\&fit=cover;
}
`

- [ ] **Step 2: Commit**

`ash
git add services/directus.ts
git commit -m "fix: implement getThumbnailUrl with dimension parameters"
`

---

## Verification Checklist

After all phases, run:

- [ ] 
px expo export --platform web — should complete with only the 4 pre-existing TS errors
- [ ] Manual test: toggle dark mode on/off — should re-derive colors instantly
- [ ] Manual test: click inventario trash icon — should show confirmation dialog
- [ ] Manual test: click disease card — should navigate to detail page
- [ ] Manual test: sidebar should adapt to anime palette colors
- [ ] Manual test: appointment cards should show correct status colors in all themes

---

## Summary

| Phase | Tasks | Impact |
|-------|-------|--------|
| Phase 1: Crash Fixes | 6 tasks | App stops crashing on critical paths |
| Phase 2: Theme Repair | 7 tasks | Dark mode + anime palettes work everywhere |
| Phase 3: Dead Code | 3 tasks | Cleaner codebase, less confusion |
| Phase 4: Structure | 3 tasks | DRY code, fewer duplicate components |
| **Total** | **19 tasks** | **Stable, consistent, maintainable** |
