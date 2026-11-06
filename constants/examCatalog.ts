// Exams a clinic orders most often. `type` matches the lab screen's categories.
export interface CatalogExam { key: string; label: string; type: string; group: string }

export const EXAM_CATALOG: CatalogExam[] = [
  { key: 'hemograma', label: 'Hemograma y frotis', type: 'hemograma', group: 'Laboratorio' },
  { key: 'bioquimico', label: 'Perfil bioquímico', type: 'bioquimica', group: 'Laboratorio' },
  { key: 'electrolitos', label: 'Electrolitos', type: 'bioquimica', group: 'Laboratorio' },
  { key: 'sdma', label: 'SDMA', type: 'bioquimica', group: 'Laboratorio' },
  { key: 'tiroideo', label: 'Perfil hormonal (T4 total y TSH)', type: 'bioquimica', group: 'Laboratorio' },
  { key: 'coagulacion', label: 'Panel de coagulación', type: 'hemograma', group: 'Laboratorio' },
  { key: 'uroanalisis', label: 'Uroanálisis', type: 'orina', group: 'Orina y heces' },
  { key: 'upc', label: 'UPC', type: 'orina', group: 'Orina y heces' },
  { key: 'coprologico', label: 'Coprológico', type: 'coproparasitario', group: 'Orina y heces' },
  { key: 'cultivo', label: 'Cultivo y antibiograma', type: 'otro', group: 'Orina y heces' },
  { key: 'citologia', label: 'Citología', type: 'citologia', group: 'Citología' },
  { key: 'vif', label: 'Test VIF/ViLeF', type: 'otro', group: 'Test rápidos' },
  { key: '4dx', label: 'Test 4Dx (anaplasma, borrelia, dirofilaria)', type: 'otro', group: 'Test rápidos' },
  { key: 'distemper', label: 'Test de distemper y parvovirus', type: 'otro', group: 'Test rápidos' },
  { key: 'presion', label: 'Medición de presiones', type: 'otro', group: 'Cardiología e imagen' },
  { key: 'ecg', label: 'Electrocardiograma', type: 'imagen', group: 'Cardiología e imagen' },
  { key: 'ecocardio', label: 'Ecocardiograma', type: 'imagen', group: 'Cardiología e imagen' },
  { key: 'rx', label: 'Radiografía', type: 'imagen', group: 'Cardiología e imagen' },
  { key: 'eco', label: 'Ecografía abdominal', type: 'imagen', group: 'Cardiología e imagen' },
];

export const EXAM_GROUPS = Array.from(new Set(EXAM_CATALOG.map((e) => e.group)));
