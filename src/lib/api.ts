import axios from 'axios'
import { ref, push } from 'firebase/database'
import { db } from '@/lib/firebase'

// 1) Создаём экземпляр
export const api = axios.create({
  baseURL: '/api',       // или ваш реальный бекенд
  timeout: 30_000,
})

// 2) Перехватчик запросов — сохраняем время старта
api.interceptors.request.use((config) => {
  (config as any).metadata = { startTime: Date.now() }
  return config
})

// 3) Перехватчик ответов
api.interceptors.response.use(
  (response) => {
    const { config } = response
    const meta = (config as any).metadata
    if (meta) {
      const duration = Date.now() - meta.startTime
      // логируем успешный запрос
      push(ref(db, 'apiLogs/success'), {
        t: new Date().toISOString(),
        path: config.url,
        duration,
      })
    }
    return response
  },
  (error) => {
    const { config } = error
    // логируем ошибку (если не отменённый запрос)
    if (config) {
      push(ref(db, 'apiLogs/error'), {
        t: new Date().toISOString(),
        path: config.url,
      })
    }
    return Promise.reject(error)
  }
)