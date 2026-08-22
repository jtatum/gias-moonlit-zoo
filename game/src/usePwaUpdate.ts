import { useCallback, useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export type UpdateStatus =
  | 'preview'
  | 'checking'
  | 'offline-ready'
  | 'update-ready'
  | 'updating'
  | 'failed'
  | 'unavailable';

export const UPDATE_LABELS: Record<UpdateStatus, string> = {
  preview: 'Preview mode',
  checking: 'Checking for updates…',
  'offline-ready': 'Offline ready',
  'update-ready': 'New adventure ready',
  updating: 'Installing update…',
  failed: 'Update check failed',
  unavailable: 'Offline install unavailable',
};

export function usePwaUpdate() {
  const [status, setStatus] = useState<UpdateStatus>(
    import.meta.env.DEV ? 'preview' : 'checking',
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const applyUpdateRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(
    null,
  );

  useEffect(() => {
    if (import.meta.env.DEV) return;
    if (!('serviceWorker' in navigator)) {
      setStatus('unavailable');
      return;
    }

    applyUpdateRef.current = registerSW({
      immediate: true,
      onOfflineReady() {
        setStatus('offline-ready');
      },
      onNeedRefresh() {
        setStatus('update-ready');
      },
      onRegisteredSW(_serviceWorkerUrl, registration) {
        registrationRef.current = registration ?? null;
        setLastChecked(new Date());
        setStatus((current) =>
          current === 'update-ready' ? current : 'offline-ready',
        );
      },
      onRegisterError() {
        setStatus('failed');
      },
    });
  }, []);

  const checkForUpdate = useCallback(async () => {
    if (import.meta.env.DEV) {
      setStatus('preview');
      setLastChecked(new Date());
      return;
    }

    const registration = registrationRef.current;
    if (!registration || !navigator.onLine) {
      setStatus(navigator.onLine ? 'failed' : 'offline-ready');
      return;
    }

    setStatus('checking');
    try {
      await registration.update();
      setLastChecked(new Date());
      setStatus((current) =>
        current === 'update-ready' ? current : 'offline-ready',
      );
    } catch {
      setStatus('failed');
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!applyUpdateRef.current) return;
    setStatus('updating');
    await applyUpdateRef.current(true);
  }, []);

  return {
    status,
    statusLabel: UPDATE_LABELS[status],
    lastChecked,
    checkForUpdate,
    installUpdate,
  };
}
