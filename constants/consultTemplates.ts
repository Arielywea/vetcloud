// Starting points for the most repeated visits. They only fill empty fields and are meant to be edited:
// the headings remind what to record, they are not findings.
import type { PetSpecies } from '../services/directus';

export interface ConsultTemplate {
  key: string;
  label: string;
  type: 'consulta' | 'control' | 'cirugia';
  species?: PetSpecies;
  reason: string;
  findings: string;
  plan: string;
  /** Opens these blocks of "Desde esta consulta" */
  extras?: Array<'receta' | 'vacuna' | 'control' | 'cobro'>;
}

export const CONSULT_TEMPLATES: ConsultTemplate[] = [
  {
    key: 'vacunacion',
    label: 'Vacunación',
    type: 'consulta',
    reason: 'Vacunación',
    findings: 'Examen previo a la vacunación: estado general, temperatura, mucosas, hidratación, auscultación y linfonodos sin alteraciones.',
    plan: 'Observar 24 h: decaimiento leve y dolor en el sitio de inyección son esperables. Consultar de inmediato si hay hinchazón de la cara, vómitos o dificultad para respirar.',
    extras: ['vacuna', 'cobro'],
  },
  {
    key: 'cachorro',
    label: 'Cachorro',
    type: 'consulta',
    species: 'dog',
    reason: 'Primera consulta de cachorro',
    findings: 'Condición corporal: \nDentición: \nOídos y piel: \nAuscultación: \nHernias (umbilical, inguinal): \nTestículos (machos): \nParásitos visibles: ',
    plan: 'Plan de vacunas: Óctuple/Séxtuple cada 3-4 semanas hasta las 16 semanas o más; refuerzo a los 6-12 meses.\nDesparasitación interna (ESCCAP): cada 2 semanas desde las 2 semanas de edad hasta 2 semanas después del destete; luego mensual hasta los 6 meses.\nAlimento de cachorro según peso, 3-4 veces al día. Socialización antes de las 14 semanas.',
    extras: ['vacuna', 'control'],
  },
  {
    key: 'gatito',
    label: 'Gatito',
    type: 'consulta',
    species: 'cat',
    reason: 'Primera consulta de gatito',
    findings: 'Condición corporal: \nDentición: \nOídos (ácaros): \nPiel y pelaje: \nAuscultación: \nOjos y vías respiratorias: ',
    plan: 'Plan de vacunas: Triple felina cada 3-4 semanas hasta las 16 semanas o más; Leucemia si tendrá salida al exterior (previo test FeLV).\nDesparasitación interna (ESCCAP): cada 2 semanas desde las 3 semanas de edad hasta 2 semanas después del destete; luego mensual hasta los 6 meses.\nArenero limpio, rascador y alimento de gatito.',
    extras: ['vacuna', 'control'],
  },
  {
    key: 'postop',
    label: 'Control posoperatorio',
    type: 'control',
    reason: 'Control posoperatorio',
    findings: 'Herida: \nPuntos: \nInflamación o secreción: \nApetito, micción y defecación: \nDolor: ',
    plan: 'Mantener el collar isabelino hasta el retiro de puntos. Reposo relativo. Retiro de puntos a los 10-14 días de la cirugía.',
    extras: ['control'],
  },
  {
    key: 'cronico',
    label: 'Control crónico',
    type: 'control',
    reason: 'Control de enfermedad crónica',
    findings: 'Evolución desde el último control: \nAdherencia al tratamiento: \nApetito y peso: \nExamen dirigido: ',
    plan: 'Mantener tratamiento actual / ajustar dosis según exámenes.\nExámenes de control: \nPróximo control en ',
    extras: ['receta', 'control'],
  },
];
