# Pacientes Screen Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card-list patients screen with a table-based interface featuring tabs, advanced filtering, pagination, a slide-in detail panel, and CSV export.

**Architecture:** Modular component decomposition — 7 new components in `components/pacientes/`, one CSV utility, and a full rewrite of `pacientes.tsx` as the orchestration layer. DB gains a `last_visit` column auto-updated on clinical record CRUD.

**Tech Stack:** React Native (Expo SDK 52), react-native-paper, expo-router, lucide-react-native, TypeScript, PostgreSQL, Express.js

## Global Constraints

- Theme tokens only: `useTheme()` for colors, `SPACING`, `RADIUS`, `TYPOGRAPHY`, `SHADOWS` from `constants/tokens.ts`
- No new npm packages — use what's already in package.json
- Font weights: only `regular` (400), `semibold` (600), `bold` (700)
- Border radius: `RADIUS.lg` (18px) for cards, `RADIUS.md` (10px) for smaller elements
- All components are TypeScript, no `any` types
- Follow existing code patterns (hooks in `hooks/useDirectus.ts`, services in `services/directus.ts`)
- Web build verification: `npx expo export --platform web` must pass with 0 new errors

---

### Task 1: DB Migration + Interface Update

**Files:**
- Create: `scripts/add-pet-last-visit.sql`
- Modify: `services/directus.ts:37-80` (DirectusPet interface)

**Interfaces:**
- Produces: `DirectusPet.last_visit: string | null` (used by all downstream components)

- [ ] **Step 1: Create the SQL migration file**

```sql
-- scripts/add-pet-last-visit.sql
-- Adds last_visit timestamp to pets table for tracking patient activity

ALTER TABLE pets ADD COLUMN IF NOT EXISTS last_visit TIMESTAMP NULL;

-- Backfill from existing clinical_records
UPDATE pets SET last_visit = (
  SELECT MAX(date) FROM clinical_records WHERE pet_id = pets.id
);

CREATE INDEX IF NOT EXISTS idx_pets_last_visit ON pets(last_visit);
```

- [ ] **Step 2: Add `last_visit` to DirectusPet interface**

In `services/directus.ts`, add `last_visit` field to the `DirectusPet` interface (after `updated_at`):

```ts
last_visit: string | null;
```

- [ ] **Step 3: Commit**

```bash
git add scripts/add-pet-last-visit.sql services/directus.ts
git commit -m "feat: add last_visit field to pets table + DirectusPet interface"
```

---

### Task 2: Server.js Auto-Update last_visit

**Files:**
- Modify: `server.js:563-578` (POST /items/clinical_records)
- Modify: `server.js:580-604` (PATCH /items/clinical_records)

**Interfaces:**
- Consumes: `DirectusPet.last_visit` (from Task 1)
- Produces: `last_visit` auto-updated on clinical record create/update

- [ ] **Step 1: Add last_visit update to POST endpoint**

In `server.js`, inside `app.post('/items/clinical_records', ...)`, after the INSERT query (line 573) and before `res.json`, add:

```js
// Auto-update pet's last_visit
await pool.query(
  'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
  [r.date || new Date().toISOString(), r.pet_id]
);
```

The full POST handler becomes:

