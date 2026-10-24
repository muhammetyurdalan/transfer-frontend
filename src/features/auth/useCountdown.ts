import { useEffect, useState } from 'react';

/** `start(seconds)` ile başlayan geri sayım. */
export function useCountdown() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const remaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0;
  return {
    remaining,
    start: (seconds: number) => {
      setNow(Date.now());
      setEndsAt(Date.now() + seconds * 1000);
    },
  };
}
