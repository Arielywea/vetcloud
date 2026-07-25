import { useMemo } from 'react';
import { Appointment } from '../../services/directus';

interface EnrichedAppointment extends Appointment {
  petPhoto: string | null;
  petSpecies: string;
  petBreed: string;
  petWeight: number | null;
  petSex: string | null;
  tutorName: string;
}

interface DaySummary {
  total: number;
  programadas: number;
  confirmadas: number;
  en_espera: number;
  en_consulta: number;
  completadas: number;
  pendientes: number;
  canceladas: number;
  ausentes: number;
  porTipo: Record<string, number>;
  tiempoOcupado: number;
  tiempoLibre: number;
  retrasos: number;
}

export function useAgendaData(
  appointments: Appointment[],
  pets: any[],
  selectedDate: string,
  searchQuery: string,
  typeFilter: string,
  statusFilter: string,
  vetFilter: string,
  speciesFilter: string
) {
  const petMap = useMemo(() => {
    const map = new Map<string, any>();
    pets.forEach((pet: any) => {
      map.set(pet.name.toLowerCase(), pet);
      map.set(pet.id, pet);
    });
    return map;
  }, [pets]);

  const enriched = useMemo((): EnrichedAppointment[] => {
    return appointments.map((appt) => {
      let pet = null;
      if (appt.pet_id) {
        pet = petMap.get(appt.pet_id);
      }
      if (!pet && appt.patient_name) {
        pet = petMap.get(appt.patient_name.toLowerCase());
      }
      return {
        ...appt,
        petPhoto: pet?.photo || null,
        petSpecies: pet?.species || '',
        petBreed: pet?.breed || '',
        petWeight: pet?.weight || null,
        petSex: pet?.sex || null,
        tutorName: pet?.tutor_name || '',
      };
    });
  }, [appointments, petMap]);

  const uniqueVets = useMemo(() => {
    const vets = new Set<string>();
    appointments.forEach((a) => {
      if (a.veterinarian) vets.add(a.veterinarian);
    });
    return Array.from(vets).sort();
  }, [appointments]);

  const uniqueSpecies = useMemo(() => {
    const species = new Set<string>();
    enriched.forEach((a) => {
      if (a.petSpecies) species.add(a.petSpecies);
    });
    return Array.from(species).sort();
  }, [enriched]);

  const filtered = useMemo(() => {
    let result = enriched;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.patient_name.toLowerCase().includes(q) ||
          (a.tutor_phone && a.tutor_phone.includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.veterinarian && a.veterinarian.toLowerCase().includes(q)) ||
          (a.petBreed && a.petBreed.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((a) => a.appointment_type === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (vetFilter !== 'all') {
      result = result.filter((a) => a.veterinarian === vetFilter);
    }

    if (speciesFilter !== 'all') {
      result = result.filter((a) => a.petSpecies === speciesFilter);
    }

    return result;
  }, [enriched, searchQuery, typeFilter, statusFilter, vetFilter, speciesFilter]);

  const daySummary = useMemo((): DaySummary => {
    const dayAppts = filtered.filter((a) => {
      const d = new Date(a.start_time);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}` === selectedDate;
    });

    const now = new Date();
    let tiempoOcupado = 0;
    let retrasos = 0;

    dayAppts.forEach((a) => {
      if (a.start_time && a.end_time) {
        const start = new Date(a.start_time);
        const end = new Date(a.end_time);
        tiempoOcupado += (end.getTime() - start.getTime()) / 60000;
      }
      if (a.start_time && a.status !== 'completada' && a.status !== 'cancelada') {
        const start = new Date(a.start_time);
        if (start < now) retrasos++;
      }
    });

    const totalMinutes = 11 * 60;
    const tiempoLibre = Math.max(0, totalMinutes - tiempoOcupado);

    const porTipo: Record<string, number> = {};
    dayAppts.forEach((a) => {
      porTipo[a.appointment_type] = (porTipo[a.appointment_type] || 0) + 1;
    });

    return {
      total: dayAppts.length,
      programadas: dayAppts.filter((a) => a.status === 'programada').length,
      confirmadas: dayAppts.filter((a) => a.status === 'confirmada').length,
      en_espera: dayAppts.filter((a) => a.status === 'en_espera').length,
      en_consulta: dayAppts.filter((a) => a.status === 'en_consulta').length,
      completadas: dayAppts.filter((a) => a.status === 'completada').length,
      pendientes: dayAppts.filter((a) => a.status === 'pendiente').length,
      canceladas: dayAppts.filter((a) => a.status === 'cancelada').length,
      ausentes: dayAppts.filter((a) => a.status === 'ausente').length,
      porTipo,
      tiempoOcupado,
      tiempoLibre,
      retrasos,
    };
  }, [filtered, selectedDate]);

  return { filtered, enriched: filtered, uniqueVets, uniqueSpecies, daySummary };
}
