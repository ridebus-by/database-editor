import { db } from '@/lib/firebase'
import { ref, get, child, DataSnapshot } from 'firebase/database'

/** Структура одного пользователя */
export interface User {
  id: string
  firebaseUid: string
  iconUrl: string   
  profileUrl: string
  username: string
}

/** 
 * Получить всех сотрудников из Realtime Database под узлом "staff"
 */
export async function fetchUsers(): Promise<User[]> {
  const dbRef = ref(db)
  const snapshot: DataSnapshot = await get(child(dbRef, 'staff'))
  if (!snapshot.exists()) return []
  const staffObj = snapshot.val() as Record<string, User>
  // Преобразуем объект вида { key1: User, key2: User, ... } в массив
  return Object.values(staffObj)
}