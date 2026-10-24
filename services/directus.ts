import { API_URL } from '../config';
import { authHeaders, notifyUnauthorized, apiFetch } from './auth';

// ─────────────────────────────────────────────────────────
// Schema Types
// ─────────────────────────────────────────────────────────

export interface DirectusDisease {
  id: string;
  name: string;
  /** Latin name of the agent/condition, only when one exists */
  scientific_name: string | null;
  /** English name, for searching literature ("Feline Chronic Kidney Disease") */
  english_name?: string | null;
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
  prognosis: 'excellent' | 'good' | 'guarded' | 'poor' | 'grave' | 'chronic';
  is_zoonotic: boolean;
  references: string[];
  photo_url?: string | null;
  life_stage?: 'puppy' | 'kitten' | 'adult' | 'senior' | 'all';
  /** null = global catalog (only admins edit it); set = this clinic's own entry */
  organization_id?: number | null;
}

export type PetStatus = 'alive' | 'deceased' | 'transferred' | 'inactive';
export type PetSpecies = 'dog' | 'cat' | 'other';

export interface PetAlert {
  type: 'allergy' | 'bites' | 'chronic' | 'other';
  text: string;
  since?: string | null;
}

export interface Owner {
  id: string;
  name: string;
  /** Canonical 12345678-K */
  rut: string | null;
  /** Canonical E.164 (+569…) */
  phone: string | null;
  email: string | null;
  address: string | null;
  comuna: string | null;
  region: string | null;
  alt_contact_name: string | null;
  alt_contact_phone: string | null;
  preferred_contact: 'whatsapp' | 'telefono' | 'correo' | null;
  consent_communications_at: string | null;
  contact_revoked_at: string | null;
  anonymized_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /** Present on list and detail */
  pets?: Array<Pick<DirectusPet, 'id' | 'name' | 'species' | 'species_other' | 'breed' | 'birth_date' | 'sex' | 'status' | 'photo'>>;
}

/** What a create/edit form sends: consent is a yes/no, the server stamps the date */
export type OwnerInput = Partial<Omit<Owner, 'consent_communications_at' | 'pets'>> & { consent_communications_at?: boolean };

export type VaccinationKind = 'vacuna' | 'desparasitacion_interna' | 'desparasitacion_externa';
export type VaccinePlanItem = 'octuple_sextuple' | 'kc' | 'antirrabica' | 'triple_felina' | 'leucemia_felina' | 'otra';

