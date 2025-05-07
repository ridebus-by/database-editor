import { Link, useNavigate } from '@tanstack/react-router'
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'
import { signOut } from 'firebase/auth'
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database'
import { auth as firebaseAuth, db } from '@/lib/firebase'
import { useEffect, useState } from 'react'

interface Profile {
    avatar: string
    name: string
    email: string
  }

export function NavUser() {
    const { isMobile } = useSidebar()
    const navigate = useNavigate()
    const firebaseUser = firebaseAuth.currentUser
    const [profile, setProfile] = useState<Profile | null>(null)

    // Load profile from Realtime Database
  useEffect(() => {
    if (!firebaseUser) return
    const staffQuery = query(
      ref(db, 'staff'),
      orderByChild('firebaseUid'),
      equalTo(firebaseUser.uid)
    )
    const unsubscribe = onValue(staffQuery, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // snapshot.val() is an object with one key
        const key = Object.keys(data)[0]
        const item = data[key]
        setProfile({
          avatar: item.iconUrl,
          name: item.username,
          email: item.profileUrl /* or use item.email if exists */,
        })
      }
    })
    return () => unsubscribe()
  }, [firebaseUser])

  const handleLogout = async () => {
    await signOut(firebaseAuth)
    navigate({ to: '/sign-in' })
  }

  if (!profile) return null

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <Avatar className='h-8 w-8 rounded-lg'>
                                <AvatarImage src={profile.avatar} alt={profile.name} />
                                <AvatarFallback className='rounded-lg'>SN</AvatarFallback>
                            </Avatar>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-semibold'>{profile.name}</span>
                                <span className='truncate text-xs'>{profile.email}</span>
                            </div>
                            <ChevronsUpDown className='ml-auto size-4' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                        side={isMobile ? 'bottom' : 'right'}
                        align='end'
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className='p-0 font-normal'>
                            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                                <Avatar className='h-8 w-8 rounded-lg'>
                                    <AvatarImage src={profile.avatar} alt={profile.name} />
                                    <AvatarFallback className='rounded-lg'>SN</AvatarFallback>
                                </Avatar>
                                <div className='grid flex-1 text-left text-sm leading-tight'>
                                    <span className='truncate font-semibold'>{profile.name}</span>
                                    <span className='truncate text-xs'>{profile.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link to='/settings/account'>
                                    <BadgeCheck />
                                    Account
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to='/settings'>
                                    <CreditCard />
                                    Billing
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to='/settings/notifications'>
                                    <Bell />
                                    Notifications
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleLogout} className='text-destructive'>
                            <LogOut className='mr-2 h-4 w-4' />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}