```js
app.post('/items/clinical_records', authMiddleware, async (req, res) => {
  try {
    const r = req.body;
    const ownerCheck = await pool.query('SELECT id FROM pets WHERE id = $1 AND user_id = $2', [r.pet_id, req.userId]);
    if (!ownerCheck.rows.length) return res.status(403).json({ error: 'No tienes acceso a esa mascota' });
    const result = await pool.query(
      `INSERT INTO clinical_records (pet_id, user_id, record_type, date, veterinarian, details)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [r.pet_id, req.userId, r.record_type || 'consulta', r.date || new Date().toISOString(),
       r.veterinarian || null, JSON.stringify(r.details || {})]
    );
    // Auto-update pet's last_visit
    await pool.query(
      'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
      [r.date || new Date().toISOString(), r.pet_id]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
```

- [ ] **Step 2: Add last_visit update to PATCH endpoint**

In `server.js`, inside `app.patch('/items/clinical_records/:id', ...)`, after the UPDATE query succeeds (after line 599, before `res.json`), add logic to update last_visit if the date changed:

```js
// Auto-update pet's last_visit if date changed
if (r.date) {
  const record = result.rows[0];
  await pool.query(
    'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
    [r.date, record.pet_id]
  );
}
```

The full PATCH handler becomes:

```js
app.patch('/items/clinical_records/:id', authMiddleware, async (req, res) => {
  try {
    const r = req.body;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, val] of Object.entries(r)) {
      if (key === 'id' || key === 'created_at' || key === 'user_id' || key === 'pet_id') continue;
      const valStr = key === 'details' ? JSON.stringify(val) : (typeof val === 'object' ? JSON.stringify(val) : val);
      fields.push(`${key} = $${idx}`);
      values.push(valStr);
      idx++;
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    values.push(req.userId);
    const result = await pool.query(
      `UPDATE clinical_records SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    // Auto-update pet's last_visit if date changed
    if (r.date) {
      const record = result.rows[0];
      await pool.query(
        'UPDATE pets SET last_visit = GREATEST(COALESCE(last_visit, $1), $1) WHERE id = $2',
        [r.date, record.pet_id]
      );
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
```

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "feat: auto-update pet last_visit on clinical record create/update"
```

---

### Task 3: isActive Utility + CSV Export Utility

**Files:**
- Create: `utils/patientFilters.ts`
- Create: `utils/exportCsv.ts`

**Interfaces:**
- Produces: `isActive(pet: DirectusPet): boolean`
- Produces: `exportCsv(patients: DirectusPet[], filename: string): void`

- [ ] **Step 1: Create isActive utility**

```ts
// utils/patientFilters.ts
import { DirectusPet } from '../services/directus';

export function isActive(pet: DirectusPet): boolean {
  if (!pet.last_visit) return false;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(pet.last_visit) >= sixMonthsAgo;
}

export type StatusFilter = 'all' | 'active' | 'inactive';

export function filterByStatus(pets: DirectusPet[], status: StatusFilter): DirectusPet[] {
  if (status === 'all') return pets;
  return pets.filter(p => status === 'active' ? isActive(p) : !isActive(p));
}
```

- [ ] **Step 2: Create CSV export utility**

```ts
// utils/exportCsv.ts
import { DirectusPet } from '../services/directus';
import { isActive } from './patientFilters';
import { Platform } from 'react-native';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Sin visitas';
  return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportCsv(patients: DirectusPet[], filename: string): Promise<void> {
  const headers = ['Nombre', 'Especie', 'Raza', 'Propietario', 'Telefono', 'Ultima visita', 'Estado'];
  const rows = patients.map(p => [
    p.name,
    p.species === 'dog' ? 'Canino' : 'Felino',
    p.breed || 'Sin raza',
    p.tutor_name || 'Sin propietario',
    p.phone || 'Sin telefono',
    formatDate(p.last_visit),
    isActive(p) ? 'Activo' : 'Inactivo',
  ].map(escapeCsv).join(','));

  const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    const Sharing = await import('expo-sharing');
    const FileSystem = await import('expo-file-system');
    const fileUri = FileSystem.documentDirectory + `${filename}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add utils/patientFilters.ts utils/exportCsv.ts
git commit -m "feat: add isActive utility and CSV export function"
```

---

### Task 4: PatientEmptyState Component

**Files:**
- Create: `components/pacientes/PatientEmptyState.tsx`

**Interfaces:**
- Consumes: colors from `useTheme()`
- Produces: `<PatientEmptyState onClearFilters?: () => void />`

- [ ] **Step 1: Create the component**

```tsx
// components/pacientes/PatientEmptyState.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { PawPrint } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface PatientEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export default function PatientEmptyState({ hasFilters, onClearFilters }: PatientEmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceVariant }]}>
        <PawPrint size={32} color={colors.textLight} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {hasFilters
          ? 'No se encontraron pacientes'
          : 'No hay pacientes registrados'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {hasFilters
          ? 'Prueba a cambiar los filtros de búsqueda'
          : 'Registra tu primer paciente para comenzar'}
      </Text>
      {hasFilters && onClearFilters && (
        <Text
          style={[styles.clearLink, { color: colors.primary }]}
          onPress={onClearFilters}
        >
          Limpiar filtros
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING['2xl'],
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  clearLink: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/pacientes/PatientEmptyState.tsx
git commit -m "feat: add PatientEmptyState component"
```

---

### Task 5: PatientTabs Component

**Files:**
- Create: `components/pacientes/PatientTabs.tsx`

**Interfaces:**
- Consumes: colors from `useTheme()`
- Produces: `<PatientTabs activeTab onTabChange counts onExport />`

- [ ] **Step 1: Create the component**

```tsx
// components/pacientes/PatientTabs.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Download } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';

export type TabKey = 'all' | 'active' | 'inactive';

interface PatientTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts: { all: number; active: number; inactive: number };
  onExport: () => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
];

export default function PatientTabs({ activeTab, onTabChange, counts, onExport }: PatientTabsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              style={[styles.tab, isActive && { borderBottomColor: colors.primary }]}
            >
              <Text style={[
                styles.tabText,
                { color: isActive ? colors.primary : colors.textSecondary },
                isActive && styles.tabTextActive,
              ]}>
                {tab.label} ({counts[tab.key]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={onExport}
        activeOpacity={0.7}
        style={[styles.exportBtn, { borderColor: colors.border }]}
      >
        <Download size={16} color={colors.primary} />
        <Text style={[styles.exportText, { color: colors.primary }]}>Exportar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tabs: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  tab: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabTextActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  exportText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/pacientes/PatientTabs.tsx
git commit -m "feat: add PatientTabs component with export button"
```

---

### Task 6: PatientFilters Component

**Files:**
- Create: `components/pacientes/PatientFilters.tsx`

**Interfaces:**
- Consumes: colors from `useTheme()`
- Produces: `<PatientFilters searchQuery onSearchChange species onSpeciesChange breeds selectedBreed onBreedChange ownerFilter onOwnerFilterChange statusFilter onStatusFilterChange />`

- [ ] **Step 1: Create the component**

```tsx
// components/pacientes/PatientFilters.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Search, ChevronDown, X, Filter } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

export type SpeciesFilter = 'all' | 'dog' | 'cat';
export type StatusFilter = 'all' | 'active' | 'inactive';

interface PatientFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  species: SpeciesFilter;
  onSpeciesChange: (species: SpeciesFilter) => void;
  breeds: string[];
  selectedBreed: string;
  onBreedChange: (breed: string) => void;
  ownerFilter: string;
  onOwnerFilterChange: (owner: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
}

const SPECIES_OPTIONS: { key: SpeciesFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'dog', label: 'Perros' },
  { key: 'cat', label: 'Gatos' },
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
];

export default function PatientFilters({
  searchQuery, onSearchChange,
  species, onSpeciesChange,
  breeds, selectedBreed, onBreedChange,
  ownerFilter, onOwnerFilterChange,
  statusFilter, onStatusFilterChange,
}: PatientFiltersProps) {
  const { colors } = useTheme();
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);

  const hasActiveFilters = ownerFilter || statusFilter !== 'all';

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textLight} />
        <TextInput
          placeholder="Buscar paciente..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={onSearchChange}
          style={[styles.searchInput, { color: colors.text }]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          contentStyle={styles.searchInputContent}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} activeOpacity={0.7}>
            <X size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown filters */}
      <View style={styles.dropdowns}>
        {/* Species dropdown */}
        <TouchableOpacity
          style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => { setShowSpeciesDropdown(!showSpeciesDropdown); setShowBreedDropdown(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, { color: colors.text }]}>
            Especie
          </Text>
          <ChevronDown size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Breed dropdown */}
        <TouchableOpacity
          style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => { setShowBreedDropdown(!showBreedDropdown); setShowSpeciesDropdown(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, { color: colors.text }]}>
            Raza
          </Text>
          <ChevronDown size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Más filtros */}
        <TouchableOpacity
          style={[
            styles.dropdown,
            {
              backgroundColor: hasActiveFilters ? colors.primary + '10' : colors.surface,
              borderColor: hasActiveFilters ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setShowMoreFilters(!showMoreFilters)}
          activeOpacity={0.7}
        >
          <Filter size={14} color={hasActiveFilters ? colors.primary : colors.textSecondary} />
          <Text style={[
            styles.dropdownText,
            { color: hasActiveFilters ? colors.primary : colors.text },
          ]}>
            Más filtros
          </Text>
        </TouchableOpacity>
      </View>

      {/* Species dropdown content */}
      {showSpeciesDropdown && (
        <View style={[styles.dropdownContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {SPECIES_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.dropdownItem, species === opt.key && { backgroundColor: colors.primary + '10' }]}
              onPress={() => { onSpeciesChange(opt.key); setShowSpeciesDropdown(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownItemText, { color: species === opt.key ? colors.primary : colors.text }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Breed dropdown content */}
      {showBreedDropdown && (
        <View style={[styles.dropdownContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.dropdownItem, selectedBreed === 'all' && { backgroundColor: colors.primary + '10' }]}
            onPress={() => { onBreedChange('all'); setShowBreedDropdown(false); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownItemText, { color: selectedBreed === 'all' ? colors.primary : colors.text }]}>
              Todas
            </Text>
          </TouchableOpacity>
          {breeds.map(breed => (
            <TouchableOpacity
              key={breed}
              style={[styles.dropdownItem, selectedBreed === breed && { backgroundColor: colors.primary + '10' }]}
              onPress={() => { onBreedChange(breed); setShowBreedDropdown(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownItemText, { color: selectedBreed === breed ? colors.primary : colors.text }]}>
                {breed}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* More filters popover */}
      {showMoreFilters && (
        <View style={[styles.moreFilters, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.moreFiltersTitle, { color: colors.text }]}>Filtros adicionales</Text>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Propietario</Text>
          <TextInput
            placeholder="Nombre del propietario"
            placeholderTextColor={colors.textLight}
            value={ownerFilter}
            onChangeText={onOwnerFilterChange}
            style={[styles.fieldInput, { backgroundColor: colors.surfaceVariant, color: colors.text }]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Estado</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.statusOption,
                  {
                    backgroundColor: statusFilter === opt.key ? colors.primary : colors.surfaceVariant,
                    borderColor: statusFilter === opt.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => onStatusFilterChange(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.statusOptionText,
                  { color: statusFilter === opt.key ? '#FFFFFF' : colors.text },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, backgroundColor: 'transparent', minHeight: 36 },
  searchInputContent: { paddingVertical: 0, paddingHorizontal: 0 },
  dropdowns: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 10,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  dropdownText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  dropdownContent: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.xs,
    zIndex: 100,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  dropdownItemText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  moreFilters: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.sm,
    zIndex: 100,
    elevation: 5,
  },
  moreFiltersTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
  },
  fieldInput: {
    borderRadius: RADIUS.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    minHeight: 36,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statusOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/pacientes/PatientFilters.tsx
git commit -m "feat: add PatientFilters component with search, species, breed, more filters"
```

---

### Task 7: PatientRow Component

**Files:**
- Create: `components/pacientes/PatientRow.tsx`

**Interfaces:**
- Consumes: `DirectusPet`, `isActive` from `utils/patientFilters`, `calculateAge` from `utils/age`
- Produces: `<PatientRow patient isSelected onSelect onClick onDelete />`

- [ ] **Step 1: Create the component**

```tsx
// components/pacientes/PatientRow.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { DirectusPet } from '../../services/directus';
import { isActive } from '../../utils/patientFilters';
import { calculateAge } from '../../utils/age';
import VAvatar from '../ui/Avatar';

interface PatientRowProps {
  patient: DirectusPet;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onDelete: () => void;
}

export default function PatientRow({ patient, isSelected, onSelect, onClick, onDelete }: PatientRowProps) {
  const { colors } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const active = isActive(patient);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin visitas';
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.7}
      style={[
        styles.row,
        {
          backgroundColor: isSelected ? colors.primary + '0D' : colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity
        onPress={onSelect}
        style={styles.checkbox}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkboxBox,
          {
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primary : 'transparent',
          },
        ]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Patient info */}
      <View style={styles.patientCell}>
        <VAvatar
          name={patient.name}
          size={32}
          style={{ backgroundColor: colors.primaryContainer }}
        />
        <Text style={[styles.patientName, { color: colors.text }]} numberOfLines={1}>
          {patient.name}
        </Text>
      </View>

      {/* Especie */}
      <View style={styles.cell}>
        <Text style={[styles.cellText, { color: colors.text }]}>
          {patient.species === 'dog' ? 'Canino' : 'Felino'}
        </Text>
      </View>

      {/* Raza */}
      <View style={styles.cell}>
        <Text style={[styles.cellText, { color: colors.text }]} numberOfLines={1}>
          {patient.breed || 'Sin raza'}
        </Text>
      </View>

      {/* Propietario */}
      <View style={styles.cellWide}>
        <Text style={[styles.cellText, { color: colors.text }]} numberOfLines={1}>
          {patient.tutor_name || 'Sin propietario'}
        </Text>
      </View>

      {/* Ultima visita */}
      <View style={styles.cell}>
        <Text style={[styles.cellText, { color: patient.last_visit ? colors.text : colors.textLight }]}>
          {formatDate(patient.last_visit)}
        </Text>
      </View>

      {/* Estado badge */}
      <View style={styles.cell}>
        <View style={[
          styles.badge,
          { backgroundColor: active ? '#E3F2FD' : '#FFF3E0' },
        ]}>
          <Text style={[
            styles.badgeText,
            { color: active ? '#1565C0' : '#E65100' },
          ]}>
            {active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>

      {/* Actions menu */}
      <View style={styles.actionsCell}>
        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          style={styles.menuBtn}
          activeOpacity={0.7}
        >
          <MoreVertical size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {showMenu && (
          <>
            <TouchableOpacity
              style={styles.menuOverlay}
              onPress={() => setShowMenu(false)}
              activeOpacity={1}
            />
            <View style={[styles.menuDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); onClick(); }}
                activeOpacity={0.7}
              >
                <Eye size={16} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Ver ficha</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); onClick(); }}
                activeOpacity={0.7}
              >
                <Pencil size={16} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); onDelete(); }}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  checkbox: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  patientCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minWidth: 160,
  },
  patientName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cell: {
    flex: 1,
    minWidth: 90,
    paddingHorizontal: SPACING.xs,
  },
  cellWide: {
    flex: 1.2,
    minWidth: 120,
    paddingHorizontal: SPACING.xs,
  },
  cellText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  actionsCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  menuBtn: {
    padding: SPACING.xs,
  },
  menuOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 99,
  },
  menuDropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 150,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.xs,
    zIndex: 100,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/pacientes/PatientRow.tsx
git commit -m "feat: add PatientRow component with checkbox, cells, and actions menu"
```

---

### Task 8: PatientTable + PatientPagination Components

**Files:**
- Create: `components/pacientes/PatientTable.tsx`
- Create: `components/pacientes/PatientPagination.tsx`

**Interfaces:**
- Consumes: `PatientRow` (Task 7), `PatientEmptyState` (Task 4)
- Produces: `<PatientTable patients loading selectedPatient onSelectPatient onDeletePatient />`
- Produces: `<PatientPagination currentPage totalPages totalItems itemsPerPage onPageChange />`

- [ ] **Step 1: Create PatientPagination**

```tsx
// components/pacientes/PatientPagination.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface PatientPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function PatientPagination({
  currentPage, totalPages, totalItems, itemsPerPage, onPageChange,
}: PatientPaginationProps) {
  const { colors } = useTheme();

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.info, { color: colors.textSecondary }]}>
        Mostrando {start}-{end} de {totalItems} pacientes
      </Text>

      <View style={styles.pages}>
        <TouchableOpacity
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={[styles.pageBtn, currentPage === 1 && { opacity: 0.4 }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={16} color={colors.text} />
        </TouchableOpacity>

        {pages.map((page, idx) => {
          if (page === '...') {
            return <Text key={`dots-${idx}`} style={[styles.dots, { color: colors.textLight }]}>...</Text>;
          }
          const isActive = page === currentPage;
          return (
            <TouchableOpacity
              key={page}
              onPress={() => onPageChange(page)}
              style={[styles.pageBtn, isActive && { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pageNum, { color: isActive ? '#FFFFFF' : colors.text }]}>
                {page}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={[styles.pageBtn, currentPage === totalPages && { opacity: 0.4 }]}
          activeOpacity={0.7}
        >
          <ChevronRight size={16} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  info: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  pages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNum: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  dots: {
    fontSize: TYPOGRAPHY.sizes.sm,
    paddingHorizontal: 4,
  },
});
```

- [ ] **Step 2: Create PatientTable**

```tsx
// components/pacientes/PatientTable.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import { DirectusPet } from '../../services/directus';
import PatientRow from './PatientRow';
import PatientPagination from './PatientPagination';
import PatientEmptyState from './PatientEmptyState';

interface PatientTableProps {
  patients: DirectusPet[];
  paginatedPatients: DirectusPet[];
  loading: boolean;
  selectedPatient: DirectusPet | null;
  selectedIds: Set<string>;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasFilters: boolean;
  onSelectPatient: (pet: DirectusPet) => void;
  onClickPatient: (pet: DirectusPet) => void;
  onDeletePatient: (pet: DirectusPet) => void;
  onToggleSelect: (id: string) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

export default function PatientTable({
  patients, paginatedPatients, loading, selectedPatient, selectedIds,
  currentPage, totalPages, totalItems, itemsPerPage,
  onSelectPatient, onClickPatient, onDeletePatient, onToggleSelect, onPageChange,
  hasFilters, onClearFilters,
}: PatientTableProps) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.tableWrapper}>
        <View style={[styles.table, { backgroundColor: colors.surface }]}>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={[styles.skeletonRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 18 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 120 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 80 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 80 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 100 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 80 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 60 }]} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tableWrapper}>
      {/* Table header */}
      <View style={[styles.tableHeader, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.checkboxHeader} />
        <View style={styles.patientHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Paciente</Text>
        </View>
        <View style={styles.cellHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Especie</Text>
        </View>
        <View style={styles.cellHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Raza</Text>
        </View>
        <View style={styles.cellWideHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Propietario</Text>
        </View>
        <View style={styles.cellHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Última visita</Text>
        </View>
        <View style={styles.cellHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Estado</Text>
        </View>
        <View style={styles.actionsHeader} />
      </View>

      {/* Table body */}
      <ScrollView style={styles.tableBody}>
        {paginatedPatients.length === 0 ? (
          <PatientEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
        ) : (
          paginatedPatients.map(patient => (
            <PatientRow
              key={patient.id}
              patient={patient}
              isSelected={selectedIds.has(patient.id)}
              onSelect={() => onToggleSelect(patient.id)}
              onClick={() => onClickPatient(patient)}
              onDelete={() => onDeletePatient(patient)}
            />
          ))
        )}
      </ScrollView>

      {/* Pagination */}
      {totalItems > 0 && (
        <PatientPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tableWrapper: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  checkboxHeader: { width: 40 },
  patientHeader: { flex: 2, minWidth: 160 },
  cellHeader: { flex: 1, minWidth: 90 },
  cellWideHeader: { flex: 1.2, minWidth: 120 },
  actionsHeader: { width: 40 },
  headerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableBody: {
    flex: 1,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.md,
    minHeight: 56,
  },
  skeleton: {
    height: 14,
    borderRadius: 7,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add components/pacientes/PatientTable.tsx components/pacientes/PatientPagination.tsx
git commit -m "feat: add PatientTable and PatientPagination components"
```

---

### Task 9: PatientSidePanel Component

**Files:**
- Create: `components/pacientes/PatientSidePanel.tsx`

**Interfaces:**
- Consumes: `DirectusPet`, `isActive`, `calculateAge`, `useRouter` for navigation
- Produces: `<PatientSidePanel patient visible onClose />`

- [ ] **Step 1: Create the component**

```tsx
// components/pacientes/PatientSidePanel.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { X, Phone, Mail, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { DirectusPet } from '../../services/directus';
import { isActive } from '../../utils/patientFilters';
import { calculateAge } from '../../utils/age';
import VAvatar from '../ui/Avatar';

interface PatientSidePanelProps {
  patient: DirectusPet | null;
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH < 768 ? SCREEN_WIDTH : 360;

export default function PatientSidePanel({ patient, visible, onClose }: PatientSidePanelProps) {
  const { colors } = useTheme();
  const router = useRouter();

  if (!visible || !patient) return null;

  const active = isActive(patient);
  const age = patient.birth_date ? calculateAge(patient.birth_date) : 'N/A';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin visitas registradas';
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Panel */}
      <View style={[styles.panel, { width: PANEL_WIDTH, backgroundColor: colors.surface }, SHADOWS.xl]}>
        {/* Header */}
        <View style={styles.panelHeader}>
          <View style={styles.patientHeader}>
            <VAvatar
              name={patient.name}
              size={80}
              style={{ backgroundColor: colors.primaryContainer }}
            />
            <Text style={[styles.patientName, { color: colors.text }]}>{patient.name}</Text>
            <Text style={[styles.patientBreed, { color: colors.textSecondary }]}>
              {patient.species === 'dog' ? 'Canino' : 'Felino'} · {patient.breed || 'Sin raza'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Status badge */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: active ? '#E3F2FD' : '#FFF3E0' }]}>
            <Text style={[styles.badgeText, { color: active ? '#1565C0' : '#E65100' }]}>
              {active ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Edad</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{age}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Peso</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {patient.weight ? `${patient.weight} kg` : 'N/A'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sexo</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {patient.sex === 'macho' ? 'Macho' : patient.sex === 'hembra' ? 'Hembra' : 'N/A'}
            </Text>
          </View>
        </View>

        <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Owner section */}
        <View style={styles.ownerSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PROPIETARIO</Text>
          {patient.tutor_name && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoText, { color: colors.text }]}>{patient.tutor_name}</Text>
            </View>
          )}
          {patient.phone && (
            <View style={styles.infoRow}>
              <Phone size={14} color={colors.textLight} />
              <Text style={[styles.infoText, { color: colors.text }]}>{patient.phone}</Text>
            </View>
          )}
          {patient.email && (
            <View style={styles.infoRow}>
              <Mail size={14} color={colors.textLight} />
              <Text style={[styles.infoText, { color: colors.text }]}>{patient.email}</Text>
            </View>
          )}
          {!patient.tutor_name && !patient.phone && !patient.email && (
            <Text style={[styles.noData, { color: colors.textLight }]}>Sin información del propietario</Text>
          )}
        </View>

        <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Last visit */}
        <View style={styles.lastVisitSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ÚLTIMA VISITA</Text>
          <Text style={[styles.lastVisitText, { color: patient.last_visit ? colors.text : colors.textLight }]}>
            {formatDate(patient.last_visit)}
          </Text>
        </View>

        {/* View full profile button */}
        <TouchableOpacity
          style={[styles.viewFullBtn, { backgroundColor: colors.primary }]}
          onPress={() => { onClose(); router.push(`/pet/${patient.id}`); }}
          activeOpacity={0.7}
        >
          <Text style={styles.viewFullText}>Ver ficha completa</Text>
          <ChevronRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 99,
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  panelHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  patientHeader: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  patientName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.sm,
  },
  patientBreed: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: SPACING.xs,
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  ownerSection: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  noData: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontStyle: 'italic',
  },
  lastVisitSection: {
    gap: SPACING.xs,
  },
  lastVisitText: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  viewFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 10,
    gap: SPACING.sm,
    marginTop: SPACING['2xl'],
  },
  viewFullText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add components/pacientes/PatientSidePanel.tsx
git commit -m "feat: add PatientSidePanel slide-in component"
```

---

### Task 10: Main Screen Rewrite (pacientes.tsx)

**Files:**
- Modify: `app/(drawer)/pacientes.tsx` — complete rewrite

**Interfaces:**
- Consumes: All components from Tasks 4-9, `usePets`, `isActive`, `filterByStatus`, `exportCsv`

- [ ] **Step 1: Rewrite the screen**

```tsx
// app/(drawer)/pacientes.tsx
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Dialog, Portal } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { usePets } from '../../hooks/useDirectus';
import { DirectusPet } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { isActive, filterByStatus, StatusFilter } from '../../utils/patientFilters';
import { exportCsv } from '../../utils/exportCsv';
import PatientTabs, { TabKey } from '../../components/pacientes/PatientTabs';
import PatientFilters, { SpeciesFilter } from '../../components/pacientes/PatientFilters';
import PatientTable from '../../components/pacientes/PatientTable';
import PatientSidePanel from '../../components/pacientes/PatientSidePanel';

const ITEMS_PER_PAGE = 10;

export default function PacientesScreen() {
  const router = useRouter();
  const { pets, loading, removePet } = usePets();
  const { colors } = useTheme();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [species, setSpecies] = useState<SpeciesFilter>('all');
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // UI state
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedPatient, setSelectedPatient] = useState<DirectusPet | null>(null);
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<DirectusPet | null>(null);

  // Combine tab + status filter
  const effectiveStatus: StatusFilter = useMemo(() => {
    if (activeTab === 'active') return 'active';
    if (activeTab === 'inactive') return 'inactive';
    return statusFilter;
  }, [activeTab, statusFilter]);

  // Unique breeds from species-filtered pets
  const uniqueBreeds = useMemo(() => {
    const filtered = species === 'all' ? pets : pets.filter(p => p.species === species);
    const breeds = [...new Set(filtered.map(p => p.breed).filter(Boolean))] as string[];
    return breeds.sort();
  }, [pets, species]);

  // Apply all filters
  const filteredPatients = useMemo(() => {
    let results = [...pets];

    // Species filter
    if (species !== 'all') {
      results = results.filter(p => p.species === species);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.breed && p.breed.toLowerCase().includes(q)) ||
        (p.tutor_name && p.tutor_name.toLowerCase().includes(q))
      );
    }

    // Breed filter
    if (selectedBreed !== 'all') {
      results = results.filter(p => p.breed === selectedBreed);
    }

    // Owner filter
    if (ownerFilter.trim()) {
      const q = ownerFilter.toLowerCase();
      results = results.filter(p =>
        p.tutor_name && p.tutor_name.toLowerCase().includes(q)
      );
    }

    // Status filter (tab + dropdown combined)
    results = filterByStatus(results, effectiveStatus);

    return results;
  }, [pets, species, searchQuery, selectedBreed, ownerFilter, effectiveStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Tab counts
  const counts = useMemo(() => ({
    all: pets.length,
    active: pets.filter(p => isActive(p)).length,
    inactive: pets.filter(p => !isActive(p)).length,
  }), [pets]);

  // Reset page when filters change
  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, species, selectedBreed, ownerFilter, effectiveStatus]);

  const hasFilters = searchQuery || species !== 'all' || selectedBreed !== 'all' || ownerFilter || effectiveStatus !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSpecies('all');
    setSelectedBreed('all');
    setOwnerFilter('');
    setStatusFilter('all');
    setActiveTab('all');
  };

  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportCsv(filteredPatients, `pacientes_${today}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removePet(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleClickPatient = (pet: DirectusPet) => {
    setSelectedPatient(pet);
    setSidePanelVisible(true);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Pacientes</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Administra y consulta la información de tus pacientes
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={() => router.push('/(drawer)/add-paciente')}
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          labelStyle={styles.newBtnLabel}
          icon={({ size }) => <Plus size={size} color="#FFFFFF" />}
        >
          Nuevo Paciente
        </Button>
      </View>

      {/* Tabs */}
      <PatientTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        onExport={handleExport}
      />

      {/* Filters */}
      <View style={styles.filtersSection}>
        <PatientFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          species={species}
          onSpeciesChange={setSpecies}
          breeds={uniqueBreeds}
          selectedBreed={selectedBreed}
          onBreedChange={setSelectedBreed}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={setOwnerFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </View>

      {/* Table */}
      <PatientTable
        patients={filteredPatients}
        paginatedPatients={paginatedPatients}
        loading={loading}
        selectedPatient={selectedPatient}
        selectedIds={selectedIds}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPatients.length}
        itemsPerPage={ITEMS_PER_PAGE}
        hasFilters={hasFilters}
        onSelectPatient={(pet) => setSelectedPatient(pet)}
        onClickPatient={handleClickPatient}
        onDeletePatient={setDeleteTarget}
        onToggleSelect={handleToggleSelect}
        onPageChange={setCurrentPage}
        onClearFilters={clearFilters}
      />

      {/* Side Panel */}
      <PatientSidePanel
        patient={selectedPatient}
        visible={sidePanelVisible}
        onClose={() => { setSidePanelVisible(false); setSelectedPatient(null); }}
      />

      {/* Delete Dialog */}
      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Eliminar paciente</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center' }}>
              ¿Estás seguro de eliminar a <Text style={{ fontWeight: '700' }}>{deleteTarget?.name}</Text>?
              Se borrará todo su historial médico.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button onPress={handleDelete} textColor={colors.error}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: SPACING.xs,
  },
  newBtn: {
    borderRadius: 10,
  },
  newBtnLabel: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  filtersSection: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/\(drawer\)/pacientes.tsx
git commit -m "feat: rewrite pacientes screen with table, filters, tabs, pagination, side panel"
```

---

### Task 11: Web Build Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run web build**

```bash
cd C:\Users\Ariel\vet-cloud && npx expo export --platform web
```

Expected: Build succeeds with 0 new errors

- [ ] **Step 2: Fix any TypeScript errors**

If build fails, fix the errors and re-run until it passes.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: pacientes screen redesign - table-based with filters, tabs, pagination, side panel, CSV export

- DB migration: last_visit column on pets table
- server.js: auto-update last_visit on clinical record CRUD
- 7 new components: PatientTable, PatientRow, PatientSidePanel, PatientFilters, PatientTabs, PatientPagination, PatientEmptyState
- New utilities: isActive, filterByStatus, exportCsv
- Full screen rewrite with state management
- Responsive layout support"
```

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `scripts/add-pet-last-visit.sql` | Create | DB migration |
| `services/directus.ts` | Modify | Add `last_visit` to DirectusPet |
| `server.js` | Modify | Auto-update `last_visit` on clinical record CRUD |
| `utils/patientFilters.ts` | Create | `isActive()`, `filterByStatus()` |
| `utils/exportCsv.ts` | Create | CSV export utility |
| `components/pacientes/PatientEmptyState.tsx` | Create | Empty state component |
| `components/pacientes/PatientTabs.tsx` | Create | Tab bar with counts + export |
| `components/pacientes/PatientFilters.tsx` | Create | Search + dropdowns + more filters |
| `components/pacientes/PatientRow.tsx` | Create | Single table row |
| `components/pacientes/PatientTable.tsx` | Create | Table wrapper |
| `components/pacientes/PatientPagination.tsx` | Create | Page controls |
| `components/pacientes/PatientSidePanel.tsx` | Create | Slide-in detail panel |
| `app/(drawer)/pacientes.tsx` | Rewrite | Full screen orchestration |
