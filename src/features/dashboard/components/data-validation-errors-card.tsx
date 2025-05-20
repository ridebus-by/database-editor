import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { child, get, ref } from "firebase/database";

export function DataValidationErrorsCard() {
  // Считаем некорректные остановки
  const { data: stops, isLoading: sLoading } = useQuery({
    queryKey: ['stops'],
    queryFn: async () => {
      const snap = await get(child(ref(db), 'stops'))
      if (!snap.exists()) return {}
      return snap.val() as Record<string, { latitude: string; longitude: string }>
    },
  })
  // Считаем некорректные маршруты
  const { data: routes, isLoading: rLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const snap = await get(child(ref(db), 'routes'))
      if (!snap.exists()) return {}
      return snap.val() as Record<string, { title?: string; fare?: string }>
    },
  })

  const isLoading = sLoading || rLoading
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ошибки данных</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    )
  }

  // Подсчёт ошибок
  let errorCount = 0
  Object.values(stops || {}).forEach(s => {
    if (
      s.latitude.trim() === '' ||
      s.longitude.trim() === '' ||
      isNaN(parseFloat(s.latitude)) ||
      isNaN(parseFloat(s.longitude))
    ) {
      errorCount++
    }
  })
  Object.values(routes || {}).forEach(r => {
    if (!r.title || r.title.trim() === '' || !r.fare || r.fare.trim() === '') {
      errorCount++
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ошибки в данных</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{errorCount}</div>
        <CardDescription>
          маршруты/остановки с некорректными полями
        </CardDescription>
      </CardContent>
    </Card>
  )
}