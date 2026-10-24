// RUT and phone, the same canonical forms as server.js (canonRut, canonPhone) and migration 019,
// plus how they are shown. Searching compares canonical values, so "12.345.678-k" finds "12345678-K".
import type { DirectusPet, PetStatus } from '../services/directus';

export function canonRut(raw: string | null | undefined): string | null {
  const clean = String(raw || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return null;
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}

export function validRut(raw: string | null | undefined): boolean {
  const m = /^(\d{1,8})-([\dK])$/.exec(canonRut(raw) || '');
  if (!m) return false;
  let sum = 0;
  let mul = 2;
  for (let i = m[1].length - 1; i >= 0; i--) {
    sum += Number(m[1][i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const r = 11 - (sum % 11);
  return (r === 11 ? '0' : r === 10 ? 'K' : String(r)) === m[2];
}

/** 12.345.678-5 */
export function formatRut(raw: string | null | undefined): string {
  const canon = canonRut(raw);
  if (!canon) return '';
  const [body, dv] = canon.split('-');
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

export function canonPhone(raw: string | null | undefined): string | null {
  const d = String(raw || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.length === 9) return '+56' + d;
  if (d.length === 8) return '+569' + d;
  return '+' + d;
}

/** +56 9 8765 4321 for Chilean mobiles; anything else as stored */
export function formatPhone(raw: string | null | undefined): string {
  const p = canonPhone(raw);
  if (!p) return '';
  const m = /^\+56(9)(\d{4})(\d{4})$/.exec(p);
  return m ? `+56 ${m[1]} ${m[2]} ${m[3]}` : p;
}

export const digits = (v: string | null | undefined) => String(v || '').replace(/\D/g, '');

/** wa.me wants the number without + or spaces */
export function whatsappUrl(phone: string | null | undefined): string | null {
  const d = digits(canonPhone(phone));
  return d ? `https://wa.me/${d}` : null;
}

export const SPECIES_LABEL: Record<string, string> = { dog: 'Perro', cat: 'Gato', other: 'Otra' };

export function speciesLabel(pet: Pick<DirectusPet, 'species' | 'species_other'>): string {
  if (pet.species === 'other') return pet.species_other?.trim() || 'Otra especie';
  return SPECIES_LABEL[pet.species] || '';
}

export const STATUS_LABEL: Record<PetStatus, string> = {
  alive: 'Activo',
  deceased: 'Fallecido',
  transferred: 'Trasladado',
  inactive: 'Inactivo',
};

/** Free text query → does this pet match by name, breed, tutor, RUT, phone or microchip? */
export function petMatches(pet: DirectusPet, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const text = [pet.name, pet.breed, pet.owner_name || pet.tutor_name, pet.species_other, pet.id_number, pet.registry_number]
    .filter(Boolean).join(' ').toLowerCase();
  if (text.includes(q)) return true;
  const qd = digits(q);
  if (qd.length >= 5) {
    const rut = canonRut(pet.owner_rut || pet.tutor_rut);
    if (rut && canonRut(q) === rut) return true;
    if (rut && digits(rut).startsWith(qd)) return true;
    if (qd.length >= 6 && digits(pet.owner_phone || pet.phone).endsWith(qd)) return true;
    if (digits(pet.id_number).includes(qd)) return true;
  }
  return false;
}
