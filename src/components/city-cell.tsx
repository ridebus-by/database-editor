import { useEffect, useState } from 'react'
import { ref, get, child } from 'firebase/database'
import { db } from '@/lib/firebase'
import { Skeleton } from './ui/skeleton'

interface City {
  id: number
  name: string
}

export function CityCell({ cityId }: { cityId?: number }) {
  const [cityName, setCityName] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        // Если cityId не определен, сразу устанавливаем дефолтное значение
        if (cityId === undefined) {
          setCityName('—')
          return
        }
        
        const snap = await get(child(ref(db), 'city'))
        if (!snap.exists()) {
          setCityName('—')
          return
        }
        const obj = snap.val() as Record<string, City>
        const found = Object.values(obj).find((c) => c.id === cityId)
        setCityName(found ? found.name : '—')
      } catch {
        setCityName('—')
      }
    }
    load()
  }, [cityId])

  return <span>{cityName ?? <Skeleton className="h-4 w-[48px]" />}</span>
}
