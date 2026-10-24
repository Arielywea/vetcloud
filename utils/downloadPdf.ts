import { API_URL } from '../config';
import { authHeaders, apiFetch } from '../services/auth';

/** Fetches an authenticated PDF from the API and saves it in the browser. Throws with the server's message. */
export async function downloadPdf(endpoint: string, filename: string): Promise<void> {
  const res = await apiFetch(`${API_URL}${endpoint}`, { headers: await authHeaders() });
  if (!res.ok) {
    let message = 'No se pudo generar el PDF';
    try { message = (await res.json())?.error || message; } catch { /* not JSON */ }
    throw new Error(message);
  }
  const url = window.URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/[^\w.\-áéíóúñÁÉÍÓÚÑ]+/g, '_');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Some browsers start the download after the click returns
  setTimeout(() => window.URL.revokeObjectURL(url), 2000);
}
