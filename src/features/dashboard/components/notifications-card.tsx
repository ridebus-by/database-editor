'use client'

import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Filter, Clock, Route, AlertTriangle } from 'lucide-react'
import { Notification, useNotificationsRealtime } from '@/hooks/use-notifications-realtime'
import { IconBusStop } from '@tabler/icons-react'

// утиль для форматирования времени
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин. назад`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} ч. назад`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} д. назад`
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Функция для получения иконки по типу уведомления
function getNotificationIcon(type: string) {
  switch (type) {
    case 'route_added':
      return <Route className="h-4 w-4" />
    case 'stop_added':
      return <IconBusStop className="h-4 w-4" />
    case 'schedule_changed':
      return <Clock className="h-4 w-4" />
    case 'invalid_record':
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

// Функция для получения цвета бейджа по типу уведомления
function getNotificationBadge(type: string) {
  switch (type) {
    case 'route_added':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Новый маршрут</Badge>
    case 'stop_added':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Новая остановка</Badge>
    case 'schedule_changed':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Изменение расписания</Badge>
    case 'invalid_record':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Ошибка данных</Badge>
    default:
      return <Badge variant="outline">Уведомление</Badge>
  }
}

export function NotificationsCard({ inPopover = false }: { inPopover?: boolean }) {
  const { notifications, markAllAsRead } = useNotificationsRealtime()
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'important'>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // фильтры
  const filteredNotifications = notifications.filter(notification => {
    // Фильтр по вкладке
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && !notification.read) ||
      (activeTab === 'important' && notification.type === 'invalid_record');

    // Фильтр по типу события
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;

    // Фильтр по пользователю
    const matchesUser = userFilter === 'all' || notification.userId === userFilter;

    return matchesTab && matchesType && matchesUser;
  })

  const users = Array.from(
    new Map(
      notifications.map((n) => [n.userId, n.userName])
    ).entries()
  ).map(([id, name]) => ({ id, name }))

  return (
    <Card className={inPopover ? 'border-0 shadow-none rounded-none' : ''}>
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              Уведомления
            </CardTitle>
            <CardDescription>
              Лента последних событий системы
            </CardDescription>
          </div>
          <div className="text-muted-foreground group-hover:text-primary/80 transition-colors">
            <Bell className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-4 sm:px-6 py-2 border-b flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Все
                {notifications.length > 0 && (
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {notifications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                Непрочитанные
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="important">
                Важные
                {notifications.filter(n => n.type === 'invalid_record').length > 0 && (
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {notifications.filter(n => n.type === 'invalid_record').length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="px-4 sm:px-6 py-2 border-b flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Фильтры:</span>
          </div>

          <div className="flex flex-1 flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-full sm:w-[180px]">
                <SelectValue placeholder="Тип события" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="route_added">Новый маршрут</SelectItem>
                <SelectItem value="stop_added">Новая остановка</SelectItem>
                <SelectItem value="schedule_changed">Изменение расписания</SelectItem>
                <SelectItem value="invalid_record">Ошибка данных</SelectItem>
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="h-8 w-full sm:w-[180px]">
                <SelectValue placeholder="Пользователь" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все пользователи</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[300px] sm:h-[350px]">
          <div className="p-0">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/20' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${notification.type === 'invalid_record'
                      ? 'bg-red-100 text-red-700'
                      : notification.type === 'route_added'
                        ? 'bg-green-100 text-green-700'
                        : notification.type === 'stop_added'
                        ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">
                        {notification.userName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(notification.timestamp)}
                      </div>
                    </div>

                    <div className="text-sm">{notification.message}</div>

                    {notification.details && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {notification.details}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      {getNotificationBadge(notification.type)}

                      {notification.entityId && (
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          Перейти к {notification.entityType === 'route' ? 'маршруту' : 'остановке'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="flex justify-between border-t px-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={markAllAsRead}
        >
          Отметить все как прочитанные
        </Button>
      </CardFooter>
    </Card>
  )
}
