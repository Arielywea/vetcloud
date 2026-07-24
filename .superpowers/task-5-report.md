# Task 5 — PatientTabs Component

**Date:** 2026-07-23  
**Status:** ✅ Complete

## What Was Done

Created `components/pacientes/PatientTabs.tsx` — a tab bar component for the Pacientes screen with:

- Three filter tabs: Todos, Activos, Inactivos (each showing a count badge)
- Active tab highlighted with `colors.primary` bottom border and bold text
- Export button with `Download` icon from lucide-react-native
- Uses project tokens (`SPACING`, `TYPOGRAPHY`) and `useTheme()` for consistent styling
- TypeScript `TabKey` type exported for parent components

## Verification

- **Expo web export** — bundled successfully in 2603ms, no errors
- **Git commit** — `6b04c7a` on master

## File

- `components/pacientes/PatientTabs.tsx` (99 lines)
