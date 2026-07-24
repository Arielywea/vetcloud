# Task 3 Report: Utility Files (isActive + CSV Export)

## Status: ✅ Complete

## Files Created

### `utils/patientFilters.ts`
- `isActive(pet)`: Returns true if `last_visit` is within the last 6 months
- `filterByStatus(pets, status)`: Filters by 'all' | 'active' | 'inactive'
- Type exported: `StatusFilter`

### `utils/exportCsv.ts`
- `exportCsv(patients, filename)`: Generates CSV with UTF-8 BOM
- Headers: Nombre, Especie, Raza, Propietario, Telefono, Ultima visita, Estado
- Web: Blob download via anchor click
- Native: expo-file-system write + expo-sharing share
- Escapes commas, quotes, newlines per CSV spec

## Verification
- TypeScript errors: Only pre-existing `@types/node` vs `react-native` conflicts (not from our files)
- `expo-sharing` / `expo-file-system` are dynamic imports for mobile builds — expected to resolve at runtime
- Commit: `6d9731d` — "feat: add isActive utility and CSV export function"
