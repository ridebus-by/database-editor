import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TotalMileageCard } from './components/total-mileage-card'
import { TotalRoutesCard } from './components/total-routes-card'
import { AverageStopsCard } from './components/average-stops-card'
import { ApiLatencyCard } from './components/api-latency-card'
import { FirebaseErrorsCard } from './components/firebase-errors-card'
import { OperatorsActivityCard } from './components/operators-activity-chart'
import { TypeDistributionCard } from './components/type-distribution-card'
import { DataValidationErrorsCard } from './components/data-validation-errors-card'
import { DataQualityCard } from './components/data-quality-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Notifications } from '@/components/notifications'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <Notifications />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Панель управления</h1>
            <p className="text-muted-foreground mt-1">Обзор системы общественного транспорта</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
              Добавить виджет
            </Button>
            <Button variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Экспорт
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-8'>
          <ScrollArea className="w-full">
            <div className="flex w-max min-w-full">
              <TabsList>
                <TabsTrigger 
                  value='overview'
                >
                  Обзор
                </TabsTrigger>
                <TabsTrigger 
                  value='health'
                >
                  Состояние системы
                </TabsTrigger>
                <TabsTrigger 
                  value='team'
                >
                  Команда
                </TabsTrigger>
              </TabsList>
            </div>
          </ScrollArea>
          
          <TabsContent value='overview' className='space-y-8 animate-in fade-in-50'>
            {/* Ключевые метрики */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Ключевые метрики</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <path d="M3 6h18" />
                    <path d="M3 12h18" />
                    <path d="M3 18h18" />
                  </svg>
                  Настроить
                </Button>
              </div>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <TotalMileageCard />
                <TotalRoutesCard />
                <AverageStopsCard />
                <OperatorsActivityCard />
              </div>
            </section>
            
            {/* Аналитика */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Аналитика</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 7h.01" />
                    <path d="M17 7h.01" />
                    <path d="M7 17h.01" />
                    <path d="M17 17h.01" />
                  </svg>
                  Подробнее
                </Button>
              </div>
              <div className='grid gap-6'>
                <TypeDistributionCard />
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <OperatorsActivityCard />
                  <Card className="sm:col-span-1 lg:col-span-2 overflow-hidden group hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                            Активность операторов
                          </CardTitle>
                          <CardDescription>
                            Статистика за последние 24 часа
                          </CardDescription>
                        </div>
                        <div className="text-muted-foreground group-hover:text-primary/80 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        <p>График активности операторов</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
            
            {/* Состояние системы */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Мониторинг</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                  Обновить
                </Button>
              </div>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <FirebaseErrorsCard />
                <DataValidationErrorsCard />
                <DataQualityCard />
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value='health' className='space-y-8 animate-in fade-in-50'>
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Производительность API</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                  Диагностика
                </Button>
              </div>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <ApiLatencyCard />
                <FirebaseErrorsCard />
              </div>
            </section>
            
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Качество данных</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-6" />
                    <path d="M8 18v-1" />
                    <path d="M16 18v-3" />
                  </svg>
                  Отчет
                </Button>
              </div>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <DataValidationErrorsCard />
                <DataQualityCard />
                <Card className="overflow-hidden group hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                          Полнота данных
                        </CardTitle>
                        <CardDescription>
                          Оценка заполненности полей
                        </CardDescription>
                      </div>
                      <div className="text-muted-foreground group-hover:text-primary/80 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[150px] flex items-center justify-center text-muted-foreground">
                      <p>График полноты данных</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
            
            
          </TabsContent>
          
          <TabsContent value='team' className='space-y-8 animate-in fade-in-50'>
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Активность команды</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Управление
                </Button>
              </div>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <OperatorsActivityCard />
                <Card className="sm:col-span-1 lg:col-span-2 overflow-hidden group hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                          Статистика по операторам
                        </CardTitle>
                        <CardDescription>
                          Активность за последние 7 дней
                        </CardDescription>
                      </div>
                      <div className="text-muted-foreground group-hover:text-primary/80 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M8 12h8" />
                          <path d="M12 8v8" />
                        </svg>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      <p>Таблица активности операторов</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Обзор',
    href: 'dashboard/overview',
    isActive: true,
    disabled: true,
  },
  {
    title: 'Маршруты',
    href: 'dashboard/routes',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Остановки',
    href: 'dashboard/stops',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Настройки',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]
