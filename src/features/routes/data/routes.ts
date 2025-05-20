import { db } from '@/lib/firebase'
import { ref, get, child, DataSnapshot } from 'firebase/database'
import { Route as SchemaRoute } from './schema'

// Используем тип из схемы для совместимости
export type Route = SchemaRoute

export async function fetchRoutes(): Promise<Route[]> {
  const dbRef = ref(db)
  const snapshot: DataSnapshot = await get(child(dbRef, 'routes'))
  if (!snapshot.exists()) return []
  const routesObj = snapshot.val() as Record<string, any>
  
  // Преобразуем данные из Firebase в формат, соответствующий схеме
  return Object.values(routesObj).map((route: any) => {
    // Обеспечиваем наличие всех полей из схемы с дефолтными значениями
    return {
      id: route.id || '',
      number: route.number || '',
      title: route.title || '',
      carrierCompany: route.carrierCompany || '',
      description: route.description || '',
      following: route.following || '',
      fare: route.fare || '',
      cityId: route.cityId || 0,
      departureTimes: route.departureTimes || [],
      weekendDepartureTimes: route.weekendDepartureTimes || [],
      intervalBetweenStops: route.intervalBetweenStops || [],
      stops: route.stops || [],
      isCashAccepted: route.isCashAccepted || false,
      isEcological: route.isEcological || false,
      isLowFloor: route.isLowFloor || false,
      isQRCodeAvailable: route.isQRCodeAvailable || false,
      isWifiAvailable: route.isWifiAvailable || false,
      sizeId: route.sizeId || '',
      typeId: route.typeId || '',
      techInfo: route.techInfo || '',
      workingHours: route.workingHours || '',
    } as Route
  })
}
