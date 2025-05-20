import React, { useEffect, useState, useCallback } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import { fetchStops } from "../data/stops"
import { Stop } from "../data/schema"

type StopsDialogType = 'add' | 'edit' | 'delete'

interface StopsContextType {
  open: StopsDialogType | null
  setOpen: (str: StopsDialogType | null) => void
  currentRow: Stop | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Stop | null>>
  stops: Stop[]
  loading: boolean
  error: Error | null
  refreshStops: () => Promise<void>
}

const StopsContext = React.createContext<StopsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function StopsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<StopsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Stop | null>(null)
  const [stops, setStops] = useState<Stop[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshStops = useCallback(async () => {
    setLoading(true)
    try {
      const fetched = await fetchStops()
      setStops(fetched)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshStops()
  }, [refreshStops])

  return (
    <StopsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, stops, loading, error, refreshStops }}>
      {children}
    </StopsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStops = () => {
  const stopsContext = React.useContext(StopsContext)

  if (!stopsContext) {
    throw new Error('useStops has to be used within <stopsContext>')
  }

  return stopsContext
}
