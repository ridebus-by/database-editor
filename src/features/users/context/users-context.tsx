import React, { useEffect, useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { StaffUser } from '../data/schema'
import { fetchUsers } from '../data/users'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

interface UsersContextType {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: StaffUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StaffUser | null>>
  users: StaffUser[]
  loading: boolean
  error: Error | null
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StaffUser | null>(null)
  const [users, setUsers] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchUsers()
    .then(fetched => setUsers(fetched))
    .catch(err => setError(err))
    .finally(() => setLoading(false))
  }, [])

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow, users, loading, error }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}