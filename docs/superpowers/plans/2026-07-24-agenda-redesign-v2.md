# Agenda Redesign V2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the agenda screen from scratch to match the reference design — a premium Google Calendar-style weekly view with sidebar, search, filters, breed-enriched appointment blocks, and gold ornamental branding.

**Architecture:** 14 components rewritten/created. Two new hooks (`useAgendaData`, `useAgendaLayout`). Data model extended with `veterinarian`, `status`, and 2 new appointment types. Breed info enriched from pets collection at render time.

**Tech Stack:** React Native (Expo), TypeScript, Directus REST API, lucide-react-native icons

## Global Constraints
- Platform: Web + Mobile (responsive, breakpoints at 768px and 1024px)
- Colors: Navy `#0B1D3A`, Gold `#C9A227`, Background `#F7F8FB`, Surface `#FFFFFF`
- Design tokens: `constants/tokens.ts` (SPACING, RADIUS, TYPOGRAPHY, SHADOWS)
- Existing palette: `constants/colors.ts` (APP_COLORS, APPOINTMENT_TYPE_COLORS)
- Dark mode: DISABLED (light mode only)
- No new npm dependencies (use existing: lucide-react-native, react-native-paper)
- Directus backend at `EXPO_PUBLIC_API_URL`
- Existing pre-existing TS errors (4, unchanged) — do not touch

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `services/directus.ts` | Modify | Extend Appointment interface |
| `constants/colors.ts` | Modify | Add/fix appointment type colors |
| `components/agenda/AgendaHeader.tsx` | Rewrite | Page header with title, search, profile |
| `components/agenda/AgendaToolbar.tsx` | Create | Navigation toolbar |
| `components/agenda/WeekGrid.tsx` | Rewrite | 7-day time grid |
| `components/agenda/DayGrid.tsx` | Rewrite | Single-day time grid |
| `components/agenda/MonthGrid.tsx` | Rewrite | Monthly calendar |
| `components/agenda/AgendaSidebar.tsx` | Rewrite | Right sidebar (desktop) / bottom sheet (mobile) |
| `components/agenda/AppointmentBlock.tsx` | Rewrite | Color-coded appointment block |
| `components/agenda/TimeColumn.tsx` | Rewrite | Hour labels |
| `components/agenda/CurrentTimeLine.tsx` | Create | Red time indicator line |
| `components/agenda/useAgendaLayout.ts` | Rewrite | Grid calculations |
| `components/agenda/useAgendaData.ts` | Create | Data enrichment + filtering |
| `app/(drawer)/agenda.tsx` | Rewrite | Main orchestrator |

---

### Task 1: Extend Data Model

**Files:**
- Modify: `services/directus.ts:83-93`
- Modify: `constants/colors.ts:286-292`

- [ ] **Step 1: Extend Appointment interface**

In `services/directus.ts`, replace the Appointment interface (lines 83-93):

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

- [ ] **Step 2: Update APPOINTMENT_TYPE_COLORS**

In `constants/colors.ts`, replace APPOINTMENT_TYPE_COLORS (lines 286-292):

```typescript
export const APPOINTMENT_TYPE_COLORS: Record<string, string> = {
  consulta: '#3B82F6',
  vacuna: '#10B981',
  examenes: '#8B5CF6',
  cirugia: '#F59E0B',
  hospitalizacion: '#EC407A',
  control: '#06B6D4',
  terreno: '#8D6E63',
};
```

- [ ] **Step 3: Commit**

```bash
git add services/directus.ts constants/colors.ts
git commit -m "feat(agenda): extend Appointment model with veterinarian, status, examenes, hospitalizacion"
```

---

### Task 2: Create CurrentTimeLine Component

**Files:**
- Create: `components/agenda/CurrentTimeLine.tsx`

- [ ] **Step 1: Create CurrentTimeLine.tsx**

```typescript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface CurrentTimeLineProps {
  hourHeight: number;
  startHour: number;
}

export default function CurrentTimeLine({ hourHeight, startHour }: CurrentTimeLineProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = startHour * 60;

  if (totalMinutes < startMinutes || totalMinutes > 19 * 60) return null;

  const offset = ((totalMinutes - startMinutes) / 60) * hourHeight;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { top: offset }]}>
      <View style={styles.label}>
        <Text style={styles.labelText}>{timeStr}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  label: {
    position: 'absolute',
    left: -4,
    top: -8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  labelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  line: {
    height: 2,
    backgroundColor: '#EF4444',
    marginLeft: 0,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/agenda/CurrentTimeLine.tsx
git commit -m "feat(agenda): add CurrentTimeLine component"
```

---

### Task 3: Create useAgendaData Hook

**Files:**
- Create: `components/agenda/useAgendaData.ts`

- [ ] **Step 1: Create useAgendaData.ts**

