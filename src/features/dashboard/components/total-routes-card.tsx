'use client'

import { useQuery } from '@tanstack/react-query'
import { ref, get, child } from 'firebase/database'
import { db } from '@/lib/firebase'
import { MetricCard } from './metric-card'

// Тип маршрута из БД
interface RouteRecord {
    id: string
    createdAt?: number // UNIX timestamp в миллисекундах, опционально
}

// Хук для загрузки всех маршрутов
function useRoutes() {
    return useQuery({
        queryKey: ['routes'],
        queryFn: async () => {
            const snap = await get(child(ref(db), 'routes'))
            if (!snap.exists()) return {} as Record<string, RouteRecord>
            return snap.val() as Record<string, RouteRecord>
        },
    })
}

export function TotalRoutesCard() {
    const { data: routes, isLoading, error } = useRoutes()

    const list = Object.values(routes || {})
    const total = list.length

    // Считаем, сколько маршрутов было создано за последние 7 дней
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const withDate = list.filter((r) => typeof r.createdAt === 'number')
    const recent = withDate.filter((r) => (r.createdAt ?? 0) >= weekAgo).length

    // Процент изменения: (new / (total - new)) * 100
    const percent =
        total - recent > 0
            ? (recent / (total - recent)) * 100
            : recent > 0
                ? 100
                : 0

    const routesIcon = (
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
            <path d="M3 3h18v18H3z" />
            <path d="M3 9h18M9 3v18" />
        </svg>
    )

    return (
        <MetricCard
            title="Всего маршрутов"
            value={total}
            icon={routesIcon}
            loading={isLoading}
            error={!!error}
            trend={
                !isLoading && !error
                    ? {
                          value: parseFloat(Math.abs(percent).toFixed(1)),
                          label: "за неделю",
                          positive: percent >= 0
                      }
                    : undefined
            }
        />
    )
}
