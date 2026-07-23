import { DirectusPet } from '../services/directus';

export function isActive(pet: DirectusPet): boolean {
  if (!pet.last_visit) return false;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(pet.last_visit) >= sixMonthsAgo;
}

export type StatusFilter = 'all' | 'active' | 'inactive';

export function filterByStatus(pets: DirectusPet[], status: StatusFilter): DirectusPet[] {
  if (status === 'all') return pets;
  return pets.filter(p => status === 'active' ? isActive(p) : !isActive(p));
}
