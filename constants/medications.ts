export const MEDICATION_CATEGORIES = [
  { key: 'intraoperatorio', label: 'Intraoperatorios', icon: 'syringe' as const, color: '#E53935' },
  { key: 'receta', label: 'Receta', icon: 'prescription' as const, color: '#1E88E5' },
] as const;

export type MedicationCategory = typeof MEDICATION_CATEGORIES[number]['key'];

export const FAMILIA_COLORS: Record<string, string> = {
  'Opioide': '#E53935',
  'Agonista sintético mu puro / antagonista NMDA': '#C62828',
  'Agonista kappa / antagonista mu': '#D32F2F',
  'Agonista natural mu puro': '#B71C1C',
  'Agonista sintético mu puro potente': '#FF1744',
  'Benzodiacepina de acción rápida': '#7B1FA2',
  'Benzodiacepina clásica': '#6A1B9A',
  'Fenotiacina': '#4527A0',
  'Agonista alfa-2 adrenérgico (alta selectividad)': '#1565C0',
  'Agonista alfa-2 adrenérgico (baja selectividad)': '#1976D2',
  'Anestésico disociativo (derivado fenciclidina)': '#00838F',
  'Fenol / hipnótico de acción ultracorta': '#00695C',
  'Simpaticomimético endógeno pan-adrenérgico': '#EF6C00',
  'Anticolinérgico derivado belladónico': '#F57F17',
  'Simpaticomimético alfa-1 dominante': '#E65100',
  'Catecolamina endógena simpaticomimética': '#D84315',
  'Simpaticomimético de acción mixta': '#BF360C',
  'Agonista alfa-1 puro': '#FF6D00',
  'Amina catecolamínica beta-1 selectiva': '#FF9100',
  'Anestésico local': '#2E7D32',
  'Anestésico disociativo': '#00897B',
  'AINE': '#558B2F',
  'Antagonista NK1': '#AD1457',
};