export interface Vaccination {
  id: string;
  pet_id: string;
  kind: VaccinationKind;
  plan_item: VaccinePlanItem | null;
  product: string | null;
  lot: string | null;
  applied_at: string;
  next_due_at: string | null;
  veterinarian: string | null;
  clinical_record_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface DirectusPet {
  id: string;
  name: string;
  species: PetSpecies;
  species_other?: string | null;
  owner_id?: string | null;
  /** Joined from owners */
  owner_name?: string | null;
  owner_rut?: string | null;
  owner_phone?: string | null;
  owner_email?: string | null;
  owner_contact_revoked_at?: string | null;
  owner_anonymized_at?: string | null;
  registry_number?: string | null;
  birth_date_estimated?: boolean;
  alerts?: PetAlert[];
  deceased_at?: string | null;
  current_weight_kg?: number | string | null;
  current_weight_at?: string | null;
  breed: string;
  birth_date: string | null;
  weight: number | null;
  color: string;
  photo: string | null;
  allergies: string[];
  notes: string;
  tutor_name: string | null;
  tutor_rut?: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  clinic_location: string | null;
  reproductive_status: string;
  status: PetStatus;
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
  pre_diagnostico: string | null;
  base_diseases: string[];
  created_at: string;
  updated_at: string;
  last_visit: string | null;
  organization_id: number | null;
}

export interface Medication {
  id: number;
  organization_id: number | null;
  category: 'intraoperatorio' | 'receta';
  nombre: string;
  marca_comercial: string | null;
  presentacion: string | null;
  familia: string | null;
  funcion: string | null;
  dosis_perro: string | null;
  dosis_gato: string | null;
  via_administracion: string | null;
  efectos_adversos: string | null;
  notas: string | null;
  dosis_min_mg_kg: number | null;
  dosis_max_mg_kg: number | null;
  concentracion_mg_ml: number | null;
  frecuencia_horas: number | null;
  especialidad: string | null;
  /** Client-only: every specialty when the same drug is catalogued more than once */
  especialidades?: string[];
  created_at: string;
}

export interface Surgery {
  id: number;
  organization_id: number | null;
  nombre_cirugia: string;
  indicaciones: string | null;
  tecnica_quirurgica: string | null;
  material_quirurgico: string | null;
  tipo_sutura: string | null;
  complicaciones_frecuentes: string | null;
  manejo_anestesico_sugerido: string | null;
  consideraciones_por_raza: string | null;
  consideraciones_comorbilidades: string | null;
  fuente: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  organization_id: number | null;
  patient_name: string;
  tutor_phone: string | null;
  start_time: string;
  end_time: string | null;
  appointment_type: 'consulta' | 'vacuna' | 'cirugia' | 'control' | 'terreno' | 'examenes' | 'hospitalizacion';
  description: string | null;
  veterinarian: string | null;
  status: 'programada' | 'confirmada' | 'en_espera' | 'en_consulta' | 'completada' | 'pendiente' | 'cancelada' | 'ausente';
  pet_id: string | null;
  follow_up_of: string | null;
  room: string | null;
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
  /** The visit is the single source of weight (pets.current_weight_kg mirrors the latest) */
  weight_kg?: number | string | null;
  appointment_id?: string | null;
  is_initial?: boolean;
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

export interface Hospitalization {
  id: string;
  pet_id: string;
  user_id: string;
  pet_name: string;
  species: string;
  breed: string;
  admission_date: string;
  discharge_date: string | null;
  reason: string;
  status: 'internado' | 'cirugia' | 'recuperacion' | 'discharged';
  veterinarian: string | null;
  notes: string | null;
  created_at: string;
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

export interface DirectusLabExam {
  id: string;
  user_id: string;
  pet_id: string;
  exam_name: string;
  exam_type: string | null;
  pet_name: string;
  species: string;
  breed: string;
  date: string;
  status: 'pendiente' | 'completado';
  result: string | null;
  veterinarian: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
// ─────────────────────────────────────────────────────────

// ─── Change notifications ────────────────────────────────
// Every successful write is announced by collection (/items/<collection>, or a top-level
// route such as /vital-measurements → vital_measurements) so that screens still mounted
// in the drawer (lists, dashboard, agenda) refetch instead of going stale.
type DataChangeListener = (collection: string) => void;
const dataChangeListeners = new Set<DataChangeListener>();

export function onDataChange(listener: DataChangeListener): () => void {
  dataChangeListeners.add(listener);
  return () => { dataChangeListeners.delete(listener); };
}

function emitDataChange(endpoint: string) {
  const collection = endpoint.match(/^\/(?:items\/)?([^/?]+)/)?.[1]?.replace(/-/g, '_');
  if (!collection) return;
  dataChangeListeners.forEach((listener) => {
    try { listener(collection); } catch { /* a broken listener must not break the write */ }
  });
}

// Turns a failed response into a readable Error using the server's { error } message
async function apiError(res: Response): Promise<Error> {
  let message = '';
  let code: string | undefined;
  try {
    const text = await res.text();
    try { const json = JSON.parse(text); message = json?.error || ''; code = json?.code; } catch { message = text.startsWith('<') ? '' : text; }
  } catch { /* ignore */ }
  if (res.status === 401) notifyUnauthorized();
  if (!message) {
    if (res.status === 401) message = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    else if (res.status >= 500) message = 'Error del servidor. Intenta de nuevo en unos segundos.';
    else message = `Error ${res.status}`;
  }
  const err = new Error(message) as Error & { status?: number; code?: string };
  err.status = res.status;
  // Machine-readable reason, e.g. PET_REQUIRED when an appointment moves to "en espera" without a patient
  err.code = code;
  return err;
}

async function apiGet(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'all') url.searchParams.set(k, v);
    });
  }
  const res = await apiFetch(url.toString(), { headers: await authHeaders() });
  if (!res.ok) throw await apiError(res);
  const json = await res.json();
  return json.data;
}

async function apiPost(endpoint: string, body: any) {
  const res = await apiFetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await apiError(res);
  const json = await res.json();
  emitDataChange(endpoint);
  return json.data;
}

async function apiPatch(endpoint: string, body: any) {
  const res = await apiFetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await apiError(res);
  const json = await res.json();
  emitDataChange(endpoint);
  return json.data;
}

async function apiDelete(endpoint: string) {
  const res = await apiFetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers: await authHeaders() });
  if (!res.ok) throw await apiError(res);
  emitDataChange(endpoint);
}

// ─────────────────────────────────────────────────────────
// API Methods (Directus-compatible shape for hooks)
// ─────────────────────────────────────────────────────────

