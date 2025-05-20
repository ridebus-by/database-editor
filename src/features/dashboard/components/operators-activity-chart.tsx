'use client'

import { useQuery } from '@tanstack/react-query'
import { get, child, ref } from 'firebase/database'
import { db } from '@/lib/firebase'
import {
    AreaChart,
    Area,
    XAxis,
    ResponsiveContainer,
} from 'recharts'
import { MetricCard } from './metric-card'

interface ActivityPoint {
    time: string
    online: number
}

async function fetchPresenceHistory(): Promise<ActivityPoint[]> {
    const snap = await get(child(ref(db), 'presenceLogs'))
    if (!snap.exists()) return []

    const val = snap.val() as Record<string, Record<string, true>>
    const minuteMap: Record<string, Set<string>> = {}

    Object.entries(val).forEach(([uid, timestamps]) => {
        Object.keys(timestamps).forEach((ts) => {
            if (!minuteMap[ts]) {
                minuteMap[ts] = new Set()
            }
            minuteMap[ts].add(uid)
        })
    })

    const sorted = Object.entries(minuteMap)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([timestamp, users]) => ({
            time: new Date(timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            online: users.size,
        }))

    return sorted
}

export function OperatorsActivityCard() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['presence-history'],
        queryFn: fetchPresenceHistory,
        refetchInterval: 60000,
    })

    const current = data?.at(-1)?.online ?? 0

    // Рассчитываем изменение количества операторов
    const calculateTrend = () => {
        if (!data || data.length < 2) return undefined;
        
        const lastIndex = data.length - 1;
        const currentValue = data[lastIndex].online;
        const previousValue = data[Math.max(0, lastIndex - 10)].online; // Берем значение 10 точек назад
        
        if (previousValue === 0) return undefined;
        
        const change = ((currentValue - previousValue) / previousValue) * 100;
        return {
            value: parseFloat(Math.abs(change).toFixed(1)),
            label: "за последний час",
            positive: change >= 0
        };
    };

    const operatorsIcon = (
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );

    return (
        <MetricCard
            title="Операторов в сети"
            value={current}
            description="сейчас в системе"
            icon={operatorsIcon}
            loading={isLoading}
            error={!!error}
            trend={!isLoading && !error ? calculateTrend() : undefined}
            className="relative overflow-hidden"
        >
            {!isLoading && !error && data && (
                <div className='absolute inset-x-0 bottom-0 h-16 pointer-events-none opacity-30'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart 
                            data={data}
                            margin={{
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0
                            }}
                        >
                            <defs>
                                <linearGradient id='fillOnline' x1='0' y1='0' x2='0' y2='1'>
                                    <stop
                                        offset='5%'
                                        stopColor='var(--primary)'
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset='95%'
                                        stopColor='var(--primary)'
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey='time' hide />
                            <Area
                                type='monotone'
                                dataKey='online'
                                stroke='var(--primary)'
                                fill='url(#fillOnline)'
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </MetricCard>
    )
}
