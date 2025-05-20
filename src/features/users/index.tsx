import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider, { useUsers } from './context/users-context'
import { staffListSchema as userListSchema } from './data/schema'
import { Skeleton } from '@/components/ui/skeleton'
import { IconMoodSad2 } from '@tabler/icons-react'
import { Notifications } from '@/components/notifications'

export default function Users() {
  return (
    <UsersProvider>
      <InnerUsers />
      <UsersDialogs />
    </UsersProvider>
  )
}

function InnerUsers() {
  // Parse user list
  const { users, loading, error } = useUsers()

  const userList = !loading && !error
    ? userListSchema.parse(users)
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
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>

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
          <UsersTable data={userList} columns={columns} />
          )}
        </div>
      </Main>
    </>
  )
}