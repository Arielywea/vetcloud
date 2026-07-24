You are implementing Task 10: Main Screen Rewrite (pacientes.tsx) for the VetCloud Pacientes screen redesign.

## Task Description

Rewrite `app/(drawer)/pacientes.tsx` to use all the new components from Tasks 4-9.

**File to modify:** `app/(drawer)/pacientes.tsx` — complete rewrite

## Requirements

The new screen must:
1. Import and orchestrate all components: PatientTabs, PatientFilters, PatientTable, PatientSidePanel
2. State management for: searchQuery, species, selectedBreed, ownerFilter, statusFilter, activeTab, selectedPatient, sidePanelVisible, currentPage, selectedIds, deleteTarget
3. Combine tab + status filter into effectiveStatus
4. Compute uniqueBreeds from species-filtered pets
5. Apply all filters: species, search, breed, owner, status
6. Pagination with ITEMS_PER_PAGE = 10
7. Tab counts (all, active, inactive)
8. Reset page on filter changes via useEffect
9. clearFilters function resets all state
10. handleExport calls exportCsv with filteredPatients
11. handleDelete calls removePet
12. handleClickPatient opens side panel
13. handleToggleSelect manages selectedIds Set
14. Layout: header (title + subtitle + "Nuevo Paciente" button), PatientTabs, PatientFilters, PatientTable, PatientSidePanel, Delete Dialog (Portal)
15. Uses `usePets` from `../../hooks/useDirectus`
16. Uses `useRouter` from `expo-router`
17. Uses theme tokens from `constants/tokens.ts`
18. Uses `exportCsv` from `../../utils/exportCsv`
19. Uses `isActive`, `filterByStatus` from `../../utils/patientFilters`
20. Button "Nuevo Paciente" navigates to `/(drawer)/add-paciente`

## Context

This is the final integration task. Tasks 1-9 are complete:
- Tasks 1-3: DB migration, server.js auto-update, utility functions
- Tasks 4-8: PatientEmptyState, PatientTabs, PatientFilters, PatientRow, PatientTable, PatientPagination components
- Task 9: PatientSidePanel component (just committed as 855ef53)

All components are in `components/pacientes/`. The current `pacientes.tsx` is the old card-list version (242 lines). It must be fully replaced.

## Global Constraints

- Theme tokens only: `useTheme()` for colors, `SPACING`, `RADIUS`, `TYPOGRAPHY`, `SHADOWS` from `constants/tokens.ts`
- No new npm packages
- Font weights: only `regular` (400), `semibold` (600), `bold` (700)
- Border radius: `RADIUS.lg` (18px) for cards, `RADIUS.md` (10px) for smaller elements
- All TypeScript, no `any` types
- Follow existing code patterns

## Existing Components (all in `components/pacientes/`)

- `PatientTabs` — TabKey type: 'all' | 'active' | 'inactive', props: activeTab, onTabChange, counts, onExport
- `PatientFilters` — SpeciesFilter type: 'all' | 'dog' | 'cat', StatusFilter type: 'all' | 'active' | 'inactive', props: searchQuery, onSearchChange, species, onSpeciesChange, breeds, selectedBreed, onBreedChange, ownerFilter, onOwnerFilterChange, statusFilter, onStatusFilterChange
- `PatientTable` — props: patients, paginatedPatients, loading, selectedPatient, selectedIds, currentPage, totalPages, totalItems, itemsPerPage, hasFilters, onSelectPatient, onClickPatient, onDeletePatient, onToggleSelect, onPageChange, onClearFilters
- `PatientSidePanel` — props: patient, visible, onClose

## Design Direction

- Linear/Stripe/Vercel aesthetic
- Palette: Primary `#0A2463`, Accent `#C9A227`
- Inter typography (400/600/700), much space between elements

## Your Job

1. Read the current `app/(drawer)/pacientes.tsx` to understand what exists
2. Rewrite it completely with the new architecture
3. Verify the component compiles (web build)
4. Commit your work
5. Write report to `C:\Users\Ariel\vet-cloud\docs\superpowers\reports\task-10-report.md`

**Work from:** `C:\Users\Ariel\vet-cloud`

## Report Format

Write report to `C:\Users\Ariel\vet-cloud\docs\superpowers\reports\task-10-report.md`:
- What you implemented
- Files changed
- TypeScript errors (if any)
- Self-review findings
- Concerns (if any)

Then report back with:
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commits created (short SHA + subject)
- One-line test summary
- Concerns, if any
- The report file path
