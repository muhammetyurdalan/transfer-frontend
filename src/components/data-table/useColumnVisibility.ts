import { useState } from 'react';
import { readStorage, writeStorage } from '@/lib/storage';
import type { Column } from './types';

/**
 * Kullanıcının seçtiği görünür sütunlar. Seçim `storageKey` altında tarayıcıda saklanır,
 * kayıt yoksa (veya okunamazsa) `defaultHidden` dışındaki tüm sütunlar görünür.
 */
export function useColumnVisibility<T>(storageKey: string, columns: Column<T>[], defaultHidden: string[] = []) {
  const [visible, setVisibleState] = useState<string[]>(() => {
    const raw = readStorage(storageKey);
    if (raw) {
      try {
        const keys = JSON.parse(raw) as unknown;
        if (Array.isArray(keys)) return keys.filter((k): k is string => typeof k === 'string');
      } catch {
        // bozuk kayıt: varsayılana dön
      }
    }
    return columns.map((c) => c.key).filter((k) => !defaultHidden.includes(k));
  });

  const setVisible = (keys: string[]) => {
    setVisibleState(keys);
    writeStorage(storageKey, JSON.stringify(keys));
  };
  const reset = () => {
    setVisibleState(columns.map((c) => c.key).filter((k) => !defaultHidden.includes(k)));
    writeStorage(storageKey, null);
  };

  // Sütun sırası tanımdaki sıradır, seçim sırası değil
  const shown = columns.filter((c) => visible.includes(c.key));
  return { columns: shown, visible, setVisible, reset };
}
