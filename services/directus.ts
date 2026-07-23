import { API_URL } from '../config';
import { authHeaders } from './auth';

// ─────────────────────────────────────────────────────────
// Schema Types
// ─────────────────────────────────────────────────────────

export interface DirectusDisease {
  id: string;
  name: string;
  scientific_name: string;
  species: 'dog' | 'cat' | 'both';
  category: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  description: string;
  pathophysiology: string;
  key_signs: string[];
  diagnosis: {
    clinicalExam: string;
    labTests: string[];
    imaging: string[];
    differentialDiagnosis: string[];
  };
  treatment: {
    firstLine: string[];
    secondLine: string[];
    emergency: string;
    duration: string;
    notes?: string;
  };
  prevention: string[];
  prognosis: 'excellent' | 'good' | 'guarded' | 'poor' | 'grave';
  is_zoonotic: boolean;
  references: string[];
}

export interface DirectusPet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  birth_date: string;
  weight: number;
  color: string;
  photo: string | null;
  allergies: string[];
  notes: string;
  tutor_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  clinic_location: string | null;
  reproductive_status: string;
  status: 'alive' | 'deceased';
  anamnesis: string | null;
  id_number: string | null;
  sex: 'macho' | 'hembra' | null;
  temperament: string[];
  habitat: string | null;
  habitat_other: string | null;
  food: string | null;
  food_frequency: string | null;
  water_consumption: string | null;
  urination: string | null;
  lives_with_other_animals: string | null;
  vaccines: string | null;
  deworming: string | null;
  flea_treatment: string | null;
  last_heat: string | null;
  surgeries: string | null;
  other_diseases: string | null;
  medications: string | null;
  motivo_consulta: string | null;
  entorno: string | null;
  areneros: string | null;
  vital_signs: { temperature?: number; heart_rate?: number; respiratory_rate?: number; blood_pressure?: string; spo2?: number; mucous_membranes?: string; hydration?: string; body_condition?: string } | null;
  hallazgos_examen_fisico: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  patient_name: string;
  tutor_phone: string | null;
  start_time: string;
  end_time: string | null;
  appointment_type: 'consulta' | 'vacuna' | 'cirugia' | 'control' | 'terreno';
  description: string | null;
  created_at: string;
}

export interface ClinicalRecord {
  id: string;
  pet_id: string;
  user_id: string;
  record_type: 'consulta' | 'vacuna' | 'cirugia' | 'control';
  date: string;
  veterinarian: string | null;
  details: { notes?: string; weight?: number; anamnesis?: string; [key: string]: any };
  created_at: string;
}

export interface Prescription {
  id: string;
  pet_id: string;
  user_id: string;
  clinical_record_id: string | null;
  veterinarian_name: string | null;
  clinic_branch: string | null;
  prescription_body: string;
  format: string;
  status: string;
  issued_at: string;
  created_at: string;
}

export interface DirectusMedicalRecord {
  id: string;
  pet_id: DirectusPet | string;
  disease_id: DirectusDisease | string;
  date: string;
  veterinarian: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  notes: string;
  created_at: string;
}

export interface DirectusNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  disease_id: DirectusDisease | string | null;
  pet_id: DirectusPet | string | null;
  created_at: string;
  updated_at: string;
}

export interface DirectusFavorite {
  id: string;
  disease_id: DirectusDisease | string;
  category: 'frequently_used' | 'important' | 'study' | 'emergency';
  added_at: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  last_restocked: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  pet_id: string;
  pet_name?: string;
  species?: string;
  breed?: string;
  tutor_email: string;
  reminder_type: 'vacuna' | 'desparasitacion' | 'cita' | 'post_operatorio' | 'control';
  title: string;
  message: string;
  scheduled_for: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'cancelled';
  related_record_id: string | null;
  created_at: string;
}
// ─────────────────────────────────────────────────────────

async function apiGet(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'all') url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

