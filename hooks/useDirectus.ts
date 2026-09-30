import { useState, useEffect, useCallback, useRef } from 'react';
import {
  api,
  onDataChange,
  DirectusDisease,
  DirectusPet,
  DirectusMedicalRecord,
  DirectusNote,
  DirectusFavorite,
  Appointment,
  ClinicalRecord,
  Hospitalization,
  InventoryItem,
  Prescription,
  Reminder,
  Medication,
  Surgery,
} from '../services/directus';

// ─────────────────────────────────────────────────────────
// Refetch (silently) when another screen writes to one of these collections
// ─────────────────────────────────────────────────────────

export function useRefreshOn(collections: string[], refresh: (silent: boolean) => unknown) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const key = collections.join(',');
  useEffect(() => {
    const watched = key.split(',');
    return onDataChange((collection) => {
      if (watched.includes(collection)) refreshRef.current(true);
    });
  }, [key]);
}

// ─────────────────────────────────────────────────────────
// Hook: Diseases
// ─────────────────────────────────────────────────────────

export function useDiseases(species?: 'dog' | 'cat' | 'all') {
  const [diseases, setDiseases] = useState<DirectusDisease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiseases = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await api.diseases.list({ species });
      setDiseases(result as DirectusDisease[]);
    } catch (err: any) {
      console.error('Error fetching diseases:', err);
      setError(err.message || 'Error fetching diseases');
    } finally {
      setLoading(false);
    }
  }, [species]);

  useEffect(() => {
    fetchDiseases();
  }, [fetchDiseases]);
  useRefreshOn(['diseases'], fetchDiseases);

  return { diseases, loading, error, refresh: fetchDiseases };
}

// ─────────────────────────────────────────────────────────
// Hook: Medications
// ─────────────────────────────────────────────────────────

export function useMedications(especialidad?: string) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (especialidad && especialidad !== 'todas') {
        params.especialidad = especialidad;
      }
      const result = await api.medications.list(params);
      setMedications(result as Medication[]);
    } catch (err: any) {
      console.error('Error fetching medications:', err);
      setError(err.message || 'Error fetching medications');
    } finally {
      setLoading(false);
    }
  }, [especialidad]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);
  useRefreshOn(['medications'], fetchMedications);

  return { medications, loading, error, refresh: fetchMedications };
}

// ─────────────────────────────────────────────────────────
// Hook: Surgeries Library
// ─────────────────────────────────────────────────────────

export function useSurgeries(search?: string) {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurgeries = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (search) params.search = search;
      const result = await api.surgeries.list(params);
      setSurgeries(result as Surgery[]);
    } catch (err: any) {
      console.error('Error fetching surgeries:', err);
      setError(err.message || 'Error fetching surgeries');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSurgeries();
  }, [fetchSurgeries]);

  return { surgeries, loading, error, refresh: fetchSurgeries };
}

// ─────────────────────────────────────────────────────────
// Hook: Single Disease (with CRUD)
// ─────────────────────────────────────────────────────────