```typescript
import { useMemo } from 'react';
import { Appointment } from '../../services/directus';

interface PetInfo {
  name: string;
  species: string;
  breed: string;
}

interface DaySummary {
  programadas: number;
  completadas: number;
  pendientes: number;
  canceladas: number;
  total: number;
}

export function useAgendaData(
  appointments: Appointment[],
  pets: any[],
  selectedDate: string,
  searchQuery: string,
  typeFilter: string,
  statusFilter: string,
  vetFilter: string
) {
  const petMap = useMemo(() => {
    const map = new Map<string, PetInfo>();
    pets.forEach((pet: any) => {
      map.set(pet.name, {
        name: pet.name,
        species: pet.species || '',
        breed: pet.breed || '',
      });
    });
    return map;
  }, [pets]);

  const enriched = useMemo(() => {
    return appointments.map((appt) => {
      const pet = petMap.get(appt.patient_name);
      return {
        ...appt,
        species: pet?.species || '',
        breed: pet?.breed || '',
      };
    });
  }, [appointments, petMap]);

  const uniqueVets = useMemo(() => {
    const vets = new Set<string>();
    appointments.forEach((a) => {
      if (a.veterinarian) vets.add(a.veterinarian);
    });
    return Array.from(vets).sort();
  }, [appointments]);

  const filtered = useMemo(() => {
    let result = enriched;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.patient_name.toLowerCase().includes(q) ||
          (a.tutor_phone && a.tutor_phone.includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.veterinarian && a.veterinarian.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((a) => a.appointment_type === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (vetFilter !== 'all') {
      result = result.filter((a) => a.veterinarian === vetFilter);
    }

    return result;
  }, [enriched, searchQuery, typeFilter, statusFilter, vetFilter]);

  const daySummary = useMemo(() => {
    const dayAppts = filtered.filter((a) => {
      const d = new Date(a.start_time);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}` === selectedDate;
    });

    return {
      programadas: dayAppts.filter((a) => a.status === 'programada').length,
      completadas: dayAppts.filter((a) => a.status === 'completada').length,
      pendientes: dayAppts.filter((a) => a.status === 'pendiente').length,
      canceladas: dayAppts.filter((a) => a.status === 'cancelada').length,
      total: dayAppts.length,
    };
  }, [filtered, selectedDate]);

  return { filtered, enriched: filtered, uniqueVets, daySummary };
}
```

- [ ] **Step 2: Commit**

```bash
git add components/agenda/useAgendaData.ts
git commit -m "feat(agenda): add useAgendaData hook for enrichment and filtering"
```

---

### Task 4: Rewrite useAgendaLayout

**Files:**
- Rewrite: `components/agenda/useAgendaLayout.ts`

- [ ] **Step 1: Rewrite useAgendaLayout.ts**

Key changes from current version:
- `HOUR_HEIGHT_WEB = 36`, `HOUR_HEIGHT_MOBILE = 28`
- Local date extraction using `getFullYear/getMonth/getDate`
- `totalGridHeight = hours.length * hourHeight`
- `daySummary` uses status field (programadas/completadas/pendientes/canceladas)

- [ ] **Step 2: Commit**

```bash
git add components/agenda/useAgendaLayout.ts
git commit -m "feat(agenda): rewrite useAgendaLayout with compact sizing"
```

---

### Task 5: Rewrite AgendaHeader

**Files:**
- Rewrite: `components/agenda/AgendaHeader.tsx`

- [ ] **Step 1: Rewrite AgendaHeader.tsx**

Full component with:
- Left: Gold ornament SVG + "Agenda" title (24px bold) + subtitle (13px, `#5A6B80`)
- Center: Search input with magnifying glass icon, 320px max-width, rounded
- Right: Bell icon + Avatar circle (40px) + "VetCloud Admin"
- Background: white, border-bottom: 1px solid `#DDE3EC`
- Props: `searchQuery`, `onSearchChange`

- [ ] **Step 2: Commit**

```bash
git add components/agenda/AgendaHeader.tsx
git commit -m "feat(agenda): rewrite AgendaHeader with search and profile"
```

---

### Task 6: Create AgendaToolbar

**Files:**
- Create: `components/agenda/AgendaToolbar.tsx`

- [ ] **Step 1: Create AgendaToolbar.tsx**

Full component with:
- Left: "+ Nueva Cita" (navy pill, white text) + "Hoy" (outline)
- Center: ← → nav buttons + date range with calendar icon
- Right: View switcher (Día|Semana|Mes) in segmented control + "Filtros" button
- Props: `view, selectedDate, onViewChange, onNavigate, onToday, onNewAppointment`

- [ ] **Step 2: Commit**

```bash
git add components/agenda/AgendaToolbar.tsx
git commit -m "feat(agenda): create AgendaToolbar component"
```

---

### Task 7: Rewrite TimeColumn

**Files:**
- Rewrite: `components/agenda/TimeColumn.tsx`

- [ ] **Step 1: Rewrite with compact styling**

44px width, 11px semibold labels, translateY(-7) offset

