'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ref, push, set } from 'firebase/database'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StaffUser } from '../data/schema'
import { showSubmittedData } from '@/utils/show-submitted-data'


// Форма только для полей, существующих в StaffUser
const formSchema = z.object({
    username: z.string().min(1, { message: 'Username is required.' }),
    iconUrl: z.string().url({ message: 'Icon URL must be valid.' }),
    profileUrl: z.string().url({ message: 'Profile URL must be valid.' }),
    isEdit: z.boolean()
})

type UserForm = z.infer<typeof formSchema>

interface Props {
    currentRow?: StaffUser
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
    const isEdit = !!currentRow
    const form = useForm<UserForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
        }
      : {
          username: '',
          iconUrl: '',
          profileUrl: '',
          isEdit,
        },
  })

    const onSubmit = async (values: UserForm) => {
        try {
            if (isEdit && currentRow) {
                await set(ref(db, `staff/${currentRow.id}`), {
                    ...currentRow,
                    ...values,
                })
            } else {
                const newRef = push(ref(db, 'staff'))
                await set(newRef, {
                    id: newRef.key,
                    firebaseUid: newRef.key,
                    ...values,
                })
            }
            form.reset()
            showSubmittedData(values)
            onOpenChange(false)
        } catch (error) {
            console.error('Firebase write error:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(state) => { form.reset(); onOpenChange(state) }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the user here. ' : 'Create new user here. '}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="username" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="username" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="iconUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Avatar URL</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="profileUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profile URL</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="https://..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </form>
                </Form>
                <DialogFooter>
                    <Button type="submit" form="user-form">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