async function apiPost(endpoint: string, body: any) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${text}`);
  }
  const json = await res.json();
  return json.data;
}

async function apiPatch(endpoint: string, body: any) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

async function apiDelete(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
}

// ─────────────────────────────────────────────────────────
// API Methods (Directus-compatible shape for hooks)
// ─────────────────────────────────────────────────────────

export const api = {
  diseases: {
    list: (params?: { species?: string; search?: string; category?: string; severity?: string }) =>
      apiGet('/items/diseases', params),
    get: (id: string) => apiGet('/items/diseases', { id }).then((d: any[]) => d[0] || null),
    create: (data: any) => apiPost('/items/diseases', data),
    update: (id: string, data: any) => apiPatch(`/items/diseases/${id}`, data),
    delete: (id: string) => apiDelete(`/items/diseases/${id}`),
  },
  pets: {
    list: () => apiGet('/items/pets'),
    get: (id: string) => apiGet(`/items/pets/${id}`),
    create: (data: any) => apiPost('/items/pets', data),
    update: (id: string, data: any) => apiPatch(`/items/pets/${id}`, data),
    delete: (id: string) => apiDelete(`/items/pets/${id}`),
  },
  medicalRecords: {
    list: (petId?: string) => apiGet('/items/medical_records', petId ? { pet_id: petId } : undefined),
    create: (data: any) => apiPost('/items/medical_records', data),
  },
  notes: {
    list: () => apiGet('/items/personal_notes'),
    create: (data: any) => apiPost('/items/personal_notes', data),
    update: (id: string, data: any) => apiPatch(`/items/personal_notes/${id}`, data),
    delete: (id: string) => apiDelete(`/items/personal_notes/${id}`),
  },
  favorites: {
    list: () => apiGet('/items/favorites'),
    create: (data: any) => apiPost('/items/favorites', data),
    delete: (id: string) => apiDelete(`/items/favorites/${id}`),
  },
  appointments: {
    list: (params?: { start?: string; end?: string }) =>
      apiGet('/items/appointments', params),
    get: (id: string) => apiGet('/items/appointments', { id }).then((a: any[]) => a[0] || null),
    create: (data: any) => apiPost('/items/appointments', data),
    update: (id: string, data: any) => apiPatch(`/items/appointments/${id}`, data),
    delete: (id: string) => apiDelete(`/items/appointments/${id}`),
  },
  clinicalRecords: {
    list: (petId?: string, recordType?: string) => {
      const params: Record<string, string> = {};
      if (petId) params.pet_id = petId;
      if (recordType) params.record_type = recordType;
      return apiGet('/items/clinical_records', Object.keys(params).length ? params : undefined);
    },
    create: (data: any) => apiPost('/items/clinical_records', data),
    update: (id: string, data: any) => apiPatch(`/items/clinical_records/${id}`, data),
    delete: (id: string) => apiDelete(`/items/clinical_records/${id}`),
  },
  inventory: {
    list: () => apiGet('/items/inventory'),
    lowStock: () => apiGet('/items/inventory/low-stock'),
    create: (data: any) => apiPost('/items/inventory', data),
    update: (id: string, data: any) => apiPatch(`/items/inventory/${id}`, data),
    delete: (id: string) => apiDelete(`/items/inventory/${id}`),
  },
  prescriptions: {
    list: (petId?: string) => apiGet('/items/prescriptions', petId ? { pet_id: petId } : undefined),
    get: (id: string) => apiGet('/items/prescriptions', { id }).then((r: any[]) => r[0] || null),
    create: (data: any) => apiPost('/items/prescriptions', data),
    update: (id: string, data: any) => apiPatch(`/items/prescriptions/${id}`, data),
    delete: (id: string) => apiDelete(`/items/prescriptions/${id}`),
    sendEmail: (id: string) => apiPost(`/items/prescriptions/${id}/email`, {}),
  },
  reminders: {
    list: (params?: { status?: string; type?: string; upcoming?: string }) =>
      apiGet('/items/reminders', params),
    upcoming: () => apiGet('/items/reminders/upcoming'),
    create: (data: any) => apiPost('/items/reminders', data),
    autoGenerate: (petId: string) => apiPost('/items/reminders/auto-generate', { pet_id: petId }),
    update: (id: string, data: any) => apiPatch(`/items/reminders/${id}`, data),
    delete: (id: string) => apiDelete(`/items/reminders/${id}`),
    sendPending: () => apiPost('/items/reminders/send-pending', {}),
  },
  assistant: {
    query: (message: string) => apiPost('/assistant', { message }),
  },
};

export function getFileUrl(fileId: string): string {
  return `${API_URL}/uploads/${fileId}`;
}

export function getThumbnailUrl(fileId: string, width: number = 200, height: number = 200): string {
  return `${API_URL}/uploads/${fileId}`;
}
