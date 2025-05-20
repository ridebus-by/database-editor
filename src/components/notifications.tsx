'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useNotificationsRealtime } from '@/hooks/use-notifications-realtime'
import { NotificationsCard } from '@/features/dashboard/components/notifications-card'

export function Notifications() {
  const { notifications } = useNotificationsRealtime()
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"
                aria-label={`${unreadCount} непрочитанных уведомлений`}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="p-0 w-[320px] sm:w-[620px] md:w-[680px]">
          {/* Внутри PopoverContent можно прямо вставить NotificationsCard */}
          <NotificationsCard inPopover={true} />
        </PopoverContent>
      </Popover>
  )
}
