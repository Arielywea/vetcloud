# Agenda Redesign V2 — Spec

## Goal
Rebuild the agenda screen from scratch to match the reference design: a premium Google Calendar-style weekly view with sidebar, search, filters, breed-enriched appointment blocks, and gold ornamental branding.

## Reference
User-provided screenshot showing a clean white calendar grid with color-coded appointment blocks, right sidebar with mini calendar + filters + summary, and gold ornamental dividers.

---

## 1. Data Model Changes

### 1.1 Extend `Appointment` interface
**File:** `services/directus.ts`

```typescript
export interface Appointment {
  id: string;
  user_id: string;
  patient_name: string;
  tutor_phone: string | null;
  start_time: string;
  end_time: string | null;
  appointment_type: 'consulta' | 'vacuna' | 'cirugia' | 'control' | 'terreno' | 'examenes' | 'hospitalizacion';
  description: string | null;
  veterinarian: string | null;
  status: 'programada' | 'completada' | 'pendiente' | 'cancelada';
  created_at: string;
}
```

### 1.2 New appointment type colors
**File:** `constants/colors.ts`

- `consulta`: `#3B82F6` (blue)
- `vacuna`: `#10B981` (green)
- `examenes`: `#8B5CF6` (purple) — NEW
- `cirugia`: `#F59E0B` (orange) — changed from red
- `hospitalizacion`: `#EC407A` (pink) — NEW
- `control`: `#06B6D4` (cyan) — changed from amber
- `terreno`: `#8D6E63` (brown)

### 1.3 DB Migration (Directus)
- Add column `veterinarian` (text, nullable) to `appointments` table
- Add column `status` (text, default value `'programada'`) to `appointments` table
- Existing rows get `status = 'programada'` and `veterinarian = NULL`

### 1.4 Breed enrichment
No schema change. At render time:
1. Fetch all pets once on mount via `api.pets.list()`
2. Build `Map<string, { species: string; breed: string }>` keyed by pet name
3. When rendering appointment blocks, look up breed from this map
4. Fallback: show no breed if pet not found

---

## 2. Component Architecture (14 files)

| # | File | Action | Purpose |
|---|---|---|---|
| 1 | `services/directus.ts` | Modify | Extend Appointment interface |
| 2 | `constants/colors.ts` | Modify | Add/fix appointment type colors |
| 3 | `components/agenda/AgendaHeader.tsx` | Rewrite | Page title, subtitle, search bar, user avatar, notification bell |
| 4 | `components/agenda/AgendaToolbar.tsx` | New | "+ Nueva Cita", "Hoy", nav arrows, date range, view switcher, "Filtros" |
| 5 | `components/agenda/WeekGrid.tsx` | Rewrite | 7-day time grid with appointment blocks, current time line |
| 6 | `components/agenda/DayGrid.tsx` | Rewrite | Single-day time grid |
| 7 | `components/agenda/MonthGrid.tsx` | Rewrite | Monthly calendar with dots + month navigation |
| 8 | `components/agenda/AgendaSidebar.tsx` | Rewrite | Mini calendar, filter dropdowns, day summary |
| 9 | `components/agenda/AppointmentBlock.tsx` | Rewrite | Color-coded block: time + patient name + breed |
| 10 | `components/agenda/TimeColumn.tsx` | Rewrite | Hour labels gutter |
| 11 | `components/agenda/CurrentTimeLine.tsx` | New | Red horizontal line at current time with label pill |
| 12 | `components/agenda/useAgendaLayout.ts` | Rewrite | Grid calculations, positioning |
| 13 | `components/agenda/useAgendaData.ts` | New | Data fetching, breed enrichment, filtering, search |
| 14 | `app/(drawer)/agenda.tsx` | Rewrite | Main orchestrator |

---

## 3. Layout Structure

### Desktop (≥1024px)
- Header: Gold ornament + "Agenda" title + subtitle | Search bar | Bell + Avatar
- Toolbar: "+ Nueva Cita" + "Hoy" | ← → + date range | View switcher + "Filtros"
- Main: Grid (flex:1) | Sidebar (280px)
- Footer: Color legend + gold ornament

### Mobile (<1024px)
- Header: Title + search icon (expandable)
- Toolbar: Horizontal scroll for nav + view switcher
- Full-width time grid (sidebar hidden)
- Bottom sheet trigger button "Filtros y Calendario"
- Bottom sheet: Mini calendar + filters + summary
- FAB: "+ Nueva Cita"

