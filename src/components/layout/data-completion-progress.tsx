import { Progress } from '@/components/ui/progress'
import { useRoutes } from '@/features/routes/context/routes-context'
import { useStops } from '@/features/stops/context/stops-context'
import { Route } from '@/features/routes/data/schema'
import { Stop } from '@/features/stops/data/schema'
import { Bus, MapPin } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function DataCompletionProgress() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const { routes } = useRoutes()
  const { stops } = useStops()

  // Функция для проверки заполненности полей маршрута
  const isRouteComplete = (r: Route): boolean => {
    return (
      typeof r.id === 'string' &&
      typeof r.number === 'string' &&
      typeof r.title === 'string' &&
      typeof r.fare === 'string' &&
      Array.isArray(r.departureTimes) &&
      r.departureTimes.length >= 0 &&
      Array.isArray(r.intervalBetweenStops) &&
      Array.isArray(r.stops) &&
      r.stops.length >= 0
    )
  }

  // Функция для проверки заполненности полей остановки
  const isStopComplete = (s: Stop): boolean => {
    return (
      typeof s.id === 'string' &&
      typeof s.name === 'string' &&
      typeof s.direction === 'string' &&
      typeof s.latitude === 'string' &&
      !isNaN(parseFloat(s.latitude)) &&
      typeof s.longitude === 'string' &&
      !isNaN(parseFloat(s.longitude))
    )
  }

  // Расчет процента заполненных маршрутов
  const routesCompletionPercentage = routes.length
    ? Math.round((routes.filter(isRouteComplete).length / routes.length) * 100)
    : 0

  // Расчет процента заполненных остановок
  const stopsCompletionPercentage = stops.length
    ? Math.round((stops.filter(isStopComplete).length / stops.length) * 100)
    : 0

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <div className="px-2 py-2 flex flex-col items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <div className="flex justify-center mb-1">
                  <Bus className="h-4 w-4" />
                </div>
                <Progress value={routesCompletionPercentage} className="h-1.5 w-full" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Маршруты: {routesCompletionPercentage}%</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <div className="flex justify-center mb-1">
                  <MapPin className="h-4 w-4" />
                </div>
                <Progress value={stopsCompletionPercentage} className="h-1.5 w-full" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Остановки: {stopsCompletionPercentage}%</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <div className="px-4 py-2 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Bus className="h-3.5 w-3.5" />
            <span>Маршруты</span>
          </div>
          <span className="font-medium">{routesCompletionPercentage}%</span>
        </div>
        <Progress value={routesCompletionPercentage} className="h-1.5" />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>Остановки</span>
          </div>
          <span className="font-medium">{stopsCompletionPercentage}%</span>
        </div>
        <Progress value={stopsCompletionPercentage} className="h-1.5" />
      </div>
    </div>
  )
}
