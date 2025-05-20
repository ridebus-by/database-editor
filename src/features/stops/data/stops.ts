import { db } from '@/lib/firebase'
import { ref, get, child, DataSnapshot } from 'firebase/database'

export interface Stop {
  cityId: number
  direction: string
  id: string
  kindRouteId: number
  latitude: string
  longitude: string
  name: string
  typeId: number
}

export async function fetchStops(): Promise<Stop[]> {
  const dbRef = ref(db)
  const snapshot: DataSnapshot = await get(child(dbRef, 'stops'))
  if (!snapshot.exists()) return []
  const stopsObj = snapshot.val() as Record<string, Stop>
  return Object.values(stopsObj)
}