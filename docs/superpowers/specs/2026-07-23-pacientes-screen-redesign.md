# Pacientes Screen Redesign

**Date:** 2026-07-23
**Status:** Approved
**Reference:** Modern table-based patient management UI

---

## 1. Goal

Replace the current card-list patients screen with a professional table-based interface featuring filtering, tabs, pagination, CSV export, and a slide-in patient detail panel.

## 2. Data Layer Changes

### 2.1 DB Migration: `add-pet-last-visit.sql`

```sql
ALTER TABLE pets ADD COLUMN last_visit TIMESTAMP NULL;

-- Backfill from existing clinical_records
UPDATE pets SET last_visit = (
  SELECT MAX(date) FROM clinical_records WHERE pet_id = pets.id
);
```

### 2.2 server.js Auto-Update

In `POST /items/clinical_records` endpoint, after successful insert:

```sql
UPDATE pets SET last_visit = $1 WHERE id = $2
-- Values: [record.date, record.pet_id]
```

Also apply in `PATCH /items/clinical_records` if the date changes.

### 2.3 DirectusPet Interface Update

Add to `services/directus.ts`:

```ts
last_visit: string | null;
```

### 2.4 Computed Field: `is_active`

Derived client-side (no DB column):

```ts
function isActive(pet: DirectusPet): boolean {
  if (!pet.last_visit) return false;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(pet.last_visit) >= sixMonthsAgo;
}
```

- `true` = "Activo" (visited within 6 months)
- `false` = "Inactivo" (no visit in 6+ months or never visited)

## 3. Screen Layout

### 3.1 Header

- **Title:** "Pacientes"
- **Subtitle:** "Administra y consulta la información de tus pacientes"
- **Button:** "+ Nuevo Paciente" (top right, `colors.primary` bg, white text, navigates to `/(drawer)/add-paciente`)

### 3.2 Tabs Row

| Tab | Filter |
|-----|--------|
| Todos | Show all pets |
| Activos | `is_active === true` |
| Inactivos | `is_active === false` |

- Active tab: `colors.primary` underline (2px) + `TYPOGRAPHY.weights.bold`
- Inactive: `colors.textSecondary` + `TYPOGRAPHY.weights.medium`
- **Export button** right-aligned: download icon + "Exportar" text, `colors.primary` color

### 3.3 Filter Bar

| Element | Type | Options |
|---------|------|---------|
| Search | TextInput | Placeholder: "Buscar paciente..." — searches name, breed, tutor_name |
| Especie | Dropdown | Todos, Perros (dog), Gatos (cat) |
| Raza | Dropdown | Dynamically populated from visible pets (unique breeds) |
| Más filtros | Popover | Propietario (text input), Estado (Activo/Inactivo/Todos) |

### 3.4 Table

| Column | Width | Data Source |
|--------|-------|-------------|
| (checkbox) | 40px | Row selection state |
| Paciente | flex (min 200px) | Avatar (32px, photo or species emoji) + `name` (bold) |
| Especie | 100px | `species` → "Canino" / "Felino" |
| Raza | 120px | `breed` |
| Propietario | 140px | `tutor_name` or "Sin propietario" |
| Última visita | 110px | `last_visit` formatted or "Sin visitas" |
| Estado | 90px | Badge: "Activo" (blue soft) / "Inactivo" (orange soft) |
| (actions) | 40px | 3-dot vertical menu |

**Row interactions:**
- Hover → `colors.surfaceVariant` background
- Click → opens side panel
- Selected → `colors.primary` + 8% opacity background, checkbox checked

**3-dot menu items:**
- Ver ficha → navigates to `/pet/[id]`
- Editar → navigates to `/pet/[id]?edit=true`
- Eliminar → opens delete confirmation dialog

### 3.5 Pagination

- Position: bottom of table, left-aligned
- Text: "Mostrando X-Y de Z pacientes"
- Page buttons: `< 1 2 3 ... 10 >`
- Items per page: 10
- Active page: `colors.primary` bg, white text
- Inactive page: `colors.surfaceVariant` bg

### 3.6 Side Panel

**Trigger:** Click any table row (not the actions menu)

**Behavior:**
- Slides in from the right
- Width: 360px desktop, full-screen mobile (< 768px)
- Overlay: semi-transparent backdrop on mobile
- Close: X button in top-right corner

**Content (top to bottom):**
1. Header: Avatar (80px, photo or emoji) + Name + Species/Breed
2. Status badge: "Activo" / "Inactivo"
3. Divider
4. Quick stats row: Age | Weight | Sex (3 columns)
5. Divider
6. Owner section: Name, Phone, Email (with icons)
7. Divider
8. Last visit: formatted date or "Sin visitas registradas"
9. Button: "Ver ficha completa" → navigates to `/pet/[id]`

### 3.7 CSV Export

**Trigger:** Click "Exportar" button

**Behavior:**
- Export currently filtered/visible patients (respects active tab + filters)
- Columns: Nombre, Especie, Raza, Propietario, Telefono, Ultima visita, Estado
- File name: `pacientes_YYYY-MM-DD.csv`
- Encoding: UTF-8 with BOM for Excel compatibility
- Method: For web, create Blob + download link. For native, use `expo-sharing`.

