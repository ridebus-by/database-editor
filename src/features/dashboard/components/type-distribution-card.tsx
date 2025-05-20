'use client'

import { useQuery } from '@tanstack/react-query'
import { ref, get, child } from 'firebase/database'
import { db } from '@/lib/firebase'
import { PieChart, Pie, Sector, Label, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PieSectorDataItem } from 'recharts/types/polar/Pie'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

interface Route {
    typeId: string
}
interface RouteType {
    id: string
    name: string
    color: string
}

// Загрузка маршрутов
async function fetchRoutes(): Promise<Route[]> {
    const snap = await get(child(ref(db), 'routes'))
    if (!snap.exists()) return []
    return Object.values(snap.val() as Record<string, Route>)
}

// Загрузка справочника типов
async function fetchTypes(): Promise<RouteType[]> {
    const snap = await get(child(ref(db), 'types'))
    if (!snap.exists()) return []
    return Object.values(snap.val() as Record<string, RouteType>)
}

// Компонент для отображения подписи в центре круговой диаграммы
const CenterLabel = ({ viewBox, activeItem }: { viewBox: any, activeItem: { name: string, value: number } }) => {
    if (!viewBox || typeof viewBox.cx !== 'number') return null;
    return (
        <text
            x={viewBox.cx}
            y={viewBox.cy}
            textAnchor="middle"
            dominantBaseline="middle"
        >
            <tspan
                x={viewBox.cx}
                y={viewBox.cy}
                className="fill-foreground text-3xl font-bold"
            >
                {activeItem.value}
            </tspan>
            <tspan
                x={viewBox.cx}
                y={(viewBox.cy ?? 0) + 24}
                className="fill-muted-foreground text-sm"
            >
                {activeItem.name}
            </tspan>
        </text>
    );
};

// Компонент для отображения активного сектора
const ActiveShape = ({ outerRadius = 0, ...props }: PieSectorDataItem) => (
    <g>
        <Sector {...props} outerRadius={outerRadius + 8} />
        <Sector
            {...props}
            outerRadius={outerRadius + 16}
            innerRadius={outerRadius + 10}
            fill={props.fill}
            fillOpacity={0.3}
        />
    </g>
);

// Кастомный тултип для диаграммы
const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    return (
        <div className="bg-background/95 border rounded-md shadow-md p-2 text-sm">
            <p className="font-medium">{data.name}</p>
            <p className="text-muted-foreground">Количество: {data.value}</p>
        </div>
    );
};

export function TypeDistributionCard() {
    const { data: rawRoutes, isLoading: rLoading } = useQuery({
        queryKey: ['routes'],
        queryFn: fetchRoutes,
    })
    const { data: types, isLoading: tLoading } = useQuery({
        queryKey: ['types'],
        queryFn: fetchTypes,
    })
    const loading = rLoading || tLoading
    const routes: Route[] = useMemo(() => {
        if (!rawRoutes) return []
        return Array.isArray(rawRoutes) ? rawRoutes : Object.values(rawRoutes)
    }, [rawRoutes])

    const data = useMemo(() => {
        if (routes.length === 0 || !types) return []
        // Считаем частоты
        const freq: Record<string, number> = {}
        routes.forEach((r) => {
            freq[r.typeId] = (freq[r.typeId] ?? 0) + 1
        })
        // Собираем массив данных для графика
        return types.map((t) => ({
            name: t.name,
            value: freq[t.id] ?? 0,
            fill: t.color,
            id: t.id,
        }))
    }, [routes, types])

    const [activeId, setActiveId] = useState<string | null>(
        data[0]?.id ?? null
    )
    const activeIndex = useMemo(
        () => data.findIndex((d) => d.id === activeId),
        [data, activeId]
    )
    const activeItem = data[activeIndex] || { name: '', value: 0 }

    // Создаем список типов для легенды
    const typesList = useMemo(() => {
        return data
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [data]);

    return (
        <Card className="col-span-1 lg:col-span-4 overflow-hidden group hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                            Распределение типов транспорта
                        </CardTitle>
                        <CardDescription>
                            Всего маршрутов: {routes?.length ?? 0}
                        </CardDescription>
                    </div>
                    <div className="text-muted-foreground group-hover:text-primary/80 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z"/>
                            <path d="M12 2v20"/>
                            <path d="M2 12h20"/>
                        </svg>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* График */}
                <div className="md:col-span-3 flex justify-center items-center">
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <div className="w-full h-64 max-w-[300px] mx-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={50}
                                        outerRadius={80}
                                        activeIndex={activeIndex}
                                        activeShape={ActiveShape}
                                        onClick={(_, index) => setActiveId(data[index].id)}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.fill} 
                                                stroke={entry.fill}
                                                strokeWidth={1}
                                            />
                                        ))}
                                        <Label
                                            content={<CenterLabel viewBox={{cx: 150, cy: 120}} activeItem={activeItem} />}
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Легенда */}
                <div className="md:col-span-2 flex flex-col">
                    <h4 className="text-sm font-medium mb-2">Типы транспорта</h4>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    ) : (
                        <div className="space-y-1.5 overflow-y-auto max-h-[200px] pr-2">
                            {typesList.map((type) => (
                                <div 
                                    key={type.id}
                                    className={cn(
                                        "flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors",
                                        type.id === activeId ? "bg-muted" : "hover:bg-muted/50"
                                    )}
                                    onClick={() => setActiveId(type.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: type.fill }}
                                        />
                                        <span className="text-sm">{type.name}</span>
                                    </div>
                                    <span className="text-sm font-medium">{type.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
