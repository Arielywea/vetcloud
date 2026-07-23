interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const SUBJECTIVE_KEYWORDS = [
  'motivo', 'consulta', 'presenta', 'siente', 'duele', 'vomita', 'diarrea',
  'no come', 'no come', 'decaído', 'deprimido', 'letárgico', 'cojea', 'tose',
  'estornuda', 'se rasca', 'sangra', 'hinchazón', 'hinchado', 'fiebre',
  'perdida de peso', 'aumento de peso', 'cambio de conducta', 'comportamiento',
  'desde hace', 'desde ayer', 'desde hace días', 'empeoró', 'mejoró',
  'no ha comido', 'ha vomitado', 'ha orinado', 'ha defecado', 'apetito',
  'sed', 'dormir', 'dormido', 'actividad', 'paseos', 'juego',
];

const OBJECTIVE_KEYWORDS = [
  'temperatura', 'temperatura corporal', 'pulso', 'frecuencia', 'peso',
  'mucosa', 'mucosas', 'hidratación', 'linf', 'nódulos', 'cardiaco',
  'respiratorio', 'abdomen', 'pulmones', 'corazón', 'ojos', 'oído',
  'oidos', 'nariz', 'boca', 'dientes', 'encías', 'piel', 'pelo',
  'pelaje', 'condición corporal', 'condición body', ' palpación',
  'auscultación', 'inspección', 'percusión', 'reflejos', 'ganglios',
  ' temperatura:', 'fc:', 'fr:', 'pa:', 'peso:',
];

const ASSESSMENT_KEYWORDS = [
  'diagnóstico', 'dx', 'se sospecha', 'compatible con', 'sugestivo de',
  'indica', 'probable', 'posible', 'descartar', 'diferencial',
  'hipótesis', 'cuadro clínico', 'síndrome', 'presentación',
  'estadio', 'fase', 'grado', 'severidad', 'leve', 'moderado',
  'severo', 'crítico', 'pronóstico', 'responde a', 'evolución',
];

const PLAN_KEYWORDS = [
  'tratamiento', 'medicamento', 'medicación', 'receta', 'indicación',
  'administrar', 'cada', 'por día', 'por semana', 'días', 'semanas',
  'control', 'revisión', 'seguimiento', 'volver en', 'próxima cita',
  'cirugía', 'intervención', 'esterilización', 'vacuna', 'vacunación',
  'desparasitación', 'análisis', 'examen', 'radiografía', 'ecografía',
  'laboratorio', 'análisis de sangre', 'orina', 'heces', 'Referencia',
  ' derivación', 'interconsulta', 'hospitalización', 'recomendación',
  'dieta', 'alimentación', 'reposo', 'ejercicio', 'cuidados',
];

function detectSection(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) score++;
  }
  return score;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function parseToSoap(text: string): SoapNote {
  if (!text.trim()) {
    return { subjective: '', objective: '', assessment: '', plan: '' };
  }

  const sentences = splitSentences(text);

  const subjective: string[] = [];
  const objective: string[] = [];
  const assessment: string[] = [];
  const plan: string[] = [];

  for (const sentence of sentences) {
    const sScore = detectSection(sentence, SUBJECTIVE_KEYWORDS);
    const oScore = detectSection(sentence, OBJECTIVE_KEYWORDS);
    const aScore = detectSection(sentence, ASSESSMENT_KEYWORDS);
    const pScore = detectSection(sentence, PLAN_KEYWORDS);

    const max = Math.max(sScore, oScore, aScore, pScore);

    if (max === 0) {
      subjective.push(sentence);
    } else if (max === pScore) {
      plan.push(sentence);
    } else if (max === aScore) {
      assessment.push(sentence);
    } else if (max === oScore) {
      objective.push(sentence);
    } else {
      subjective.push(sentence);
    }
  }

  return {
    subjective: subjective.join(' ').trim(),
    objective: objective.join(' ').trim(),
    assessment: assessment.join(' ').trim(),
    plan: plan.join(' ').trim(),
  };
}

export function formatSoapForDisplay(soap: SoapNote): string {
  const sections: string[] = [];
  if (soap.subjective) sections.push(`S: ${soap.subjective}`);
  if (soap.objective) sections.push(`O: ${soap.objective}`);
  if (soap.assessment) sections.push(`A: ${soap.assessment}`);
  if (soap.plan) sections.push(`P: ${soap.plan}`);
  return sections.join('\n\n');
}
