import { db } from '@/lib/firebase'
import { ref, get, child, DataSnapshot } from 'firebase/database'

export interface User {
  id: string
  firebaseUid: string
  iconUrl: string   
  profileUrl: string
  username: string
}

export async function fetchUsers(): Promise<User[]> {
  const dbRef = ref(db)
  const snapshot: DataSnapshot = await get(child(dbRef, 'staff'))
  if (!snapshot.exists()) return []
  const staffObj = snapshot.val() as Record<string, User>
  return Object.values(staffObj)
}