import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { MetricCard } from "./metric-card"

export function FirebaseErrorsCard() {
    const queryClient = useQueryClient()
    const [errorCount, setErrorCount] = useState(0)
    const [prevErrorCount, setPrevErrorCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Подписка на все ошибки в queryCache
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            if (event.type === 'updated') {
                const errors = queryClient
                    .getQueryCache()
                    .findAll()
                    .filter((q) => q.state.error).length
                
                setPrevErrorCount(errorCount)
                setErrorCount(errors)
                setLoading(false)
            }
        })
        
        // Инициализируем сразу
        const initial = queryClient
            .getQueryCache()
            .findAll()
            .filter((q) => q.state.error).length
        
        setErrorCount(initial)
        setPrevErrorCount(initial)
        setLoading(false)

        return () => unsubscribe()
    }, [queryClient, errorCount])

    // Рассчитываем тренд - изменение количества ошибок
    const calculateTrend = () => {
        if (prevErrorCount === 0 && errorCount === 0) return undefined;
        
        // Если было 0, а стало больше - это 100% рост
        if (prevErrorCount === 0 && errorCount > 0) {
            return {
                value: 100,
                label: "увеличение",
                positive: false
            };
        }
        
        // Если было больше 0, а стало 0 - это 100% снижение
        if (prevErrorCount > 0 && errorCount === 0) {
            return {
                value: 100,
                label: "снижение",
                positive: true
            };
        }
        
        // Иначе рассчитываем процентное изменение
        const change = ((errorCount - prevErrorCount) / prevErrorCount) * 100;
        return {
            value: parseFloat(Math.abs(change).toFixed(1)),
            label: change > 0 ? "увеличение" : "снижение",
            positive: change <= 0 // снижение ошибок - это хорошо
        };
    };

    const errorIcon = (
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
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    )

    // Определяем цвет значения в зависимости от количества ошибок
    const getValueClassName = () => {
        if (errorCount === 0) return "text-emerald-500";
        if (errorCount < 3) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <MetricCard
            title="Ошибки Firebase"
            value={errorCount}
            description="активных ошибок запросов"
            icon={errorIcon}
            loading={loading}
            trend={!loading ? calculateTrend() : undefined}
            valueClassName={getValueClassName()}
        />
    )
}
