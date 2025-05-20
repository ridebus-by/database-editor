'use client'

import { useQuery } from '@tanstack/react-query'
import { ref, get, child } from 'firebase/database'
import { db } from '@/lib/firebase'
import { MetricCard } from './metric-card'

// Тип маршрута: нас интересует только массив stops
interface RouteRecord {
    stops?: string[]
}

// React Query-запрос для списка маршрутов
function useRoutes() {
    return useQuery({
        queryKey: ['routes'],
        queryFn: async (): Promise<Record<string, RouteRecord>> => {
            const snap = await get(child(ref(db), 'routes'))
            if (!snap.exists()) return {}
            return snap.val() as Record<string, RouteRecord>
        },
    })
}

export function AverageStopsCard() {
    const { data: routes, isLoading, error } = useRoutes()

    // Calculate average stops
    const list = Object.values(routes || {})
    const totalRoutes = list.length

    // Sum up stops lengths, treating missing as zero
    const totalStops = list.reduce((sum, r) => {
        const len = Array.isArray(r.stops) ? r.stops.length : 0
        return sum + len
    }, 0)

    const average = totalRoutes > 0 ? totalStops / totalRoutes : 0
    const display = average.toFixed(1)

    // Рассчитываем тренд - сравниваем с "идеальным" числом остановок (например, 15)
    const idealStops = 15
    const percentFromIdeal = average > 0 ? ((average - idealStops) / idealStops) * 100 : 0
    
    const stopsIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2v20" />
        </svg>
    )

    return (
        <MetricCard
            title="Среднее число остановок"
            value={display}
            description={`на основе ${totalRoutes} маршрутов`}
            icon={stopsIcon}
            loading={isLoading}
            error={!!error}
            trend={
                !isLoading && !error && average > 0
                    ? {
                          value: parseFloat(Math.abs(percentFromIdeal).toFixed(1)),
                          label: "от оптимального",
                          positive: percentFromIdeal >= 0
                      }
                    : undefined
            }
        />
    )
}
