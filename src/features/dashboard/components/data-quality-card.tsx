'use client'

import { useQuery } from '@tanstack/react-query'
import { ref, get, child } from 'firebase/database'
import { db } from '@/lib/firebase'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

interface RouteRecord {
  id?: string
  number?: string
  title?: string
  carrierCompany?: string
  description?: string
  fare?: string
  cityId?: any
  departureTimes?: string[]
  weekendDepartureTimes?: string[]
  intervalBetweenStops?: number[]
  following?: string
  stops?: string[]
  techInfo?: string
  workingHours?: string
  createdAt?: number
  isCashAccepted?: boolean
  isEcological?: boolean
  isLowFloor?: boolean
  isQRCodeAvailable?: boolean
}

interface StopRecord {
  id?: string
  name?: string
  direction?: string
  cityId?: any
  latitude?: string
  longitude?: string
  kindRouteId?: number
  typeId?: number
}

// Загрузка всех маршрутов
async function fetchRoutes(): Promise<RouteRecord[]> {
  const snap = await get(child(ref(db), 'routes'))
  if (!snap.exists()) return []
  return Object.values(snap.val() as Record<string, RouteRecord>)
}

// Загрузка всех остановок
async function fetchStops(): Promise<StopRecord[]> {
  const snap = await get(child(ref(db), 'stops'))
  if (!snap.exists()) return []
  return Object.values(snap.val() as Record<string, StopRecord>)
}

export function DataQualityCard() {
  const { data: routes, isLoading: rLoading, error: rError } = useQuery({
    queryKey: ['dq-routes'],
    queryFn: fetchRoutes,
  })
  const { data: stops, isLoading: sLoading, error: sError } = useQuery({
    queryKey: ['dq-stops'],
    queryFn: fetchStops,
  })

  const loading = rLoading || sLoading
  const error = rError || sError

  // Проверка “полноты” маршрута по ключевым полям
  const isRouteValid = (r: RouteRecord) =>
    typeof r.id === 'string' &&
    typeof r.number === 'string' &&
    typeof r.title === 'string' &&
    typeof r.fare === 'string' &&
    Array.isArray(r.departureTimes) &&
    r.departureTimes.length >= 0 &&
    Array.isArray(r.intervalBetweenStops) &&
    Array.isArray(r.stops) &&
    r.stops.length >= 0

  // Проверка “полноты” остановки по ключевым полям
  const isStopValid = (s: StopRecord) =>
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.direction === 'string' &&
    typeof s.latitude === 'string' &&
    !isNaN(parseFloat(s.latitude)) &&
    typeof s.longitude === 'string' &&
    !isNaN(parseFloat(s.longitude))

  let routePct = 0
  let stopPct = 0

  if (!loading && !error) {
    const totalRoutes = routes!.length
    const goodRoutes = routes!.filter(isRouteValid).length
    routePct = totalRoutes > 0 ? Math.round((goodRoutes / totalRoutes) * 100) : 100

    const totalStops = stops!.length
    const goodStops = stops!.filter(isStopValid).length
    stopPct = totalStops > 0 ? Math.round((goodStops / totalStops) * 100) : 100
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Качество данных</CardTitle>
        <CardDescription>
          % маршрутов и остановок с полностью заполненными полями
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : error ? (
          <div className="text-red-600">Ошибка загрузки</div>
        ) : (
          <div className="space-y-6">
            {/* Прогресс для маршрутов */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span>Маршруты</span>
                <span>{routePct}%</span>
              </div>
              <Progress value={routePct} className="h-2" />
            </div>
            {/* Прогресс для остановок */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span>Остановки</span>
                <span>{stopPct}%</span>
              </div>
              <Progress value={stopPct} className="h-2" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}