- [ ] **Step 2: Commit**

```bash
git add components/agenda/TimeColumn.tsx
git commit -m "feat(agenda): rewrite TimeColumn with compact styling"
```

---

### Task 8: Rewrite AppointmentBlock

**Files:**
- Rewrite: `components/agenda/AppointmentBlock.tsx`

- [ ] **Step 1: Rewrite AppointmentBlock.tsx**

Add `breed` to data interface. Show breed under patient name in 10px gray text.

- [ ] **Step 2: Commit**

```bash
git add components/agenda/AppointmentBlock.tsx
git commit -m "feat(agenda): rewrite AppointmentBlock with breed display"
```

---

### Task 9: Rewrite WeekGrid

**Files:**
- Rewrite: `components/agenda/WeekGrid.tsx`

- [ ] **Step 1: Rewrite WeekGrid.tsx**

- Date headers derived from `selectedDate` prop
- `minHeight: hours.length * hourHeight` on grid content
- Include `<CurrentTimeLine>` in grid area
- Day columns with proper width calculation
- Props: `hours, hourHeight, weekAppointments, selectedDate, onSlotPress, onAppointmentPress`

- [ ] **Step 2: Commit**

```bash
git add components/agenda/WeekGrid.tsx
git commit -m "feat(agenda): rewrite WeekGrid with current time and date derivation"
```

---

### Task 10: Rewrite DayGrid

**Files:**
- Rewrite: `components/agenda/DayGrid.tsx`

- [ ] **Step 1: Rewrite DayGrid.tsx**

Single column with `minHeight` and CurrentTimeLine

- [ ] **Step 2: Commit**

```bash
git add components/agenda/DayGrid.tsx
git commit -m "feat(agenda): rewrite DayGrid with proper height and current time"
```

---

### Task 11: Rewrite MonthGrid

**Files:**
- Rewrite: `components/agenda/MonthGrid.tsx`

- [ ] **Step 1: Rewrite MonthGrid.tsx**

Month navigation arrows, compact day cells, dot indicators

- [ ] **Step 2: Commit**

```bash
git add components/agenda/MonthGrid.tsx
git commit -m "feat(agenda): rewrite MonthGrid with navigation arrows"
```

---

### Task 12: Rewrite AgendaSidebar

**Files:**
- Rewrite: `components/agenda/AgendaSidebar.tsx`

- [ ] **Step 1: Rewrite AgendaSidebar.tsx**

Full rewrite with:
- Mini calendar (MonthGrid)
- Filter dropdowns: Veterinario, Tipo de Cita, Estado
- "Limpiar Filtros" button
- Day summary with 4 status rows
- "Ver Agenda del Día" button
- Props: `selectedDate, monthDots, daySummary, typeFilter, statusFilter, vetFilter, uniqueVets, onDayPress, onTypeFilterChange, onStatusFilterChange, onVetFilterChange, onClearFilters, onMonthChange`

- [ ] **Step 2: Commit**

```bash
git add components/agenda/AgendaSidebar.tsx
git commit -m "feat(agenda): rewrite AgendaSidebar with filters and summary"
```

---

### Task 13: Rewrite Main Orchestrator

**Files:**
- Rewrite: `app/(drawer)/agenda.tsx`

- [ ] **Step 1: Rewrite agenda.tsx**

Full rewrite with:
- State: view, selectedDate, searchQuery, typeFilter, statusFilter, vetFilter, showModal, showMobileSidebar, confirmDelete
- Hooks: useAppointments(), api.pets.list(), useAgendaData(), useAgendaLayout()
- Layout: AgendaHeader → AgendaToolbar → [Grid + Sidebar] → Footer legend → Modals
- Mobile: bottom sheet toggle for sidebar
- All handlers: navigate, today, slot press, appointment press, save, delete

- [ ] **Step 2: Commit**

```bash
git add "app/(drawer)/agenda.tsx"
git commit -m "feat(agenda): rewrite main orchestrator with full layout"
```

---

### Task 14: DB Migration

- [ ] **Step 1: Add columns via Directus API**

```bash
curl -X POST "https://YOUR_DIRECTUS_URL/items/appointments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"veterinarian": null, "status": "programada"}'
```

Or via Directus Dashboard > Settings > Data Model > appointments > Add Field

- [ ] **Step 2: Verify existing appointments render correctly**

---

### Task 15: Build, Verify, Push

- [ ] **Step 1: Build check**

```bash
npx expo export --platform web
```

Expected: Build succeeds, `dist/` generated

- [ ] **Step 2: Visual verification in browser**

- [ ] **Step 3: Final commit and push**

```bash
git add -A
git commit -m "feat(agenda): complete redesign — sidebar, search, filters, breed, current time"
git push
```

---

## Execution Order

Tasks 1-3 are independent (parallelizable). Tasks 4-12 are sequential. Task 13 depends on all. Task 14 is manual. Task 15 is final.
