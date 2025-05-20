import { useEffect, useState } from 'react'
import { ref, get, child } from 'firebase/database'
import { db } from '@/lib/firebase'
import { Skeleton } from './ui/skeleton'
import { Badge } from './ui/badge'

interface Type {
    id: string
    name: string
    color: string
}

export function TypeCell({ typeId }: { typeId: string }) {
    const [routeType, setRouteType] = useState<Type | null | undefined>(
        undefined
    )

    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const snap = await get(child(ref(db), 'types'))
                if (cancelled) return

                if (!snap.exists()) {
                    setRouteType(null)
                    return
                }
                const obj = snap.val() as Record<string, Type>
                const found = Object.values(obj).find((t) => t.id === typeId) || null
                setRouteType(found)
            } catch {
                if (!cancelled) setRouteType(null)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [typeId])

    // Loading
    if (routeType === undefined) {
        return <Skeleton className="h-6 w-16" />
    }

    // Not found
    if (routeType === null) {
        return <span>—</span>
    }

    // Found
    return (
        <Badge variant="outline" className={routeType.color}>
            {routeType.name}
        </Badge>
    )
}