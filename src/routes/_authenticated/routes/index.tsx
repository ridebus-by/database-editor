import Routes from '@/features/routes'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/routes/')({
  component: Routes,
})
