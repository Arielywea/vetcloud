import { useState, useEffect, useMemo, useCallback } from 'react';
import { Appointment, api } from '../../services/directus';
import { toLocalDateKey } from '../../utils/date';

interface EnrichedAppointment extends Appointment {
  petPhoto: string | null;
  petSpecies: string;
  petBreed: string;
  petWeight: number | null;
  petSex: string | null;
  tutorName: string;
}

interface AgendaFilters {
  veterinarian: string;
  species: string;
  appointmentType: string;
  status: string;
}

interface UseAgendaDataOptions {
  selectedDate: Date;
  searchQuery: string;
  filters: AgendaFilters;
}

export default function useAgendaData({ selectedDate, searchQuery, filters }: UseAgendaDataOptions) {
  const [rawAppointments, setRawAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let appts: Appointment[] = [];
      let petsList: any[] = [];
      try {
        const apptsRes = await api.appointments.list({ sort: 'start_time' });
        appts = Array.isArray(apptsRes) ? apptsRes : apptsRes?.data || [];
      } catch (e) {
        console.error('Failed to fetch appointments:', e);
      }
      try {
        const petsRes = await api.pets.list();
        petsList = Array.isArray(petsRes) ? petsRes : petsRes?.data || [];
      } catch (e) {
        console.error('Failed to fetch pets:', e);
      }
      setRawAppointments(appts);
      setPets(petsList);
    } catch (err) {
      console.error('Failed to fetch agenda data:', err);
      setRawAppointments([]);
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const petMap = useMemo(() => {
    const map = new Map<string, any>();
    pets.forEach((pet: any) => {
      map.set(pet.id, pet);
      if (pet.name) map.set(pet.name.toLowerCase(), pet);
    });
    return map;
  }, [pets]);

  const enriched = useMemo((): EnrichedAppointment[] => {
    return rawAppointments.map((appt) => {
      let pet = null;
      if (appt.pet_id) {
        pet = petMap.get(appt.pet_id);
      }
      if (!pet && appt.patient_name) {
        const nameKey = appt.patient_name.toLowerCase().trim();
        pet = petMap.get(nameKey);
        if (!pet) {
          const allPets = Array.from(petMap.values());
          pet = allPets.find((p: any) => {
            const petName = (p.name || '').toLowerCase().trim();
            return petName && (petName.includes(nameKey) || nameKey.includes(petName));
          }) || null;
        }
      }
      return {
        ...appt,
        pet_id: pet?.id || appt.pet_id,
        petPhoto: pet?.photo || null,
        petSpecies: pet?.species || '',
        petBreed: pet?.breed || '',
        petWeight: pet?.weight || null,
        petSex: pet?.sex || null,
        tutorName: pet?.tutor_name || '',
      };
    });
  }, [rawAppointments, petMap]);

  const dateKey = useMemo(() => toLocalDateKey(selectedDate), [selectedDate]);

  const appointments = useMemo(() => {
    let result = enriched;

    // Search filter
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

    // Type filter
    if (filters.appointmentType && filters.appointmentType !== 'all') {
      result = result.filter((a) => a.appointment_type === filters.appointmentType);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter((a) => a.status === filters.status);
    }

    // Vet filter
    if (filters.veterinarian && filters.veterinarian !== 'all') {
      result = result.filter((a) => a.veterinarian === filters.veterinarian);
    }

    // Species filter
    if (filters.species && filters.species !== 'all') {
      result = result.filter((a) => a.petSpecies === filters.species);
    }

    return result;
  }, [enriched, searchQuery, filters]);

  const summary = useMemo(() => {
    const dayAppts = enriched.filter((a) => {
      const d = new Date(a.start_time);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}` === dateKey;
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
  }, [enriched, dateKey]);

  return { appointments, loading, summary, refetch: fetchData };
}
