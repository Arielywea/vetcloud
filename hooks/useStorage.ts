import { useState, useEffect, useCallback } from 'react';
import { Pet, MedicalRecord, Vaccination } from '../types';
import { StorageService } from '../services/storage';

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPets = useCallback(async () => {
    setLoading(true);
    const data = await StorageService.getPets();
    setPets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const addPet = async (pet: Pet) => {
    await StorageService.savePet(pet);
    await loadPets();
  };

  const updatePet = async (pet: Pet) => {
    await StorageService.savePet(pet);
    await loadPets();
  };

  const deletePet = async (petId: string) => {
    await StorageService.deletePet(petId);
    await loadPets();
  };

  const addRecord = async (petId: string, record: MedicalRecord) => {
    await StorageService.addMedicalRecord(petId, record);
    await loadPets();
  };

  const addVaccination = async (petId: string, vaccination: Vaccination) => {
    await StorageService.addVaccination(petId, vaccination);
    await loadPets();
  };

  return { pets, loading, addPet, updatePet, deletePet, addRecord, addVaccination, refresh: loadPets };
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    const favs = await StorageService.getFavorites();
    setFavoriteIds(new Set(favs.map(f => f.diseaseId)));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (diseaseId: string) => {
    await StorageService.toggleFavorite(diseaseId);
    await loadFavorites();
  };

  const isFavorite = (diseaseId: string) => favoriteIds.has(diseaseId);

  return { favoriteIds, isFavorite, toggleFavorite, loading, refresh: loadFavorites };
}

export function useNotes() {
  const [notes, setNotes] = useState<import('../types').PersonalNote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    const data = await StorageService.getNotes();
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNote = async (note: import('../types').PersonalNote) => {
    await StorageService.saveNote(note);
    await loadNotes();
  };

  const deleteNote = async (noteId: string) => {
    await StorageService.deleteNote(noteId);
    await loadNotes();
  };

  return { notes, loading, saveNote, deleteNote, refresh: loadNotes };
}
