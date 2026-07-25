import { useMemo } from 'react';
import { Appointment } from '../../services/directus';

interface PetInfo {
  name: string;
  species: string;
  breed: string;
}

interface DaySummary {
  programadas: number;
  completadas: number;
  pendientes: number;
  canceladas: number;
  total: number;
}

export function useAgendaData(
  appointments: Appointment[],
  pets: any[],
  selectedDate: string,
  searchQuery: string,
  typeFilter: string,
  statusFilter: string,
  vetFilter: string
) {
  const petMap = useMemo(() => {
    const map = new Map<string, PetInfo>();
    pets.forEach((pet: any) => {
      map.set(pet.name, {
        name: pet.name,
        species: pet.species || '',
        breed: pet.breed || '',
      });
    });
    return map;
  }, [pets]);

  const enriched = useMemo(() => {
    return appointments.map((appt) => {
      const pet = petMap.get(appt.patient_name);
      return {
        ...appt,
        species: pet?.species || '',
        breed: pet?.breed || '',
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

  const filtered = useMemo(() => {
    let result = enriched;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.patient_name.toLowerCase().includes(q) ||
          (a.tutor_phone && a.tutor_phone.includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.veterinarian && a.veterinarian.toLowerCase().includes(q))
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

    return result;
  }, [enriched, searchQuery, typeFilter, statusFilter, vetFilter]);

  const daySummary = useMemo(() => {
    const dayAppts = filtered.filter((a) => {
      const d = new Date(a.start_time);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}` === selectedDate;
    });

    return {
      programadas: dayAppts.filter((a) => a.status === 'programada').length,
      completadas: dayAppts.filter((a) => a.status === 'completada').length,
      pendientes: dayAppts.filter((a) => a.status === 'pendiente').length,
      canceladas: dayAppts.filter((a) => a.status === 'cancelada').length,
      total: dayAppts.length,
    };
  }, [filtered, selectedDate]);

  return { filtered, enriched: filtered, uniqueVets, daySummary };
}
