import { useState, useEffect, useCallback } from 'react';
import {
  api,
  DirectusDisease,
  DirectusPet,
  DirectusMedicalRecord,
  DirectusNote,
  DirectusFavorite,
  Appointment,
  ClinicalRecord,
  InventoryItem,
  Prescription,
  Reminder,
} from '../services/directus';

// ─────────────────────────────────────────────────────────
// Hook: Diseases
// ─────────────────────────────────────────────────────────

export function useDiseases(species?: 'dog' | 'cat' | 'all') {
  const [diseases, setDiseases] = useState<DirectusDisease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiseases = useCallback(async () => {
    setLoading(true);
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

  return { diseases, loading, error, refresh: fetchDiseases };
}

// ─────────────────────────────────────────────────────────
// Hook: Single Disease (with CRUD)
// ─────────────────────────────────────────────────────────

export function useDisease(id: string | null) {
  const [disease, setDisease] = useState<DirectusDisease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisease = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
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

  const fetchPets = useCallback(async () => {
    setLoading(true);
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

  const addPet = async (pet: Omit<DirectusPet, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await api.pets.create(pet);
    await fetchPets();
    return result;
  };

  const updatePet = async (id: string, data: Partial<DirectusPet>) => {
    const result = await api.pets.update(id, data);
    await fetchPets();
    return result;
  };

  const removePet = async (id: string) => {
    await api.pets.delete(id);
    await fetchPets();
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

  const fetchPet = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
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

  const fetchRecords = useCallback(async () => {
    setLoading(true);
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

  const addRecord = async (record: Omit<DirectusMedicalRecord, 'id' | 'created_at'>) => {
    const result = await api.medicalRecords.create(record);
    await fetchRecords();
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

  const fetchNotes = useCallback(async () => {
    setLoading(true);
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

  const addNote = async (note: Omit<DirectusNote, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await api.notes.create(note);
    await fetchNotes();
    return result;
  };

  const updateNote = async (id: string, data: Partial<DirectusNote>) => {
    const result = await api.notes.update(id, data);
    await fetchNotes();
    return result;
  };

  const removeNote = async (id: string) => {
    await api.notes.delete(id);
    await fetchNotes();
  };

  return { notes, loading, error, addNote, updateNote, removeNote, refresh: fetchNotes };
}

// ─────────────────────────────────────────────────────────
// Hook: Favorites
// ─────────────────────────────────────────────────────────

export function useFavorites() {
  const [favorites, setFavorites] = useState<DirectusFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
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
    await fetchFavorites();
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

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
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

  const addAppointment = async (appt: Omit<Appointment, 'id' | 'user_id' | 'created_at'>) => {
    const result = await api.appointments.create(appt);
    await fetchAppointments();
    return result;
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    const result = await api.appointments.update(id, data);
    await fetchAppointments();
    return result;
  };

  const removeAppointment = async (id: string) => {
    await api.appointments.delete(id);
    await fetchAppointments();
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

  const fetchRecords = useCallback(async () => {
    setLoading(true);
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

  const addRecord = async (record: Omit<ClinicalRecord, 'id' | 'user_id' | 'created_at'>) => {
    const result = await api.clinicalRecords.create(record);
    await fetchRecords();
    return result;
  };

  const updateRecord = async (id: string, data: Partial<ClinicalRecord>) => {
    const result = await api.clinicalRecords.update(id, data);
    await fetchRecords();
    return result;
  };

  const removeRecord = async (id: string) => {
    await api.clinicalRecords.delete(id);
    await fetchRecords();
  };

  return { records, loading, error, addRecord, updateRecord, removeRecord, refresh: fetchRecords };
}

// ─────────────────────────────────────────────────────────
// Hook: Inventory
// ─────────────────────────────────────────────────────────

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
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

  const lowStockItems = items.filter(i => i.current_stock <= i.min_stock);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at'>) => {
    const result = await api.inventory.create(item);
    await fetchItems();
    return result;
  };

  const updateItem = async (id: string, data: Partial<InventoryItem>) => {
    const result = await api.inventory.update(id, data);
    await fetchItems();
    return result;
  };

  const removeItem = async (id: string) => {
    await api.inventory.delete(id);
    await fetchItems();
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

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
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

  const addPrescription = async (data: Omit<Prescription, 'id' | 'created_at'>) => {
    const result = await api.prescriptions.create(data);
    await fetchPrescriptions();
    return result;
  };

  const updatePrescription = async (id: string, data: Partial<Prescription>) => {
    const result = await api.prescriptions.update(id, data);
    await fetchPrescriptions();
    return result;
  };

  const removePrescription = async (id: string) => {
    await api.prescriptions.delete(id);
    await fetchPrescriptions();
  };

  const sendEmail = async (id: string) => {
    return await api.prescriptions.sendEmail(id);
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

  const fetchReminders = useCallback(async () => {
    setLoading(true);
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

  const addReminder = async (data: any) => {
    const result = await api.reminders.create(data);
    await fetchReminders();
    return result;
  };

  const autoGenerate = async (petId: string) => {
    const result = await api.reminders.autoGenerate(petId);
    await fetchReminders();
    return result;
  };

  const updateReminder = async (id: string, data: any) => {
    const result = await api.reminders.update(id, data);
    await fetchReminders();
    return result;
  };

  const removeReminder = async (id: string) => {
    await api.reminders.delete(id);
    await fetchReminders();
  };

  const sendPending = async () => {
    const result = await api.reminders.sendPending();
    await fetchReminders();
    return result;
  };

  return { reminders, loading, error, addReminder, autoGenerate, updateReminder, removeReminder, sendPending, refresh: fetchReminders };
}
