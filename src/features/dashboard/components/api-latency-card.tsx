'use client'

import { useEffect, useState } from 'react'
import { ref, get, child } from 'firebase/database'
import { db } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { declOfNum } from '@/utils/number'

/**
 * Карточка: среднее время отклика ключевого запроса (routes)
 */
export function ApiLatencyCard() {
    const [latencies, setLatencies] = useState<number[]>([])
    // Используем отдельный fetch без кэша, чтобы измерить реальные задержки
    useEffect(() => {
        let isActive = true
        async function measure() {
            const t0 = performance.now()
            await get(child(ref(db), 'routes'))
            const t1 = performance.now()
            if (isActive) {
                setLatencies((prev) => [...prev.slice(-9), t1 - t0]) // храним до 10 последних
            }
        }
        // Первичная и последующие замеры каждые минуту
        measure()
        const id = setInterval(measure, 60_000)
        return () => {
            isActive = false
            clearInterval(id)
        }
    }, [])

    // Вычисляем среднее
    const avg =
        latencies.length > 0
            ? latencies.reduce((sum, x) => sum + x, 0) / latencies.length
            : 0

    return (
        <Card>
            <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle>
                    Время отклика API
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
                    <path d="M3 12h18M12 3v18" />
                </svg>
            </CardHeader>
            <CardContent>
                <div className="space-y-0.5">
                    {latencies.length === 0 ? (
                        <Skeleton className="h-8 w-24" />
                    ) : (
                        <div className="text-2xl font-bold">
                            {avg.toFixed(0)}&nbsp;ms
                        </div>
                    )}
                    <p className="text-muted-foreground text-xs">
                        {latencies.length}{' '}
                        {declOfNum(latencies.length, ['замер', 'замера', 'замеров'])}
                        , среднее значение
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}