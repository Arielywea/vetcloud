import * as XLSX from 'xlsx';
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

export async function exportCsv(patients: DirectusPet[], filename: string, options?: { includeMedical?: boolean }): Promise<void> {
  const headers = [
    'Nombre', 'Especie', 'Raza', 'Sexo', 'Edad', 'Peso (kg)',
    'Propietario', 'Telefono', 'Email', 'Direccion',
    'Ultima visita', 'Estado',
    ...(options?.includeMedical ? [
      'Alergias', 'Enfermedades base', 'Pre-diagnostico', 'Color', 'Esterilizado', 'Notas'
    ] : []),
  ];

  const data = patients.map(p => {
    const base = [
      p.name,
      p.species === 'dog' ? 'Canino' : p.species === 'cat' ? 'Felino' : 'N/D',
      p.breed || 'Sin raza',
      p.sex === 'macho' ? 'Macho' : p.sex === 'hembra' ? 'Hembra' : 'N/D',
      calculateAge(p.birth_date || null),
      p.weight ? Number(p.weight) : '',
      p.tutor_name || 'Sin propietario',
      p.phone || '',
      p.tutor_email || '',
      p.address || '',
      formatDate(p.last_visit),
      isActive(p) ? 'Activo' : 'Inactivo',
    ];

    const medical = options?.includeMedical ? [
      p.allergies || '',
      p.base_diseases?.join(', ') || '',
      p.pre_diagnostico || '',
      p.color || '',
      p.reproductive_status || '',
      p.notes || '',
    ] : [];

    return [...base, ...medical];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...data.map(row => String(row[i] ?? '').length));
    return { wch: Math.min(maxLen + 2, 40) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');

  const xlsxBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

  if (Platform.OS === 'web') {
    const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    const Sharing = await import('expo-sharing');
    const FileSystem = await import('expo-file-system');
    const base64 = arrayBufferToBase64(xlsxBuffer);
    const fileUri = FileSystem.documentDirectory + `${filename}.xlsx`;
    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(fileUri);
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
