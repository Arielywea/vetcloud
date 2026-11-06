import { useCallback, useEffect, useState } from 'react';
import { api, ClinicNotice } from '../services/directus';
import { useRefreshOn } from './useDirectus';

const POLL_MS = 5 * 60 * 1000;

/** Open notices of the clinic. Loading them also runs the rules on the server, so they stay current. */
export function useNotices() {
  const [notices, setNotices] = useState<ClinicNotice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setNotices(await api.notices.list());
    } catch {
      // The badge is a convenience: a failed refresh keeps what was there
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // Anything the rules read can change a notice
  useRefreshOn(['notices', 'automation_rules', 'hospitalizations', 'inventory', 'vaccinations'], load);

  return { notices, loading, refresh: load };
}