## 4. Component Architecture

### 4.1 New Files

```
components/pacientes/
  PatientTable.tsx        — Main table wrapper (header + body + pagination)
  PatientRow.tsx          — Single table row (checkbox + cells + actions menu)
  PatientSidePanel.tsx    — Slide-in detail panel
  PatientFilters.tsx      — Search + dropdowns + Más filtros popover
  PatientTabs.tsx         — Todos/Activos/Inactivos tab bar
  PatientPagination.tsx   — Page navigation controls
  PatientEmptyState.tsx   — Empty state when no patients match filters
  exportCsv.ts            — CSV generation utility
```

### 4.2 Modified Files

```
app/(drawer)/pacientes.tsx     — Complete rewrite, orchestration layer
services/directus.ts           — Add last_visit to DirectusPet
server.js                      — Auto-update last_visit on clinical record CRUD
scripts/add-pet-last-visit.sql — DB migration
```

### 4.3 Component Props

**PatientTable:**
```ts
interface PatientTableProps {
  patients: DirectusPet[];
  loading: boolean;
  onSelectPatient: (pet: DirectusPet) => void;
  selectedPatient: DirectusPet | null;
  onDeletePatient: (pet: DirectusPet) => void;
}
```

**PatientRow:**
```ts
interface PatientRowProps {
  patient: DirectusPet;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onDelete: () => void;
}
```

**PatientSidePanel:**
```ts
interface PatientSidePanelProps {
  patient: DirectusPet | null;
  visible: boolean;
  onClose: () => void;
}
```

**PatientFilters:**
```ts
interface PatientFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  species: 'all' | 'dog' | 'cat';
  onSpeciesChange: (species: 'all' | 'dog' | 'cat') => void;
  breeds: string[];
  selectedBreed: string;
  onBreedChange: (breed: string) => void;
  ownerFilter: string;
  onOwnerFilterChange: (owner: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void;
}
```

**PatientTabs:**
```ts
interface PatientTabsProps {
  activeTab: 'all' | 'active' | 'inactive';
  onTabChange: (tab: 'all' | 'active' | 'inactive') => void;
  counts: { all: number; active: number; inactive: number };
  onExport: () => void;
}
```

**PatientPagination:**
```ts
interface PatientPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}
```

## 5. State Management

All state lives in `app/(drawer)/pacientes.tsx`:

```ts
// Filter state
const [searchQuery, setSearchQuery] = useState('');
const [species, setSpecies] = useState<'all' | 'dog' | 'cat'>('all');
const [selectedBreed, setSelectedBreed] = useState('all');
const [ownerFilter, setOwnerFilter] = useState('');
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

// UI state
const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
const [selectedPatient, setSelectedPatient] = useState<DirectusPet | null>(null);
const [sidePanelVisible, setSidePanelVisible] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [deleteTarget, setDeleteTarget] = useState<DirectusPet | null>(null);
```

**Derived data (useMemo):**
1. `activeStatus` — combine tab + statusFilter into a unified status filter
2. `filteredPatients` — apply all filters (search, species, breed, owner, status)
3. `uniqueBreeds` — extract unique breeds from filtered-by-species pets
4. `paginatedPatients` — slice for current page
5. `totalPages` — compute from filtered count / itemsPerPage

## 6. Styling

All components use theme tokens from `useTheme()`:

- **Table header:** `colors.surface`, `TYPOGRAPHY.weights.semibold`, `colors.textSecondary`
- **Table rows:** `colors.surface`, border bottom `colors.border`
- **Row hover:** `colors.surfaceVariant`
- **Row selected:** `colors.primary` + '0D' (8% opacity)
- **Status badge "Activo":** bg `#E3F2FD`, text `#1565C0`
- **Status badge "Inactivo":** bg `#FFF3E0`, text `#E65100`
- **Pagination active:** `colors.primary` bg, white text
- **Side panel:** `colors.surface` bg, shadow `SHADOWS.lg`
- **Card radius:** `RADIUS.lg` (18px)
- **Table row height:** ~60px

## 7. Responsive Behavior

| Breakpoint | Layout |
|-----------|--------|
| ≥ 1024px | Full table + side panel (360px) |
| 768-1023px | Table (condensed) + side panel overlay |
| < 768px | Stack layout: filters on top, simplified list, full-screen side panel |

## 8. Edge Cases

- **No patients:** Show empty state with paw icon + "No hay pacientes registrados" + "Nuevo Paciente" button
- **No match after filtering:** "No se encontraron pacientes con estos filtros" + clear filters link
- **Delete confirmation:** Same dialog pattern as current (Paper Dialog + Portal)
- **Loading state:** Skeleton rows (5 rows) while data fetches
- **Last visit null:** Display "Sin visitas" in grey text

## 9. Out of Scope

- Advanced CSV import
- Bulk actions (delete multiple, export selected)
- Drag-and-drop column reordering
- Server-side pagination (all data fetched client-side for now)