---

## 4. Visual Styling

### Colors
- Background: `#F7F8FB`
- Surface/cards: `#FFFFFF` + `border: 1px solid #DDE3EC`
- Primary navy: `#0B1D3A`
- Accent gold: `#C9A227`

### Time Grid
- Hour height: 36px (web), 28px (mobile)
- Hour labels: 11px, semibold, right-aligned in 44px gutter
- Hour lines: `hairlineWidth` solid `#DDE3EC`
- START_HOUR: 8, END_HOUR: 19

### Day Headers
- Day name: 11px uppercase semibold, `#5A6B80`
- Day number: 24×24 circle
  - Normal: 13px, `#1A2332`
  - Today (not selected): gold outline ring (`#C9A227`, 1.5px border)
  - Selected: navy filled (`#0B1D3A`), white text

### Appointment Blocks
- Position: absolute, top computed from time
- Left border: 3px solid by type color
- Background: type color + `18` hex (10% opacity)
- Border radius: 6px
- Padding: 4px 6px
- Content:
  - Time range: 10px bold, type color
  - Patient name: 11px semibold, `#1A2332`
  - Breed: 10px regular, `#8896A8` (if available)
- Min height: 24px

### Current Time Line
- Red horizontal line (`#EF4444`)
- 2px height
- Left label pill: "11:20" in 10px bold white on red background, 4px padding, border-radius 4px

### Sidebar (280px)
- White background, left border `1px solid #DDE3EC`
- Mini calendar: 7×6 grid, 14.28% width cells, today dot, selected = navy fill
- Filter section: "Filtros Rápidos" title (11px uppercase), dropdown selects
- Summary section: "Resumen del Día" with 4 rows (dot + label + count)
- "Limpiar Filtros" button: outline style

### Gold Ornaments
- Top: decorative SVG divider between header and toolbar
- Bottom: decorative SVG divider below legend
- Use existing gold color `#C9A227`

### Footer Legend
- Horizontal row, centered, with color dots (8×8) + labels (11px)
- Padding: 12px vertical
- Border-top: 1px solid `#DDE3EC`

---

## 5. Data Flow

```
API Layer:
  useAppointments() → appointments[]
  api.pets.list() → pets[] (fetched once)

Enrichment (useAgendaData hook):
  appointments + pets → enriched[] (with breed info)
  enriched + searchQuery → searched[] (client-side filter)
  searched + typeFilter + statusFilter + vetFilter → filtered[]

Layout (useAgendaLayout hook):
  filtered + selectedDate + view → {
    hours, hourHeight, dayAppointments, weekAppointments,
    monthDots, daySummary, totalGridHeight
  }

Render:
  view === 'week'  → WeekGrid
  view === 'day'   → DayGrid
  view === 'month' → MonthGrid (centered in main area)
  Desktop sidebar  → AgendaSidebar (always visible on ≥1024px)
  Mobile sidebar   → Bottom sheet (toggled by button)
```

### Search
- Client-side filter on: `patient_name`, `tutor_phone`, `description`, `veterinarian`
- Debounced (300ms)

### Filters
- **Type**: Dropdown with all appointment types
- **Status**: Dropdown (Todas, Programada, Completada, Pendiente, Cancelada)
- **Veterinarian**: Dropdown populated from unique vet names
- "Limpiar Filtros" resets all three

### Day Summary
Computed from filtered appointments for the selected day:
- Programadas, Completadas, Pendientes, Canceladas

---

## 6. Success Criteria

- [ ] Weekly grid renders with 7 day columns, compact time labels, appointment blocks with breed info
- [ ] Current time red line appears at correct position
- [ ] Day/Month views work and switch correctly
- [ ] Mini calendar in sidebar navigates months independently
- [ ] Search filters appointments client-side
- [ ] Type/Status/Vet dropdowns filter correctly
- [ ] "Limpiar Filtros" resets all filters
- [ ] Day summary shows correct counts
- [ ] Mobile layout: full-width grid + bottom sheet sidebar
- [ ] Gold ornamental dividers render at top and bottom
- [ ] All appointment types display with correct colors
- [ ] Existing functionality preserved (create, delete appointments)
