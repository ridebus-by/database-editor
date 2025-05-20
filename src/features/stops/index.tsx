import { Header } from "@/components/layout/header";
import StopsProvider, { useStops } from "./context/stops-context";
import { stopListSchema } from "./data/schema";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Main } from "@/components/layout/main";
import { Skeleton } from "@/components/ui/skeleton";
import { IconMoodSad2 } from "@tabler/icons-react";
import { StopsTable } from "./components/stops-table";
import { columns } from "./components/stops-columns";
import { StopsPrimaryButtons } from "./components/stops-primary-buttons";
import { StopsDialogs } from "./components/stops-dialogs";
import { StopsStats } from "./components/stops-stats";
import { Notifications } from "@/components/notifications";

export default function Stops() {
  return (
    <StopsProvider>
      <InnerStops />
      <StopsDialogs />
    </StopsProvider>
  )
}

function InnerStops() {
  const { stops, loading, error } = useStops()

  const stopList = !loading && !error
    ? stopListSchema.parse(stops)
    : []

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <Notifications />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Список остановок</h2>
            <p className='text-muted-foreground'>
              Управление остановками общественного транспорта
            </p>
          </div>
          <StopsPrimaryButtons />
        </div>
        
        {/* Статистика по остановкам */}
        <StopsStats />
        
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {loading ? (
            <div className="w-full space-y-2">
              <Skeleton className="h-8 w-1/3" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
          <div className='h-svh'>
            <div className='m-auto flex h-150 w-full flex-col items-center justify-center gap-2'>
              <IconMoodSad2 size={72} />
              <span className='text-4xl leading-tight font-bold'>Произошла ошибка</span>
              <p className='text-muted-foreground text-center'>
                {error.message} <br />
                Обратитесь к администратору для решения проблемы
              </p>
            </div>
          </div>
          ) : (
          <StopsTable data={stopList} columns={columns} />
          )}
        </div>
      </Main>
    </>
  )
}
