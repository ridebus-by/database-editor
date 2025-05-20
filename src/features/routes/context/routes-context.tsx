import React, { useEffect, useState } from "react"
import { Route } from "../data/schema"
import useDialogState from "@/hooks/use-dialog-state"
import { fetchRoutes } from "../data/routes"
import { child, get, push, ref, remove, set } from "firebase/database"
import { auth, db } from "@/lib/firebase"

type RoutesDialogType = 'add' | 'edit' | 'delete'

interface RoutesContextType {
  open: RoutesDialogType | null
  setOpen: (str: RoutesDialogType | null) => void
  currentRow: Route | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Route | null>>
  routes: Route[]
  loading: boolean
  error: Error | null
  refreshRoutes: () => Promise<void>
  addRoute: (route: Omit<Route, "id">) => Promise<void>
  updateRoute: (id: string, route: Partial<Route>) => Promise<void>
  deleteRoute: (id: string) => Promise<void>
}

const RoutesContext = React.createContext<RoutesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

interface NotificationPayload {
  type: 'route_added' | 'schedule_changed' | 'invalid_record' | 'other'
  message: string
  details?: string
  userId: string
  userName: string
  entityId?: string
  entityType?: 'route' | 'stop'
}

export default function RoutesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<RoutesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Route | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshRoutes = async () => {
    try {
      setLoading(true)
      const fetched = await fetchRoutes()
      setRoutes(fetched as Route[])
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const addRoute = async (route: Omit<Route, "id">) => {
    try {
      const routesRef = ref(db, 'routes')
      const newRouteRef = child(routesRef, Date.now().toString())
      const newRoute = { ...route, id: newRouteRef.key }
      await set(newRouteRef, newRoute)
      await refreshRoutes()
      const notif: NotificationPayload = {
        type: 'route_added',
        message: `Добавлен новый маршрут №${route.number}`,
        details: `Маршрут №${route.number} добавлен в систему и готов к использованию`,
        userId: auth.currentUser!.uid,
        userName: auth.currentUser!.displayName || 'Unknown',
        entityId: newRouteRef.key!,
        entityType: 'route',
      }
      await push(ref(db, 'notifications'), {
        ...notif,
        timestamp: Date.now(),
        read: false,
      })
    } catch (err) {
      console.error("Ошибка при добавлении маршрута:", err)
      throw err
    }
  }

  const updateRoute = async (id: string, route: Partial<Route>) => {
    try {
      const routeRef = ref(db, `routes/${id}`)
      const snapshot = await get(routeRef)
      if (!snapshot.exists()) {
        throw new Error(`Маршрут с ID ${id} не найден`)
      }
      const currentData = snapshot.val()
      const updatedRoute = { ...currentData, ...route }
      await set(routeRef, updatedRoute)
      await refreshRoutes()
    } catch (err) {
      console.error("Ошибка при обновлении маршрута:", err)
      throw err
    }
  }

  const deleteRoute = async (id: string) => {
    try {
      const routeRef = ref(db, `routes/${id}`)
      await remove(routeRef)
      await refreshRoutes()
    } catch (err) {
      console.error("Ошибка при удалении маршрута:", err)
      throw err
    }
  }

  useEffect(() => {
    refreshRoutes()
  }, [])

  return (
    <RoutesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        routes,
        loading,
        error,
        refreshRoutes,
        addRoute,
        updateRoute,
        deleteRoute
      }}
    >
      {children}
    </RoutesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRoutes = () => {
  const routesContext = React.useContext(RoutesContext)

  if (!routesContext) {
    throw new Error('useRoutes has to be used within <RoutesContext>')
  }

  return routesContext
}
