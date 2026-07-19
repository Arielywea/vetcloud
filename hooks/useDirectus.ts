import { useState, useEffect, useCallback } from 'react';
import {
  api,
  DirectusDisease,
  DirectusPet,
  DirectusMedicalRecord,
  DirectusNote,
  DirectusFavorite,
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

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchPet = async () => {
      setLoading(true);
      try {
        const result = await api.pets.get(id);
        setPet(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  return { pet, loading, error };
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
