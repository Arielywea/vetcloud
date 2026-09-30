import { useState, useEffect, useMemo, useCallback } from 'react';
import { Appointment, api } from '../../services/directus';
import { toLocalDateKey } from '../../utils/date';
import { useRefreshOn } from '../../hooks/useDirectus';

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
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      // Both are needed; a failure must be visible, not look like an empty agenda
      const [appts, petsList] = await Promise.all([api.appointments.list(), api.pets.list()]);
      setRawAppointments(Array.isArray(appts) ? appts : []);
      setPets(Array.isArray(petsList) ? petsList : []);
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar la agenda');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useRefreshOn(['appointments', 'pets'], fetchData);

  const petMap = useMemo(() => new Map<string, any>(pets.map((pet: any) => [pet.id, pet])), [pets]);

  // Only an explicit pet_id links an appointment to a chart. Name matching
  // ("Max" ~ "Maximus", two "Luna") opened the wrong patient's record.
  const enriched = useMemo((): EnrichedAppointment[] => {
    return rawAppointments.map((appt) => {
      const pet = appt.pet_id ? petMap.get(appt.pet_id) || null : null;
      return {
        ...appt,
        pet_id: appt.pet_id,
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

  // Distinct veterinarians for the sidebar filter (was always an empty list)
  const veterinarians = useMemo(
    () => Array.from(new Set(rawAppointments.map((a: any) => (a.veterinarian || '').trim()).filter(Boolean))).sort(),
    [rawAppointments],
  );

  return { appointments, allAppointments: enriched, loading, error, summary, veterinarians, refetch: fetchData };
}
