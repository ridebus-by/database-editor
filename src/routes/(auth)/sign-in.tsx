import SignIn from '@/features/auth/sign-in/sign-in'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
})
