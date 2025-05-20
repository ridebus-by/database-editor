import { MetricCard } from "@/features/dashboard/components/metric-card"
import { useRoutes } from "../context/routes-context"
import { IconBus, IconMapPin, IconRoute, IconRouteSquare2, IconTicket, IconWifi } from "@tabler/icons-react"
import { useMemo } from "react"

export function RoutesStats() {
  const { routes, loading, error } = useRoutes()

  const stats = useMemo(() => {
    if (loading || error || !routes.length) {
      return {
        totalRoutes: 0,
        activeRoutes: 0,
        ecologicalRoutes: 0,
        lowFloorRoutes: 0,
        wifiRoutes: 0,
        qrRoutes: 0,
        avgStops: 0,
        totalStops: 0
      }
    }

    const totalRoutes = routes.length
    // Считаем активными маршруты, у которых есть хотя бы одна остановка
    const activeRoutes = routes.filter(r => (r.stops?.length || 0) > 0).length
    const ecologicalRoutes = routes.filter(r => r.isEcological).length
    const lowFloorRoutes = routes.filter(r => r.isLowFloor).length
    const wifiRoutes = routes.filter(r => r.isWifiAvailable).length
    const qrRoutes = routes.filter(r => r.isQRCodeAvailable).length
    
    const totalStops = routes.reduce((acc, route) => acc + (route.stops?.length || 0), 0)
    const avgStops = totalStops / totalRoutes || 0

    return {
      totalRoutes,
      activeRoutes,
      ecologicalRoutes,
      lowFloorRoutes,
      wifiRoutes,
      qrRoutes,
      avgStops,
      totalStops
    }
  }, [routes, loading, error])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <MetricCard
        title="Всего маршрутов"
        value={stats.totalRoutes}
        loading={loading}
        error={Boolean(error)}
        icon={<IconRoute size={20} />}
        description="Общее количество маршрутов в системе"
      />
      
      <MetricCard
        title="Экологичные маршруты"
        value={`${stats.ecologicalRoutes} (${Math.round(stats.ecologicalRoutes / stats.totalRoutes * 100) || 0}%)`}
        loading={loading}
        error={Boolean(error)}
        icon={<IconRouteSquare2 size={20} />}
        description="Маршруты с экологичным транспортом"
        valueClassName={stats.ecologicalRoutes > 0 ? "text-emerald-500" : undefined}
      />
      
      <MetricCard
        title="Низкопольный транспорт"
        value={`${stats.lowFloorRoutes} (${Math.round(stats.lowFloorRoutes / stats.totalRoutes * 100) || 0}%)`}
        loading={loading}
        error={Boolean(error)}
        icon={<IconBus size={20} />}
        description="Маршруты с низкопольным транспортом"
      />
      
      <MetricCard
        title="Wi-Fi в транспорте"
        value={`${stats.wifiRoutes} (${Math.round(stats.wifiRoutes / stats.totalRoutes * 100) || 0}%)`}
        loading={loading}
        error={Boolean(error)}
        icon={<IconWifi size={20} />}
        description="Маршруты с доступом к Wi-Fi"
      />
      
      <MetricCard
        title="Оплата по QR-коду"
        value={`${stats.qrRoutes} (${Math.round(stats.qrRoutes / stats.totalRoutes * 100) || 0}%)`}
        loading={loading}
        error={Boolean(error)}
        icon={<IconTicket size={20} />}
        description="Маршруты с возможностью оплаты по QR"
      />
      
      <MetricCard
        title="Среднее кол-во остановок"
        value={stats.avgStops.toFixed(1)}
        loading={loading}
        error={Boolean(error)}
        icon={<IconMapPin size={20} />}
        description={`Всего остановок: ${stats.totalStops}`}
      />
    </div>
  )
}
