// src/lib/useItems.ts
import { useObject } from 'react-firebase-hooks/database';
import { db } from './firebase';
import { ref, set } from 'firebase/database';

export function useItems(path: string) {
  const [snapshot, loading, error] = useObject(ref(db, path));
  const items = snapshot?.val();

  const update = (newData: any) => set(ref(db, path), newData);
  return { items, loading, error, update };
}