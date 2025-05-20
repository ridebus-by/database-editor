// Тестовые данные для уведомлений
import { v4 as uuidv4 } from 'uuid'

export interface Notification {
  id: string
  type: 'route_added' | 'schedule_changed' | 'invalid_record' | 'other'
  message: string
  details?: string
  userId: string
  userName: string
  timestamp: number
  read: boolean
  entityId?: string
  entityType?: 'route' | 'stop'
}

// Пользователи для тестовых данных
const users = [
  { id: 'user1', name: 'Иван Петров' },
  { id: 'user2', name: 'Анна Смирнова' },
  { id: 'user3', name: 'Сергей Иванов' },
  { id: 'user4', name: 'Мария Кузнецова' },
]

// Функция для генерации случайной даты в пределах последних 7 дней
const getRandomDate = () => {
  const now = Date.now()
  const daysAgo = Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
  const hoursAgo = Math.floor(Math.random() * 24) * 60 * 60 * 1000
  const minutesAgo = Math.floor(Math.random() * 60) * 60 * 1000
  return now - daysAgo - hoursAgo - minutesAgo
}

// Функция для получения случайного элемента из массива
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

// Генерация тестовых уведомлений
export const generateNotifications = (count: number = 20): Notification[] => {
  const notifications: Notification[] = []
  
  for (let i = 0; i < count; i++) {
    const user = getRandomItem(users)
    const type = getRandomItem(['route_added', 'schedule_changed', 'invalid_record', 'other'] as const)
    
    let message = ''
    let details = ''
    let entityId: string | undefined
    let entityType: 'route' | 'stop' | undefined
    
    // Генерация сообщения в зависимости от типа уведомления
    switch (type) {
      case 'route_added':
        const routeNumber = Math.floor(Math.random() * 100)
        message = `Добавлен новый маршрут №${routeNumber}`
        details = `Маршрут №${routeNumber} добавлен в систему и готов к использованию`
        entityId = `route-${routeNumber}`
        entityType = 'route'
        break
      case 'schedule_changed':
        const routeNum = Math.floor(Math.random() * 100)
        message = `Изменено расписание маршрута №${routeNum}`
        details = `Обновлено время отправления и интервалы движения`
        entityId = `route-${routeNum}`
        entityType = 'route'
        break
      case 'invalid_record':
        const isRoute = Math.random() > 0.5
        if (isRoute) {
          const routeNum = Math.floor(Math.random() * 100)
          message = `Обнаружены ошибки в данных маршрута №${routeNum}`
          details = `Отсутствуют обязательные поля: время отправления, интервалы`
          entityId = `route-${routeNum}`
          entityType = 'route'
        } else {
          const stopId = Math.floor(Math.random() * 1000)
          message = `Обнаружены ошибки в данных остановки ID-${stopId}`
          details = `Некорректные координаты или отсутствует название`
          entityId = `stop-${stopId}`
          entityType = 'stop'
        }
        break
      case 'other':
        const messages = [
          'Выполнена синхронизация данных с сервером',
          'Завершено резервное копирование базы данных',
          'Обновлена версия системы до 2.5.1',
          'Выполнена оптимизация базы данных'
        ]
        message = getRandomItem(messages)
        break
    }
    
    notifications.push({
      id: uuidv4(),
      type,
      message,
      details,
      userId: user.id,
      userName: user.name,
      timestamp: getRandomDate(),
      read: Math.random() > 0.3, // 30% непрочитанных
      entityId,
      entityType,
    })
  }
  
  // Сортировка по времени (сначала новые)
  return notifications.sort((a, b) => b.timestamp - a.timestamp)
}

// Экспорт тестовых данных
export const mockNotifications = generateNotifications(30)
