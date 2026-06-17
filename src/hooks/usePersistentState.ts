import { useState, useEffect, Dispatch, SetStateAction } from "react";

/**
 * Persists a piece of state to localStorage under `${collectionName}/${docId}`.
 *
 * Same signature and return shape as `useState`, but the value survives
 * reloads. There is no backend, network, or auth — data is kept locally in
 * the browser.
 */
export function usePersistentState<T>(
  collectionName: string,
  docId: string,
  fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = `prim:${collectionName}/${docId}`;

  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored != null) return JSON.parse(stored) as T;
    } catch {
      // ignore unavailable or malformed storage
    }
    return fallback;
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // ignore quota / serialization errors
    }
  }, [storageKey, value]);

  return [value, setValue];
}