export const api = {
  diseases: {
    list: (params?: { species?: string; search?: string; category?: string; severity?: string }) => {
      const directusParams: Record<string, string> = {};
      if (params?.species && params.species !== 'all') {
        directusParams.species = params.species;
      }
      if (params?.category) {
        directusParams.category = params.category;
      }
      if (params?.severity) {
        directusParams.severity = params.severity;
      }
      if (params?.search) {
        directusParams.search = params.search;
      }
      return apiGet('/items/diseases', directusParams);
    },
    get: (id: string) => apiGet(`/items/diseases/${id}`),
    create: (data: any) => apiPost('/items/diseases', data),
    update: (id: string, data: any) => apiPatch(`/items/diseases/${id}`, data),
    delete: (id: string) => apiDelete(`/items/diseases/${id}`),
  },
  medications: {
    list: (params?: { category?: string; especialidad?: string; search?: string }) => {
      const directusParams: Record<string, string> = {};
      if (params?.especialidad) {
        directusParams.especialidad = params.especialidad;
      }
      if (params?.category) {
        directusParams.category = params.category;
      }
      if (params?.search) {
        directusParams.search = params.search;
      }
      return apiGet('/items/medications', directusParams);
    },
    create: (data: any) => apiPost('/items/medications', data),
  },
  surgeries: {
    list: (params?: { search?: string }) => {
      const directusParams: Record<string, string> = {};
      if (params?.search) {
        directusParams.search = params.search;
      }
      return apiGet('/items/surgeries', directusParams);
    },
    get: (id: string) => apiGet(`/items/surgeries/${id}`),
  },
  owners: {
    list: (q?: string) => apiGet('/items/owners', q ? { q } : undefined) as Promise<Owner[]>,
    get: (id: string) => apiGet(`/items/owners/${id}`) as Promise<Owner>,
    /** Whether the RUT is valid (check digit) and the tutor already registered with it */
    checkRut: (rut: string) => apiGet('/items/owners/check', { rut }) as Promise<{ valid: boolean; rut: string | null; owner: { id: string; name: string } | null }>,
    create: (data: OwnerInput) => apiPost('/items/owners', data) as Promise<Owner>,
    update: (id: string, data: OwnerInput) => apiPatch(`/items/owners/${id}`, data) as Promise<Owner>,
    revokeContact: (id: string) => apiPost(`/items/owners/${id}/revoke-contact`, {}) as Promise<Owner>,
    anonymize: (id: string) => apiPost(`/items/owners/${id}/anonymize`, {}) as Promise<Owner>,
  },
  vaccinations: {
    list: (petId: string) => apiGet('/items/vaccinations', { pet_id: petId }) as Promise<Vaccination[]>,
    products: () => apiGet('/items/vaccinations/products') as Promise<Array<{ plan_item: VaccinePlanItem | null; product: string; uses: number }>>,
    create: (data: Partial<Vaccination>) => apiPost('/items/vaccinations', data) as Promise<Vaccination>,
    update: (id: string, data: Partial<Vaccination>) => apiPatch(`/items/vaccinations/${id}`, data) as Promise<Vaccination>,
    delete: (id: string) => apiDelete(`/items/vaccinations/${id}`),
  },
  pets: {
    list: (ownerId?: string) => apiGet('/items/pets', ownerId ? { owner_id: ownerId } : undefined),
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
    get: (id: string) => apiGet(`/items/appointments/${id}`),
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
  hospitalizations: {
    list: (params?: { status?: string }) =>
      apiGet('/items/hospitalizations', params),
    get: (id: string) => apiGet(`/items/hospitalizations/${id}`),
    create: (data: any) => apiPost('/items/hospitalizations', data),
    update: (id: string, data: any) => apiPatch(`/items/hospitalizations/${id}`, data),
    delete: (id: string) => apiDelete(`/items/hospitalizations/${id}`),
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
    get: (id: string) => apiGet(`/items/prescriptions/${id}`),
    create: (data: any) => apiPost('/items/prescriptions', data),
    update: (id: string, data: any) => apiPatch(`/items/prescriptions/${id}`, data),
    delete: (id: string) => apiDelete(`/items/prescriptions/${id}`),
    sendEmail: (id: string, to?: string) => apiPost(`/items/prescriptions/${id}/email`, to ? { to } : {}),
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
  labExams: {
    list: (params?: { status?: string }) =>
      apiGet('/items/lab_exams', params),
    get: (id: string) => apiGet(`/items/lab_exams/${id}`),
    create: (data: any) => apiPost('/items/lab_exams', data),
    update: (id: string, data: any) => apiPatch(`/items/lab_exams/${id}`, data),
    delete: (id: string) => apiDelete(`/items/lab_exams/${id}`),
  },
  vitals: {
    list: (petId?: string) => apiGet('/vital-measurements', petId ? { pet_id: petId } : undefined),
    create: (data: any) => apiPost('/vital-measurements', data),
  },
  payments: {
    list: () => apiGet('/payments'),
    create: (data: any) => apiPost('/payments', data),
  },
  reports: {
    summary: () => apiGet('/reports/summary'),
    expiringInventory: () => apiGet('/reports/expiring-inventory'),
  },
  search: (q: string) => apiGet('/search', { q }),
  assistant: {
    query: (message: string) => apiPost('/assistant', { message }),
  },
  stats: {
    dashboard: () => apiGet('/stats/dashboard'),
    weekly: () => apiGet('/stats/weekly'),
    recordTypes: () => apiGet('/stats/record-types'),
  },
};

export function getFileUrl(fileId: string): string {
  return `${API_URL}/uploads/${fileId}`;
}

export function getThumbnailUrl(fileId: string, width: number = 200, height: number = 200): string {
  return `${API_URL}/assets/${fileId}?width=${width}&height=${height}&fit=cover`;
}
