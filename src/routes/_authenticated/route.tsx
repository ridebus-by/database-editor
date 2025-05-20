import Cookies from 'js-cookie'
import { SidebarProvider } from '@/components/ui/sidebar'
import { SearchProvider } from '@/context/search-context'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import SkipToMain from '@/components/skip-to-main'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { onDisconnect, ref, serverTimestamp, set } from 'firebase/database'
import { formatISO, startOfMinute } from 'date-fns'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    // wait until Firebase Auth has re‑hydrated from storage
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve()
        if (user) {
          const now = formatISO(startOfMinute(new Date()))
          const logRef = ref(db, `presenceLogs/${user.uid}/${now}`)
          set(logRef, true)
        }
      })
    })

    // now auth.currentUser is reliably set (either User or null)
    if (!auth.currentUser) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
        throw: true,
      })
    }
  },
})

function usePresence() {
  const user = auth.currentUser
  if (!user) return
  const statusRef = ref(db, `status/${user.uid}`)
  useEffect(() => {
    // Set initial online state
    set(statusRef, {
      online: true,
      lastSeen: serverTimestamp(),
    })

    // Ensure accurate status on disconnect
    onDisconnect(statusRef).set({
      online: false,
      lastSeen: serverTimestamp(),
    })
  }, [])

  useEffect(() => {
    function updateOnlineStatus() {
      set(statusRef, {
        online: navigator.onLine,
        lastSeen: serverTimestamp(),
      })
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])
}

function RouteComponent() {
  usePresence()

  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
          )}
        >
          <Outlet />
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}