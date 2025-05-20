'use client'

import { useQuery } from '@tanstack/react-query'
import { ref, get, child } from 'firebase/database'
import { db } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

/**
 * Предполагается, что в Realtime Database есть узел `/status/{uid}`,
 * где каждому подключённому пользователю соответствует объект
 * { online: true } (или просто true).
 */
async function fetchPresence(): Promise<Record<string, { online: boolean }>> {
  const snap = await get(child(ref(db), 'status'))
  return snap.exists()
    ? (snap.val() as Record<string, { online: boolean }>)
    : {}
}

export function OnlineOperatorsCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['presence'],
    queryFn: fetchPresence,
    // Обновляем статус каждые 30 сек
    refetchInterval: 30_000,
  })

  // Loading
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle>
            Операторы онлайн
          </CardTitle>
          {/* Иконка сети */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="text-muted-foreground h-4 w-4"
          >
            <path d="M2 12h20M12 2v20" />
          </svg>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-12" />
        </CardContent>
      </Card>
    )
  }

  // Error
  if (error) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle>
            Операторы онлайн
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-red-600">Ошибка</span>
        </CardContent>
      </Card>
    )
  }

  // Подсчитываем онлайн
  const presence = data || {}
  const onlineCount = Object.values(presence).filter((s) => s.online).length

  return (
    <Card>
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle>
          Операторы онлайн
        </CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="text-muted-foreground h-4 w-4"
        >
          <path d="M2 12h20M12 2v20" />
        </svg>
      </CardHeader>
      <CardContent className="flex items-center space-x-2">
        <Badge variant="secondary">{onlineCount}</Badge>
        <span className="text-muted-foreground text-sm">
          {onlineCount === 1 ? 'оператор' : 'операторов'}
        </span>
      </CardContent>
    </Card>
  )
}