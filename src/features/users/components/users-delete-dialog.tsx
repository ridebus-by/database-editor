'use client'

import { useState, useEffect } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { remove, ref } from 'firebase/database'
import { db } from '@/lib/firebase'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useUsers } from '../context/users-context'

export function UsersDeleteDialog() {
  const { open, setOpen, currentRow } = useUsers()
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!open) setValue('')
  }, [open])

  if (open !== 'delete' || !currentRow) return null

  const handleConfirm = async () => {
    if (value.trim() !== currentRow.username) return
    // удаляем из Firebase
    await remove(ref(db, `staff/${currentRow.id}`))
    setOpen(null)
  }

  return (
    <ConfirmDialog
      open={true}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null)
      }}
      handleConfirm={handleConfirm}
      disabled={value.trim() !== currentRow.username}
      title={
        <span className="text-destructive">
          <IconAlertTriangle size={18} className="stroke-destructive mr-1 inline-block" />
          Delete User
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{' '}
            <span className="font-bold">{currentRow.username}</span>?
            <br />This action cannot be undone.
          </p>
          <Label className="my-2">
            Type username to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Username"
            />
          </Label>
          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This operation is irreversible.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  )
}
