import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      // If not signed in, redirect to sign-in page
      if (!firebaseUser && location.pathname !== '/sign-in') {
        navigate({ to: '/sign-in' })
      }
    })

    return unsubscribe
  }, [navigate, location.pathname])

  if (loading) return null // Or a loader

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}