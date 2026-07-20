param()
$ErrorActionPreference = 'Stop'
$data = Get-Content "scripts/diseases-dump.json" -Raw -Encoding UTF8 | ConvertFrom-Json

$dogs = $data | Where-Object { $_.species -eq 'dog' -or $_.species -eq 'both' }
$cats = $data | Where-Object { $_.species -eq 'cat' -or $_.species -eq 'both' }

function Format-Disease($d) {
  $id = ($d.name -replace '[^a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ -]','').Trim().Replace(' ','-') -replace '-+','-'
  $name = ($d.name -replace "'","")
  $sci = ($d.scientific_name -replace "'","")
  $desc = ($d.description -replace "'","")
  $patho = ($d.pathophysiology -replace "'","")
  $ks = $d.key_signs | ConvertTo-Json -Compress
  $diag = $d.diagnosis | ConvertTo-Json -Compress -Depth 5
  $tx = $d.treatment | ConvertTo-Json -Compress -Depth 5
  $prev = $d.prevention | ConvertTo-Json -Compress
  $refs = $d.references_list | ConvertTo-Json -Compress
  $lines = @(
    "  {",
    "    id: '$id',",
    "    name: '$name',",
    "    scientificName: '$sci',",
    "    species: '$($d.species)',",
    "    category: '$($d.category)',",
    "    severity: '$($d.severity)',",
    "    description: '$desc',",
    "    pathophysiology: '$patho',",
    "    keySigns: $ks,",
    "    diagnosis: $diag,",
    "    treatment: $tx,",
    "    prevention: $prev,",
    "    prognosis: '$($d.prognosis)',",
    "    isZoonotic: $($d.is_zoonotic.ToString().ToLower()),",
    "    references: $refs,",
    "  }"
  )
  return $lines -join "`n"
}

$header = @'
import { Disease, DiseaseCategory } from '../types';

const DISEASE_CATEGORIES: Record<DiseaseCategory, { label: string; icon: string; color: string }> = {
  infectious: { label: 'Infecciosas', icon: 'virus', color: '#E53935' },
  parasitic: { label: 'Parasitarias', icon: 'bug-outline', color: '#8E24AA' },
  degenerative: { label: 'Degenerativas', icon: 'trending-down', color: '#F57C00' },
  oncological: { label: 'Oncológicas', icon: 'alert-circle', color: '#C62828' },
  nutritional: { label: 'Nutricionales', icon: 'nutrition', color: '#43A047' },
  autoimmune: { label: 'Autoinmunes', icon: 'shield', color: '#1565C0' },
  traumatic: { label: 'Traumáticas', icon: 'bandage', color: '#6D4C41' },
  congenital: { label: 'Congénitas', icon: 'dna', color: '#00838F' },
  respiratory: { label: 'Respiratorias', icon: 'lungs', color: '#26A69A' },
  gastrointestinal: { label: 'Gastrointestinales', icon: 'stomach', color: '#7CB342' },
  dermatological: { label: 'Dermatológicas', icon: 'hand-heart', color: '#EC407A' },
  ocular: { label: 'Oculares', icon: 'eye', color: '#5C6BC0' },
  dental: { label: 'Dentales', icon: 'tooth', color: '#78909C' },
  endocrine: { label: 'Endocrinas', icon: 'flask', color: '#AB47BC' },
  cardiovascular: { label: 'Cardiovasculares', icon: 'heart-pulse', color: '#E53935' },
  neurological: { label: 'Neurológicas', icon: 'brain', color: '#7E57C2' },
  musculoskeletal: { label: 'Musculoesqueléticas', icon: 'bone', color: '#8D6E63' },
  renal: { label: 'Renales', icon: 'kidney', color: '#0097A7' },
  reproductive: { label: 'Reproductivas', icon: 'baby-carriage', color: '#EC407A' },
  toxic: { label: 'Tóxicas', icon: 'skull', color: '#D32F2F' },
  urological: { label: 'Urológicas', icon: 'kidney', color: '#00838F' },
};

'@

$dogEntries = $dogs | ForEach-Object { Format-Disease $_ }
$catEntries = $cats | ForEach-Object { Format-Disease $_ }

$dogSection = "const DOG_DISEASES: Disease[] = [`n" + ($dogEntries -join ",`n") + ",`n];"
$catSection = "`nconst CAT_DISEASES: Disease[] = [`n" + ($catEntries -join ",`n") + ",`n];"

$footer = @'

export const ALL_DISEASES: Disease[] = [...DOG_DISEASES, ...CAT_DISEASES];

export const SPECIES_INFO = {
  dog: { label: 'Perro', icon: 'dog', color: '#4CAF50' },
  cat: { label: 'Gato', icon: 'cat', color: '#FF9800' },
  both: { label: 'Ambos', icon: 'paw', color: '#2196F3' },
} as const;

export { DISEASE_CATEGORIES, DOG_DISEASES, CAT_DISEASES };
'@

$out = $header + $dogSection + $catSection + $footer
[System.IO.File]::WriteAllText("$PWD\constants\diseases.ts", $out, [System.Text.UTF8Encoding]::new($false))
$kb = [math]::Round($out.Length / 1024, 1)
Write-Host "Written: $kb KB, $($data.Length) diseases"
