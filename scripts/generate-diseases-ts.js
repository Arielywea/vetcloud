const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/diseases-dump.json', 'utf8'));

const dogs = data.filter(d => d.species === 'dog');
const cats = data.filter(d => d.species === 'cat');
const both = data.filter(d => d.species === 'both');

function esc(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/'/g, "\\'").replace(/\n/g, ' ');
}

function formatDisease(d, idx) {
  const id = d.name.toLowerCase()
    .replace(/[^a-z0-9\u00f1\u00e1\u00e9\u00ed\u00f3\u00fa ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `  {
    id: '${id}',
    name: '${esc(d.name)}',
    scientificName: '${esc(d.scientificName)}',
    species: '${d.species}',
    category: '${d.category}',
    severity: '${d.severity}',
    description: '${esc(d.description)}',
    pathophysiology: '${esc(d.pathophysiology)}',
    keySigns: ${JSON.stringify(d.keySigns)},
    diagnosis: ${JSON.stringify(d.diagnosis)},
    treatment: ${JSON.stringify(d.treatment)},
    prevention: ${JSON.stringify(d.prevention)},
    prognosis: '${d.prognosis}',
    isZoonotic: ${d.isZoonotic},
    references: ${JSON.stringify(d.references)},
  }`;
}

const dogDiseases = [...dogs, ...both].map(formatDisease).join(',\n');
const catDiseases = [...cats, ...both].map(formatDisease).join(',\n');

const out = `import { Disease, DiseaseCategory, Species } from '../types';

const DISEASE_CATEGORIES: Record<DiseaseCategory, { label: string; icon: string; color: string }> = {
  infectious: { label: 'Infecciosas', icon: 'virus', color: '#E53935' },
  parasitic: { label: 'Parasitarias', icon: 'bug-outline', color: '#8E24AA' },
  degenerative: { label: 'Degenerativas', icon: 'trending-down', color: '#F57C00' },
  oncological: { label: 'Oncol\u00f3gicas', icon: 'alert-circle', color: '#C62828' },
  nutritional: { label: 'Nutricionales', icon: 'nutrition', color: '#43A047' },
  autoimmune: { label: 'Autoinmunes', icon: 'shield', color: '#1565C0' },
  traumatic: { label: 'Traum\u00e1ticas', icon: 'bandage', color: '#6D4C41' },
  congenital: { label: 'Cong\u00e9nitas', icon: 'dna', color: '#00838F' },
  respiratory: { label: 'Respiratorias', icon: 'lungs', color: '#26A69A' },
  gastrointestinal: { label: 'Gastrointestinales', icon: 'stomach', color: '#7CB342' },
  dermatological: { label: 'Dermatol\u00f3gicas', icon: 'hand-heart', color: '#EC407A' },
  ocular: { label: 'Oculares', icon: 'eye', color: '#5C6BC0' },
  dental: { label: 'Dentales', icon: 'tooth', color: '#78909C' },
  endocrine: { label: 'Endocrinas', icon: 'flask', color: '#AB47BC' },
  cardiovascular: { label: 'Cardiovasculares', icon: 'heart-pulse', color: '#E53935' },
  neurological: { label: 'Neurol\u00f3gicas', icon: 'brain', color: '#7E57C2' },
  musculoskeletal: { label: 'Musculoesquel\u00e9ticas', icon: 'bone', color: '#8D6E63' },
  renal: { label: 'Renales', icon: 'kidney', color: '#0097A7' },
  reproductive: { label: 'Reproductivas', icon: 'baby-carriage', color: '#EC407A' },
  toxic: { label: 'T\u00f3xicas', icon: 'skull', color: '#D32F2F' },
  urological: { label: 'Urol\u00f3gicas', icon: 'kidney', color: '#00838F' },
};

const DOG_DISEASES: Disease[] = [
${dogDiseases},
];

const CAT_DISEASES: Disease[] = [
${catDiseases},
];

export const ALL_DISEASES: Disease[] = [...DOG_DISEASES, ...CAT_DISEASES];

export const SPECIES_INFO = {
  dog: { label: 'Perro', icon: 'dog', color: '#4CAF50' },
  cat: { label: 'Gato', icon: 'cat', color: '#FF9800' },
  both: { label: 'Ambos', icon: 'paw', color: '#2196F3' },
} as const;

export { DISEASE_CATEGORIES, DOG_DISEASES, CAT_DISEASES };
`;

fs.writeFileSync('constants/diseases.ts', out);
console.log('Written: ' + (out.length / 1024).toFixed(1) + ' KB, ' + data.length + ' diseases');
