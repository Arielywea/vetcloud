import { DirectusPet } from '../services/directus';
import { isActive } from './patientFilters';
import { Platform } from 'react-native';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Sin visitas';
  return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return 'N/D';
  const bd = new Date(birthDate);
  if (isNaN(bd.getTime())) return 'N/D';
  const months = Math.floor((Date.now() - bd.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs > 0) return `${yrs}a ${mos}m`;
  return `${mos}m`;
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportCsv(patients: DirectusPet[], filename: string, options?: { includeMedical?: boolean }): Promise<void> {
  const baseHeaders = [
    'Nombre', 'Especie', 'Raza', 'Sexo', 'Edad', 'Peso (kg)',
    'Propietario', 'Telefono', 'Email', 'Direccion',
    'Ultima visita', 'Estado'
  ];

  const medicalHeaders = options?.includeMedical ? [
    'Alergias', 'Enfermedades base', 'Pre-diagnostico', 'Color', 'Esterilizado', 'Notas'
  ] : [];

  const headers = [...baseHeaders, ...medicalHeaders];

  const rows = patients.map(p => {
    const base = [
      p.name,
      p.species === 'dog' ? 'Canino' : p.species === 'cat' ? 'Felino' : 'N/D',
      p.breed || 'Sin raza',
      p.sex === 'macho' ? 'Macho' : p.sex === 'hembra' ? 'Hembra' : 'N/D',
      calculateAge(p.birth_date || null),
      p.weight ? String(p.weight) : 'N/D',
      p.tutor_name || 'Sin propietario',
      p.phone || 'Sin telefono',
      p.tutor_email || '',
      p.address || '',
      formatDate(p.last_visit),
      isActive(p) ? 'Activo' : 'Inactivo',
    ];

    const medical = options?.includeMedical ? [
      p.allergies || '',
      p.base_diseases?.join('; ') || '',
      p.pre_diagnostico || '',
      p.color || '',
      p.reproductive_status || '',
      p.notes || '',
    ] : [];

    return [...base, ...medical].map(escapeCsv).join(',');
  });

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
