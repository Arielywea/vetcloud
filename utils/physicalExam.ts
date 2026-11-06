// Structured physical exam and current-problem anamnesis of a consultation (stored in clinical_records.details).
// Everything is optional: only the fields the vet filled are saved.

export type NodeKey = 'submandibular' | 'preescapular' | 'popliteo' | 'mamario';

export interface ExamForm {
  fc: string; fr: string; temp: string; tllc: string;
  mucosas: string | null; pliegue: string | null; deshidratacion: string | null;
  estado: string | null; bcs: string | null; estres: string | null; pelaje: string | null;
  nodes: Record<NodeKey, string | null>;
  oral: string; ausc: string; abdomen: string; postura: string;
  problems: string;
  next: { evolucion: string; animo: string | null; apetito: string | null; vomito: string; diarrea: string; heces: string; orina: string; tos: string; farmacos: string };
}

export const emptyExam = (): ExamForm => ({
  fc: '', fr: '', temp: '', tllc: '', mucosas: null, pliegue: null, deshidratacion: null,
  estado: null, bcs: null, estres: null, pelaje: null,
  nodes: { submandibular: null, preescapular: null, popliteo: null, mamario: null },
  oral: '', ausc: '', abdomen: '', postura: '', problems: '',
  next: { evolucion: '', animo: null, apetito: null, vomito: '', diarrea: '', heces: '', orina: '', tos: '', farmacos: '' },
});

export const NODE_LABEL: Record<NodeKey, string> = { submandibular: 'Submandibulares', preescapular: 'Preescapulares', popliteo: 'Poplíteos', mamario: 'Mamarios' };
export const NODE_OPTIONS = [
  { value: 'normal', label: 'No reactivo' }, { value: 'der', label: 'Derecho' }, { value: 'izq', label: 'Izquierdo' }, { value: 'amb', label: 'Ambos' },
];
const NODE_TEXT: Record<string, string> = { normal: 'no reactivos', der: 'reactivo derecho', izq: 'reactivo izquierdo', amb: 'reactivos ambos' };

const opts = (...v: string[]) => v.map((x) => ({ value: x, label: x }));
export const MUCOSAS = opts('Rosadas', 'Pálidas', 'Congestivas', 'Ictéricas', 'Cianóticas');
export const PLIEGUE = opts('Normal', 'Aumentado');
export const DESHID = opts('<5 %', '5–8 %', '8–10 %', '>10 %');
export const ESTADO = opts('Alerta', 'Deprimido', 'Postrado', 'Estupor', 'Obnubilado');
export const BCS = opts('1', '2', '3', '4', '5', '6', '7', '8', '9');
export const ESTRES = opts('0', '1', '2', '3', '4', '5');
export const PELAJE = opts('Brillante', 'Opaco', 'Hirsuto', 'Alopecia localizada', 'Alopecia generalizada');
export const ANIMO = opts('Normal', 'Decaído', 'Letárgico', 'Agresivo');
export const APETITO = opts('Normal', 'Aumentado', 'Disminuido', 'Anorexia');

const RANGES = { fc: [20, 300, 'FC'], fr: [4, 150, 'FR'], temp: [30, 45, 'T°'], tllc: [0, 10, 'TLLC'] } as const;
const num = (s: string) => parseFloat(s.trim().replace(',', '.'));

/** Error message for an out-of-range constant, or null */
export function examError(e: ExamForm): string | null {
  for (const k of Object.keys(RANGES) as Array<keyof typeof RANGES>) {
    const raw = e[k].trim();
    if (!raw) continue;
    const [min, max, label] = RANGES[k];
    const n = num(raw);
    if (!isFinite(n) || n < min || n > max) return `${label} fuera de rango (${min}–${max})`;
  }
  return null;
}

const filled = (o: Record<string, any>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== '' && v !== undefined && v !== false));

