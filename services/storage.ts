import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, MedicalRecord, Vaccination, PersonalNote, Favorite } from '../types';

const STORAGE_KEYS = {
  PETS: '@vetcloud_pets',
  NOTES: '@vetcloud_notes',
  FAVORITES: '@vetcloud_favorites',
  SEARCH_HISTORY: '@vetcloud_search_history',
};

export const StorageService = {
  async getPets(): Promise<Pet[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PETS);
    return data ? JSON.parse(data) : [];
  },

  async savePet(pet: Pet): Promise<void> {
    const pets = await this.getPets();
    const index = pets.findIndex(p => p.id === pet.id);
    if (index >= 0) {
      pets[index] = pet;
    } else {
      pets.push(pet);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
  },

  async deletePet(petId: string): Promise<void> {
    const pets = await this.getPets();
    const filtered = pets.filter(p => p.id !== petId);
    await AsyncStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(filtered));
  },

  async addMedicalRecord(petId: string, record: MedicalRecord): Promise<void> {
    const pets = await this.getPets();
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      pet.medicalHistory.push(record);
      await this.savePet(pet);
    }
  },

  async addVaccination(petId: string, vaccination: Vaccination): Promise<void> {
    const pets = await this.getPets();
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      pet.vaccinations.push(vaccination);
      await this.savePet(pet);
    }
  },

  async getNotes(): Promise<PersonalNote[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    return data ? JSON.parse(data) : [];
  },

  async saveNote(note: PersonalNote): Promise<void> {
    const notes = await this.getNotes();
    const index = notes.findIndex(n => n.id === note.id);
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.push(note);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  async deleteNote(noteId: string): Promise<void> {
    const notes = await this.getNotes();
    const filtered = notes.filter(n => n.id !== noteId);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
  },

  async getFavorites(): Promise<Favorite[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  },

  async toggleFavorite(diseaseId: string, category: Favorite['category'] = 'frequently_used'): Promise<boolean> {
    const favorites = await this.getFavorites();
    const existing = favorites.findIndex(f => f.diseaseId === diseaseId);

    if (existing >= 0) {
      favorites.splice(existing, 1);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return false;
    } else {
      favorites.push({
        id: `fav-${Date.now()}`,
        diseaseId,
        addedAt: new Date().toISOString(),
        category,
      });
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
  },

  async isFavorite(diseaseId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(f => f.diseaseId === diseaseId);
  },

  async getSearchHistory(): Promise<string[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  async addToSearchHistory(query: string): Promise<void> {
    const history = await this.getSearchHistory();
    const filtered = history.filter(h => h !== query);
    filtered.unshift(query);
    const trimmed = filtered.slice(0, 20);
    await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(trimmed));
  },

  async clearSearchHistory(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify([]));
  },
};
