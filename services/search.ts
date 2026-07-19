import { Disease, Species, DiseaseCategory } from '../types';
import { ALL_DISEASES } from '../constants/diseases';

export interface SearchFilters {
  query: string;
  species: Species | 'all';
  categories: DiseaseCategory[];
  severity: string[];
}

export const SearchService = {
  search(filters: SearchFilters): Disease[] {
    let results = [...ALL_DISEASES];

    if (filters.species !== 'all') {
      results = results.filter(
        d => d.species === filters.species || d.species === 'both'
      );
    }

    if (filters.categories.length > 0) {
      results = results.filter(d => filters.categories.includes(d.category));
    }

    if (filters.severity.length > 0) {
      results = results.filter(d => filters.severity.includes(d.severity));
    }

    if (filters.query.trim()) {
      const query = filters.query.toLowerCase().trim();
      results = results.filter(d => {
        const searchText = [
          d.name,
          d.scientificName,
          d.description,
          d.category,
          ...d.keySigns,
          ...d.prevention,
        ].join(' ').toLowerCase();

        return searchText.includes(query);
      });
    }

    return results;
  },

  searchBySymptoms(symptoms: string, species: Species | 'all'): Disease[] {
    if (!symptoms.trim()) return [];
    const query = symptoms.toLowerCase();

    return ALL_DISEASES.filter(d => {
      if (species !== 'all' && d.species !== species && d.species !== 'both') {
        return false;
      }
      return d.keySigns.some(sign =>
        sign.toLowerCase().includes(query)
      );
    });
  },

  getDiseaseById(id: string): Disease | undefined {
    return ALL_DISEASES.find(d => d.id === id);
  },

  getDiseasesBySpecies(species: 'dog' | 'cat'): Disease[] {
    return ALL_DISEASES.filter(d => d.species === species || d.species === 'both');
  },

  getDiseasesByCategory(category: DiseaseCategory): Disease[] {
    return ALL_DISEASES.filter(d => d.category === category);
  },

  getDiseasesBySeverity(severity: string): Disease[] {
    return ALL_DISEASES.filter(d => d.severity === severity);
  },

  getCategories(): DiseaseCategory[] {
    const categories = new Set(ALL_DISEASES.map(d => d.category));
    return Array.from(categories) as DiseaseCategory[];
  },

  getSuggestions(query: string): string[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const suggestions: string[] = [];

    ALL_DISEASES.forEach(d => {
      if (d.name.toLowerCase().includes(q)) suggestions.push(d.name);
      d.keySigns.forEach(sign => {
        if (sign.toLowerCase().includes(q)) suggestions.push(sign);
      });
    });

    return [...new Set(suggestions)].slice(0, 8);
  },
};
