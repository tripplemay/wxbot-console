'use client';
import { useCallback, useEffect, useState } from 'react';

// Minimal client data hook for BFF GET endpoints. Returns data + loading/error
// + a reload() callback. Keeps the monitoring pages terse.
export function useApi<T>(url: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`加载失败 (${res.status})`);
      setData(await res.json());
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
