import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import RoutesProvider, { useRoutes } from "./context/routes-context";
import { RoutesTable } from "./components/routes-table";
import { routeListSchema } from "./data/schema";
import { columns } from "./components/routes-columns";
import { RoutesPrimaryButtons } from "./components/routes-primary-buttons";
import { RoutesDialogs } from "./components/routes-dialogs";
import { Skeleton } from "@/components/ui/skeleton";
import { IconMoodSad2 } from "@tabler/icons-react";
import { RoutesStats } from "./components/routes-stats";
import { Notifications } from "@/components/notifications";

export default function Routes() {
  return (
    <RoutesProvider>
      <InnerRoutes />
      <RoutesDialogs />
    </RoutesProvider>
  )
}

function InnerRoutes() {
  const { routes, loading, error } = useRoutes()

  const routeList = !loading && !error
    ? routeListSchema.parse(routes)
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
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0'>
          {loading ? (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>

              <div className="rounded-md border border-border">
                <div className="flex items-center border-b border-border p-4">
                  <Skeleton className="h-5 w-32 mr-4" />
                  <Skeleton className="h-5 w-40 mr-4" />
                  <Skeleton className="h-5 w-24 mr-4" />
                  <Skeleton className="h-5 w-20" />
                </div>

                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                    <div className="flex items-center space-x-4 w-full">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-24" />
                      <div className="ml-auto flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-32" />
              </div>
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
            <>
              <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                  <h2 className='text-2xl font-bold tracking-tight'>Routes List</h2>
                  <p className='text-muted-foreground'>
                    Manage your routes here.
                  </p>
                </div>
                <RoutesPrimaryButtons />
              </div>
              <RoutesStats />
              <RoutesTable data={routeList} columns={columns} />
            </>
          )}
        </div>
      </Main>
    </>
  )
}
