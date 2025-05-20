import Stops from '@/features/stops'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/stops/')({
  component: Stops,
})
