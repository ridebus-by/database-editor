import { useEffect, useState } from 'react'
import { ref, onValue, off, update } from 'firebase/database'
import { db } from '@/lib/firebase'

export interface Notification {
  id: string
  type: 'route_added' | 'stop_added' | 'schedule_changed' | 'invalid_record' | 'other'
  message: string
  details?: string
  userId: string
  userName: string
  timestamp: number
  read: boolean
  entityId?: string
  entityType?: 'route' | 'stop'
}

export function useNotificationsRealtime() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  useEffect(() => {
    const notificationsRef = ref(db, 'notifications')
    const unsubscribe = onValue(notificationsRef, (snap) => {
      const val = snap.val() as Record<string, Omit<Notification, 'id'>>
      if (!val) {
        setNotifications([])
        return
      }
      const items: Notification[] = Object.entries(val).map(([id, n]) => ({
        id,
        ...n,
      }))
      // сортируем по убыванию времени
      items.sort((a, b) => b.timestamp - a.timestamp)
      setNotifications(items)
    })
    return () => off(notificationsRef)
  }, [])

  // helper: отметить всё прочитанным
  const markAllAsRead = async () => {
    const updates: Record<string, any> = {}
    notifications.forEach((n) => {
      if (!n.read) updates[`notifications/${n.id}/read`] = true
    })
    if (Object.keys(updates).length) {
      await update(ref(db), updates)
    }
  }

  // helper: отметить одно уведомление
  const markAsRead = async (id: string) => {
    await update(ref(db, `notifications/${id}`), { read: true })
  }

  return { notifications, markAllAsRead, markAsRead }
}