export function useDisease(id: string | null) {
  const [disease, setDisease] = useState<DirectusDisease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisease = useCallback(async (silent: boolean = false) => {
    if (!id) { setLoading(false); return; }
    if (!silent) setLoading(true);
    try {
      const result = await api.diseases.get(id);
      setDisease(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDisease();
  }, [fetchDisease]);
  useRefreshOn(['diseases'], fetchDisease);

  const updateDisease = async (data: Partial<DirectusDisease>) => {
    if (!id) return;
    const result = await api.diseases.update(id, data);
    setDisease(result);
    return result;
  };

  const deleteDisease = async () => {
    if (!id) return;
    await api.diseases.delete(id);
  };

  return { disease, loading, error, updateDisease, deleteDisease, refresh: fetchDisease };
}

// ─────────────────────────────────────────────────────────
// Hook: Pets
// ─────────────────────────────────────────────────────────

export function usePets() {
  const [pets, setPets] = useState<DirectusPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await api.pets.list();
      setPets(result as DirectusPet[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);
  useRefreshOn(['pets', 'clinical_records'], fetchPets);

  const addPet = async (pet: Omit<DirectusPet, 'id' | 'created_at' | 'updated_at' | 'last_visit' | 'organization_id'>) => {
    const result = await api.pets.create(pet);
    return result;
  };

  const updatePet = async (id: string, data: Partial<DirectusPet>) => {
    const result = await api.pets.update(id, data);
    return result;
  };

  const removePet = async (id: string) => {
    await api.pets.delete(id);
  };

  return { pets, loading, error, addPet, updatePet, removePet, refresh: fetchPets };
}

// ─────────────────────────────────────────────────────────
// Hook: Single Pet
// ─────────────────────────────────────────────────────────

export function usePet(id: string | null) {
  const [pet, setPet] = useState<DirectusPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPet = useCallback(async (silent: boolean = false) => {
    if (!id) { setLoading(false); return; }
    if (!silent) setLoading(true);
    try {
      const result = await api.pets.get(id);
      setPet(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);
  useRefreshOn(['pets'], fetchPet);

  const updatePet = async (data: Partial<DirectusPet>) => {
    if (!id) return;
    const result = await api.pets.update(id, data);
    setPet(result);
    return result;
  };

  return { pet, loading, error, updatePet, refresh: fetchPet };
}

// ─────────────────────────────────────────────────────────
// Hook: Medical Records
// ─────────────────────────────────────────────────────────

export function useMedicalRecords(petId?: string) {
  const [records, setRecords] = useState<DirectusMedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await api.medicalRecords.list(petId);
      setRecords(result as DirectusMedicalRecord[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  useRefreshOn(['medical_records'], fetchRecords);

  const addRecord = async (record: Omit<DirectusMedicalRecord, 'id' | 'created_at'>) => {
    const result = await api.medicalRecords.create(record);
    return result;
  };

  return { records, loading, error, addRecord, refresh: fetchRecords };
}

// ─────────────────────────────────────────────────────────
// Hook: Notes
// ─────────────────────────────────────────────────────────

export function useNotes() {
  const [notes, setNotes] = useState<DirectusNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await api.notes.list();
      setNotes(result as DirectusNote[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);
  useRefreshOn(['personal_notes'], fetchNotes);

  const addNote = async (note: Omit<DirectusNote, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await api.notes.create(note);
    return result;
  };

  const updateNote = async (id: string, data: Partial<DirectusNote>) => {
    const result = await api.notes.update(id, data);
    return result;
  };

  const removeNote = async (id: string) => {
    await api.notes.delete(id);
  };

  return { notes, loading, error, addNote, updateNote, removeNote, refresh: fetchNotes };
}

// ─────────────────────────────────────────────────────────
// Hook: Favorites
// ─────────────────────────────────────────────────────────

export function useFavorites() {
  const [favorites, setFavorites] = useState<DirectusFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await api.favorites.list();
      setFavorites(result as DirectusFavorite[]);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);
  useRefreshOn(['favorites'], fetchFavorites);

  const favoriteIds = new Set(favorites.map(f => {
    const id = typeof f.disease_id === 'string' ? f.disease_id : f.disease_id?.id;
    return id;
  }).filter(Boolean));

  const isFavorite = (diseaseId: string) => favoriteIds.has(diseaseId);

  const toggleFavorite = async (diseaseId: string) => {
    if (isFavorite(diseaseId)) {
      const fav = favorites.find(f => {
        const id = typeof f.disease_id === 'string' ? f.disease_id : f.disease_id?.id;
        return id === diseaseId;
      });
      if (fav) {
        await api.favorites.delete(fav.id);
      }
    } else {
      await api.favorites.create({
        disease_id: diseaseId,
        category: 'frequently_used',
        added_at: new Date().toISOString(),
      });
    }
  };

  return { favorites, favoriteIds, isFavorite, toggleFavorite, loading, refresh: fetchFavorites };
}

// ─────────────────────────────────────────────────────────
// Hook: Appointments
// ─────────────────────────────────────────────────────────

export function useAppointments(startDate?: string, endDate?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const params: { start?: string; end?: string } = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;
      const result = await api.appointments.list(Object.keys(params).length ? params : undefined);
      setAppointments(result as Appointment[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  useRefreshOn(['appointments'], fetchAppointments);

  const addAppointment = async (appt: Omit<Appointment, 'id' | 'user_id' | 'created_at'>) => {
    const result = await api.appointments.create(appt);
    return result;
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    const result = await api.appointments.update(id, data);
    return result;
  };

  const removeAppointment = async (id: string) => {
    await api.appointments.delete(id);
  };

  return { appointments, loading, error, addAppointment, updateAppointment, removeAppointment, refresh: fetchAppointments };
}

// ─────────────────────────────────────────────────────────
// Hook: Clinical Records
// ─────────────────────────────────────────────────────────

export function useClinicalRecords(petId?: string, recordType?: string) {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await api.clinicalRecords.list(petId, recordType);
      setRecords(result as ClinicalRecord[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [petId, recordType]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  useRefreshOn(['clinical_records'], fetchRecords);

  const addRecord = async (record: Omit<ClinicalRecord, 'id' | 'user_id' | 'created_at'>) => {
    const result = await api.clinicalRecords.create(record);
    return result;
  };

  const updateRecord = async (id: string, data: Partial<ClinicalRecord>) => {
    const result = await api.clinicalRecords.update(id, data);
    return result;
  };

  const removeRecord = async (id: string) => {
    await api.clinicalRecords.delete(id);
  };

  return { records, loading, error, addRecord, updateRecord, removeRecord, refresh: fetchRecords };
}

// ─────────────────────────────────────────────────────────
// Hook: Hospitalizations
// ─────────────────────────────────────────────────────────

export function useHospitalizations(status?: string) {
  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitalizations = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const params: { status?: string } = {};
      if (status && status !== 'todos') params.status = status;
      const result = await api.hospitalizations.list(Object.keys(params).length ? params : undefined);
      setHospitalizations(result as Hospitalization[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchHospitalizations();
  }, [fetchHospitalizations]);
  useRefreshOn(['hospitalizations'], fetchHospitalizations);

  const addHospitalization = async (data: Omit<Hospitalization, 'id' | 'created_at' | 'pet_name' | 'species' | 'breed'>) => {
    const result = await api.hospitalizations.create(data);
    return result;
  };

  const updateHospitalization = async (id: string, data: Partial<Hospitalization>) => {
    const result = await api.hospitalizations.update(id, data);
    return result;
  };

  const discharge = async (id: string) => {
    const result = await api.hospitalizations.update(id, {
      status: 'discharged',
      discharge_date: new Date().toISOString(),
    });
    return result;
  };

  const removeHospitalization = async (id: string) => {
    await api.hospitalizations.delete(id);
  };

  return { hospitalizations, loading, error, addHospitalization, updateHospitalization, discharge, removeHospitalization, refresh: fetchHospitalizations };
}

// ─────────────────────────────────────────────────────────
// Hook: Inventory
// ─────────────────────────────────────────────────────────

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await api.inventory.list();
      setItems(result as InventoryItem[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  useRefreshOn(['inventory'], fetchItems);

  const lowStockItems = items.filter(i => i.current_stock <= i.min_stock);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at'>) => {
    const result = await api.inventory.create(item);
    return result;
  };

  const updateItem = async (id: string, data: Partial<InventoryItem>) => {
    const result = await api.inventory.update(id, data);
    return result;
  };

  const removeItem = async (id: string) => {
    await api.inventory.delete(id);
  };

  return { items, lowStockItems, loading, error, addItem, updateItem, removeItem, refresh: fetchItems };
}

// ─────────────────────────────────────────────────────────
// Hook: Prescriptions
// ─────────────────────────────────────────────────────────

export function usePrescriptions(petId?: string) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await api.prescriptions.list(petId);
      setPrescriptions(result as Prescription[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);
  useRefreshOn(['prescriptions'], fetchPrescriptions);

  const addPrescription = async (data: Omit<Prescription, 'id' | 'created_at'>) => {
    const result = await api.prescriptions.create(data);
    return result;
  };

  const updatePrescription = async (id: string, data: Partial<Prescription>) => {
    const result = await api.prescriptions.update(id, data);
    return result;
  };

  const removePrescription = async (id: string) => {
    await api.prescriptions.delete(id);
  };

  const sendEmail = async (id: string, to?: string) => {
    return await api.prescriptions.sendEmail(id, to);
  };

  return { prescriptions, loading, error, addPrescription, updatePrescription, removePrescription, sendEmail, refresh: fetchPrescriptions };
}

// ─────────────────────────────────────────────────────────
// Hook: Reminders
// ─────────────────────────────────────────────────────────

export function useReminders(params?: { status?: string; type?: string; upcoming?: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await api.reminders.list(params);
      setReminders(result as Reminder[]);
    } catch (err: any) {
      console.error('Error fetching reminders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.type, params?.upcoming]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);
  useRefreshOn(['reminders'], fetchReminders);

  const addReminder = async (data: any) => {
    const result = await api.reminders.create(data);
    return result;
  };

  const autoGenerate = async (petId: string) => {
    const result = await api.reminders.autoGenerate(petId);
    return result;
  };

  const updateReminder = async (id: string, data: any) => {
    const result = await api.reminders.update(id, data);
    return result;
  };

  const removeReminder = async (id: string) => {
    await api.reminders.delete(id);
  };

  const sendPending = async () => {
    const result = await api.reminders.sendPending();
    return result;
  };

  return { reminders, loading, error, addReminder, autoGenerate, updateReminder, removeReminder, sendPending, refresh: fetchReminders };
}

// ─────────────────────────────────────────────────────────
// Hook: Vet Assistant
// ─────────────────────────────────────────────────────────

export function useAssistant() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string; actions?: any[]; data?: any }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    setLoading(true);
    try {
      const result = await api.assistant.query(message);
      setMessages(prev => [...prev, { sender: 'assistant', text: result.text, actions: result.actions, data: result.data }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: 'assistant', text: 'Error al procesar su consulta.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => setMessages([]);

  return { messages, loading, sendMessage, clearMessages };
}
