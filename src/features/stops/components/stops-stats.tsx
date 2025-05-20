import { MetricCard } from "@/features/dashboard/components/metric-card"
import { useStops } from "../context/stops-context"
import { IconBus, IconMapPin, IconRoute, IconBuilding, IconMap, IconCompass } from "@tabler/icons-react"
import { useMemo } from "react"

export function StopsStats() {
  const { stops, loading, error } = useStops()

  const stats = useMemo(() => {
    if (loading || error || !stops.length) {
      return {
        totalStops: 0,
        stopsWithCity: 0,
        uniqueCities: 0,
        northernmostStop: null,
        southernmostStop: null,
        easternmostStop: null,
        westernmostStop: null
      }
    }

    const totalStops = stops.length
    const stopsWithCity = stops.filter(s => s.cityId !== undefined).length
    
    // Подсчет уникальных городов
    const uniqueCityIds = new Set(stops.map(s => s.cityId).filter(Boolean))
    const uniqueCities = uniqueCityIds.size
    
    // Поиск крайних точек
    let northernmostStop = stops[0]
    let southernmostStop = stops[0]
    let easternmostStop = stops[0]
    let westernmostStop = stops[0]
    
    stops.forEach(stop => {
      const lat = parseFloat(stop.latitude)
      const lng = parseFloat(stop.longitude)
      
      if (!isNaN(lat) && !isNaN(lng)) {
        if (lat > parseFloat(northernmostStop.latitude)) northernmostStop = stop
        if (lat < parseFloat(southernmostStop.latitude)) southernmostStop = stop
        if (lng > parseFloat(easternmostStop.longitude)) easternmostStop = stop
        if (lng < parseFloat(westernmostStop.longitude)) westernmostStop = stop
      }
    })

    return {
      totalStops,
      stopsWithCity,
      uniqueCities,
      northernmostStop,
      southernmostStop,
      easternmostStop,
      westernmostStop
    }
  }, [stops, loading, error])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <MetricCard
        title="Всего остановок"
        value={stats.totalStops}
        loading={loading}
        error={Boolean(error)}
        icon={<IconMapPin size={20} />}
        description="Общее количество остановок в системе"
      />
      
      <MetricCard
        title="Остановки с городом"
        value={`${stats.stopsWithCity} (${Math.round(stats.stopsWithCity / stats.totalStops * 100) || 0}%)`}
        loading={loading}
        error={Boolean(error)}
        icon={<IconBuilding size={20} />}
        description="Остановки с привязкой к городу"
        valueClassName={stats.stopsWithCity === stats.totalStops ? "text-emerald-500" : undefined}
      />
      
      <MetricCard
        title="Самая северная остановка"
        value={stats.northernmostStop?.name || "—"}
        loading={loading}
        error={Boolean(error)}
        icon={<IconCompass size={20} />}
        description={`Широта: ${stats.northernmostStop?.latitude || "—"}`}
      />
      
      <MetricCard
        title="Самая южная остановка"
        value={stats.southernmostStop?.name || "—"}
        loading={loading}
        error={Boolean(error)}
        icon={<IconCompass size={20} />}
        description={`Широта: ${stats.southernmostStop?.latitude || "—"}`}
      />
      
      <MetricCard
        title="Самая восточная остановка"
        value={stats.easternmostStop?.name || "—"}
        loading={loading}
        error={Boolean(error)}
        icon={<IconCompass size={20} />}
        description={`Долгота: ${stats.easternmostStop?.longitude || "—"}`}
      />

      <MetricCard
        title="Самая западная остановка"
        value={stats.westernmostStop?.name || "—"}
        loading={loading}
        error={Boolean(error)}
        icon={<IconCompass size={20} />}
        description={`Долгота: ${stats.westernmostStop?.longitude || "—"}`}
      />
    </div>
  )
}
