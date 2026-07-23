import { DirectusPet } from '../services/directus';
import { isActive } from './patientFilters';
import { Platform } from 'react-native';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Sin visitas';
  return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportCsv(patients: DirectusPet[], filename: string): Promise<void> {
  const headers = ['Nombre', 'Especie', 'Raza', 'Propietario', 'Telefono', 'Ultima visita', 'Estado'];
  const rows = patients.map(p => [
    p.name,
    p.species === 'dog' ? 'Canino' : 'Felino',
    p.breed || 'Sin raza',
    p.tutor_name || 'Sin propietario',
    p.phone || 'Sin telefono',
    formatDate(p.last_visit),
    isActive(p) ? 'Activo' : 'Inactivo',
  ].map(escapeCsv).join(','));

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
