import { HospitalTreatmentKind } from '../services/directus';

export interface HospitalTemplateRow {
  kind: HospitalTreatmentKind;
  name: string;
  unit?: string;
  instructions?: string;
  /** Interval in hours; omit for a single time */
  every?: number;
}
export interface HospitalTemplate {
  key: string;
  label: string;
  description: string;
  rows: HospitalTemplateRow[];
}

// Starting points for a sheet: the rows a clinical picture usually needs, without drugs or doses.
// Those are the vet's call: each row that needs one says so in its instructions and is edited on the sheet.
export const HOSPITAL_TEMPLATES: HospitalTemplate[] = [
  {
    key: 'monitoreo',
    label: 'Monitoreo básico',
    description: 'Constantes, dolor, alimentación y eliminaciones.',
    rows: [
      { kind: 'constante', name: 'Temperatura', unit: '°C', every: 6 },
      { kind: 'constante', name: 'Frecuencia cardíaca', unit: 'lpm', every: 6 },
      { kind: 'constante', name: 'Frecuencia respiratoria', unit: 'rpm', every: 6 },
      { kind: 'constante', name: 'Mucosas y TLLC', every: 6 },
      { kind: 'constante', name: 'Dolor', unit: '0-4', every: 6 },
      { kind: 'alimentacion', name: 'Alimento y agua', instructions: 'Anota cuánto comió y bebió', every: 8 },
      { kind: 'cuidado', name: 'Orina y deposiciones', instructions: 'Anota aspecto y cantidad', every: 6 },
    ],
  },
  {
    key: 'postoperatorio',
    label: 'Postoperatorio',
    description: 'Recuperación anestésica, dolor, herida y analgesia.',
    rows: [
      { kind: 'constante', name: 'Temperatura', unit: '°C', every: 2 },
      { kind: 'constante', name: 'Frecuencia cardíaca', unit: 'lpm', every: 2 },
      { kind: 'constante', name: 'Frecuencia respiratoria', unit: 'rpm', every: 2 },
      { kind: 'constante', name: 'Dolor', unit: '0-4', every: 4 },
      { kind: 'medicacion', name: 'Analgesia', instructions: 'Indica fármaco, dosis y vía', every: 8 },
      { kind: 'cuidado', name: 'Revisión de herida', instructions: 'Inflamación, secreción, puntos', every: 12 },
      { kind: 'alimentacion', name: 'Primera comida', instructions: 'Cuando esté despierto y sin náuseas' },
    ],
  },
  {
    key: 'gastroenteritis',
    label: 'Gastroenteritis',
    description: 'Fluidos, antiemético, hidratación y registro de vómitos y diarrea.',
    rows: [
      { kind: 'fluidos', name: 'Fluidoterapia EV', instructions: 'Indica solución y tasa (calculadora de fluidoterapia); revisa vía y bomba', every: 4 },
      { kind: 'medicacion', name: 'Antiemético', instructions: 'Indica fármaco, dosis y vía', every: 24 },
      { kind: 'medicacion', name: 'Protector gástrico', instructions: 'Indica fármaco, dosis y vía', every: 12 },
      { kind: 'constante', name: 'Temperatura', unit: '°C', every: 6 },
      { kind: 'constante', name: 'Hidratación', unit: '%', every: 8 },
      { kind: 'cuidado', name: 'Vómitos y diarrea', instructions: 'Anota número y aspecto', every: 4 },
      { kind: 'alimentacion', name: 'Dieta gastrointestinal', instructions: 'Raciones pequeñas si no hay vómitos', every: 6 },
    ],
  },
];
