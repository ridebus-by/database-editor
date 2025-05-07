import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'firebase/auth'
import { auth as firebaseAuth, db } from '@/lib/firebase'
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database'

interface Profile {
  avatar: string
  name: string
  email: string
}

export function ProfileDropdown() {
  const navigate = useNavigate()
  const firebaseUser = firebaseAuth.currentUser
  const [profile, setProfile] = useState<Profile | null>(null)

  // Fetch profile from Realtime DB
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
        const key = Object.keys(data)[0]
        const item = data[key]
        setProfile({
          avatar: item.iconUrl,
          name: item.username,
          email: item.profileUrl, // or item.email if stored
        })
      }
    })
    return () => unsubscribe()
  }, [firebaseUser])

  const handleLogout = async () => {
    await signOut(firebaseAuth)
    navigate({ to: '/sign-in' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            {profile ? (
              <AvatarImage src={profile.avatar} alt={profile.name} />
            ) : null}
            <AvatarFallback>
              {profile ? profile.name.slice(0, 2).toUpperCase() : '??'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>
              {profile?.name || 'Loading...'}
            </p>
            <p className='text-muted-foreground text-xs leading-none'>
              {profile?.email || ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/profile'>
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/settings/billing'>
              Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className='text-destructive'>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}