'use client'

import { useQuery } from '@tanstack/react-query'
import { ref, get, child } from 'firebase/database'
import { db } from '@/lib/firebase'
import { MetricCard } from './metric-card'

// Haversine formula — расстояние в километрах
function haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371 // радиус Земли в км
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function TotalMileageCard() {
    // Запрашиваем все остановки
    const stopsQuery = useQuery({
        queryKey: ['stops'],
        queryFn: async () => {
            const snap = await get(child(ref(db), 'stops'))
            if (!snap.exists()) return {}
            return snap.val() as Record<
                string,
                { latitude: string; longitude: string }
            >
        }
    })

    // Запрашиваем все маршруты
    const routesQuery = useQuery({
        queryKey: ['routes'],
        queryFn: async () => {
            const snap = await get(child(ref(db), 'routes'))
            if (!snap.exists()) return {}
            return snap.val() as Record<string, { stops: string[] }>
        }
    })

    const isLoading = stopsQuery.isLoading || routesQuery.isLoading;
    const error = stopsQuery.error || routesQuery.error;

    // Вычисляем пробег каждого маршрута и суммируем
    let totalKm = 0;
    let routeCount = 0;
    
    if (!isLoading && !error) {
        const stops = stopsQuery.data!;
        const routes = routesQuery.data!;
        routeCount = Object.keys(routes).length;
        
        Object.values(routes).forEach((route) => {
            const stopIds = Array.isArray(route.stops) ? route.stops : []
            const pts = stopIds
                .map((stopId) => {
                    const s = stops[stopId]
                    if (!s) return null
                    const lat = parseFloat(s.latitude)
                    const lon = parseFloat(s.longitude)
                    return isNaN(lat) || isNaN(lon) ? null : { lat, lon }
                })
                .filter((pt): pt is { lat: number; lon: number } => !!pt)

            // суммируем сегменты
            for (let i = 1; i < pts.length; i++) {
                totalKm += haversine(
                    pts[i - 1].lat,
                    pts[i - 1].lon,
                    pts[i].lat,
                    pts[i].lon
                )
            }
        });
    }

    // Округляем до одного знака
    const display = `${totalKm.toFixed(1)} км`;
    
    // Рассчитываем среднюю длину маршрута
    const avgRouteLength = routeCount > 0 ? totalKm / routeCount : 0;
    
    // Иконка трека
    const trackIcon = (
        <svg 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
        >
            <path d="M3 3v18h18" />
            <path d="M20 18l-2-2-4 4-3-3-4 4-2-2" />
        </svg>
    );

    return (
        <MetricCard
            title="Общий пробег"
            value={display}
            description="сумма длин всех маршрутов"
            icon={trackIcon}
            loading={isLoading}
            error={!!error}
            trend={
                !isLoading && !error && routeCount > 0
                    ? {
                          value: parseFloat(avgRouteLength.toFixed(1)),
                          label: "км/маршрут",
                          positive: true
                      }
                    : undefined
            }
        />
    )
}