/** Compact object saved in details.exam (only what was filled) */
export function examToDetails(e: ExamForm) {
  const vitals = filled({ fc: e.fc.trim() && num(e.fc), fr: e.fr.trim() && num(e.fr), temp: e.temp.trim() && num(e.temp), tllc: e.tllc.trim() && num(e.tllc) });
  const nodes = filled(e.nodes);
  const out: Record<string, any> = filled({
    mucosas: e.mucosas, pliegue: e.pliegue, deshidratacion: e.deshidratacion, estado: e.estado, bcs: e.bcs, estres: e.estres, pelaje: e.pelaje,
    oral: e.oral.trim(), ausc: e.ausc.trim(), abdomen: e.abdomen.trim(), postura: e.postura.trim(),
  });
  if (Object.keys(vitals).length) out.vitals = vitals;
  if (Object.keys(nodes).length) out.nodes = nodes;
  return Object.keys(out).length ? out : undefined;
}

export function nextToDetails(n: ExamForm['next']) {
  const t = filled({ evolucion: n.evolucion.trim(), animo: n.animo, apetito: n.apetito, vomito: n.vomito.trim(), diarrea: n.diarrea.trim(), heces: n.heces.trim(), orina: n.orina.trim(), tos: n.tos.trim(), farmacos: n.farmacos.trim() });
  return Object.keys(t).length ? t : undefined;
}

/** Back from the saved details to the form (editing a past consultation) */
export function examFromDetails(d: any): ExamForm {
  const e = emptyExam();
  const x = d?.exam || {};
  const v = x.vitals || {};
  const s = (n: any) => (n === undefined || n === null ? '' : String(n).replace('.', ','));
  return {
    ...e,
    fc: s(v.fc), fr: s(v.fr), temp: s(v.temp), tllc: s(v.tllc),
    mucosas: x.mucosas ?? null, pliegue: x.pliegue ?? null, deshidratacion: x.deshidratacion ?? null,
    estado: x.estado ?? null, bcs: x.bcs ?? null, estres: x.estres ?? null, pelaje: x.pelaje ?? null,
    nodes: { ...e.nodes, ...(x.nodes || {}) },
    oral: x.oral || '', ausc: x.ausc || '', abdomen: x.abdomen || '', postura: x.postura || '',
    problems: d?.problemas || '',
    next: { ...e.next, ...(d?.anamnesis_proxima || {}) },
  };
}

/** Readable lines for the record detail (works with the saved details object) */
export function examLines(ex: any): Array<[string, string]> {
  if (!ex) return [];
  const v = ex.vitals || {};
  const c = (n: any) => String(n).replace('.', ',');
  const vit = [v.fc != null && `FC ${v.fc} lpm`, v.fr != null && `FR ${v.fr} rpm`, v.temp != null && `T° ${c(v.temp)} °C`, v.tllc != null && `TLLC ${c(v.tllc)} s`].filter(Boolean).join(' · ');
  const nodes = Object.entries(ex.nodes || {}).map(([k, val]) => `${NODE_LABEL[k as NodeKey] || k}: ${NODE_TEXT[val as string] || val}`).join(' · ');
  const rows: Array<[string, string | false | undefined]> = [
    ['Constantes', vit], ['Estado', ex.estado], ['Condición corporal', ex.bcs && `${ex.bcs}/9`], ['Miedo, ansiedad y estrés', ex.estres && `${ex.estres}/5`],
    ['Pelaje', ex.pelaje], ['Postura', ex.postura], ['Mucosas', ex.mucosas], ['Pliegue cutáneo', ex.pliegue], ['Deshidratación', ex.deshidratacion],
    ['Linfonodos', nodes], ['Cavidad oral y ojos', ex.oral], ['Auscultación cardiopulmonar', ex.ausc], ['Palpación abdominal', ex.abdomen],
  ];
  return rows.filter((r): r is [string, string] => !!r[1]);
}

const NEXT_LABEL: Record<string, string> = { evolucion: 'Evolución', animo: 'Ánimo', apetito: 'Apetito', vomito: 'Vómito o regurgitación', diarrea: 'Diarrea', heces: 'Heces', orina: 'Orina', tos: 'Tos o estornudos', farmacos: 'Fármacos recibidos' };
export function nextLines(n: any): Array<[string, string]> {
  return Object.entries(n || {}).filter(([, v]) => v).map(([k, v]) => [NEXT_LABEL[k] || k, String(v)] as [string, string]);
}
