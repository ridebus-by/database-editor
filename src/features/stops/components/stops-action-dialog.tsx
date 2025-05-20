'use client'

import 'leaflet/dist/leaflet.css'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ref, push, set, get, child } from 'firebase/database'
import { auth, db } from '@/lib/firebase'
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
import { Stop } from '../data/schema'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { SelectDropdown } from '@/components/select-dropdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStops } from '../context/stops-context'

const formSchema = z
    .object({
        name: z.string().min(1, { message: 'Название остановки обязательно.' }),
        cityId: z.coerce.number().int().nonnegative(),
        direction: z.string().optional(),
        kindRouteId: z.coerce.number().int().nonnegative(),
        latitude: z
            .string()
            .min(1, { message: 'Широта обязательна.' })
            .refine((v) => {
                const n = parseFloat(v)
                return !isNaN(n) && n >= -90 && n <= 90
            }, { message: 'Широта должна быть от -90 до 90.' }),
        longitude: z
            .string()
            .min(1, { message: 'Долгота обязательна.' })
            .refine((v) => {
                const n = parseFloat(v)
                return !isNaN(n) && n >= -180 && n <= 180
            }, { message: 'Долгота должна быть от -180 до 180.' }),
        typeId: z.coerce.number().int().nonnegative(),
        isEdit: z.boolean(),
    })

type StopForm = z.infer<typeof formSchema>

interface Props {
    currentRow?: Stop
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface NotificationPayload {
    type: 'route_added' | 'stop_added' | 'schedule_changed' | 'invalid_record' | 'other'
    message: string
    details?: string
    userId: string
    userName: string
    entityId?: string
    entityType?: 'route' | 'stop'
}

export function StopsActionDialog({ currentRow, open, onOpenChange }: Props) {
    const isEdit = !!currentRow
    const { refreshStops } = useStops()
    const [cities, setCities] = useState<{ id: number; name: string }[]>([])
    const [isLoadingCities, setIsLoadingCities] = useState(true)
    const form = useForm<StopForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? {
                name: currentRow!.name,
                cityId: currentRow!.cityId || 0,
                direction: currentRow!.direction ?? '',
                kindRouteId: currentRow!.kindRouteId,
                latitude: currentRow!.latitude ?? '',
                longitude: currentRow!.longitude ?? '',
                typeId: currentRow!.typeId,
                isEdit: true,
            }
            : {
                name: '',
                cityId: 0,
                direction: '',
                kindRouteId: 0,
                latitude: '',
                longitude: '',
                typeId: 0,
                isEdit,
            },
    })

    useEffect(() => {
        setIsLoadingCities(true)
        get(child(ref(db), 'city')).then((snap) => {
            if (snap.exists()) {
                const obj = snap.val() as Record<string, { id?: number; name: string }>
                setCities(
                    Object.values(obj)
                        .filter((c) => typeof c.id === 'number')
                        .map((c) => ({ id: c.id!, name: c.name }))
                        .sort((a, b) => a.name.localeCompare(b.name)) // Сортировка городов по алфавиту
                )
            }
            setIsLoadingCities(false)
        }).catch(() => {
            setIsLoadingCities(false)
        })
    }, [])

    const initialLat = parseFloat(form.getValues('latitude')) || 53.8278
    const initialLng = parseFloat(form.getValues('longitude')) || 27.5410

    function LocationPicker({ initialPosition }: { initialPosition: [number, number] }) {
        const { setValue } = form
        const [pos, setPos] = useState<[number, number]>(initialPosition)
        useMapEvents({
            click(e: { latlng: { lat: any; lng: any } }) {
                const { lat, lng } = e.latlng
                const latFixed = parseFloat(lat.toFixed(6))
                const lngFixed = parseFloat(lng.toFixed(6))
                setPos([latFixed, lngFixed])
                setValue('latitude', latFixed.toString(), { shouldDirty: true })
                setValue('longitude', lngFixed.toString(), { shouldDirty: true })
            },
        })
        return <Marker position={pos} />
    }

    const onSubmit = async (values: StopForm) => {
        const data = {
            ...values,
            cityId: values.cityId,
            kindRouteId: values.kindRouteId,
            latitude: values.latitude,
            longitude: values.longitude,
            direction: values.direction,
            typeId: values.typeId,
        }
        try {
            if (isEdit && currentRow) {
                await set(ref(db, `stops/${currentRow.id}`), { id: currentRow.id, ...data })
            } else {
                const newRef = push(ref(db, 'stops'))
                await set(newRef, { id: newRef.key, ...data })
                const notif: NotificationPayload = {
                    type: 'stop_added',
                    message: `Добавлена новая остановка - ${data.name}`,
                    details: `Направление остановки - ${data.direction}`,
                    userId: auth.currentUser!.uid,
                    userName: auth.currentUser!.displayName || 'Unknown',
                    entityId: newRef.key!,
                    entityType: 'stop',
                }
                await push(ref(db, 'notifications'), {
                    ...notif,
                    timestamp: Date.now(),
                    read: false,
                })
            }
            // Обновляем таблицу после сохранения данных
            await refreshStops()
            form.reset()
            onOpenChange(false)
        } catch (error) {
            console.error('Ошибка при сохранении остановки:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { form.reset(); onOpenChange(v) }}>
            <DialogContent className='sm:max-w-xl'>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Редактировать остановку' : 'Новая остановка'}</DialogTitle>
                    <DialogDescription>Заполните все обязательные поля</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form id='stop-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            name='name'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Экономический колледж' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='cityId'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Город</FormLabel>
                                    <SelectDropdown
                                        placeholder='Выберите город'
                                        defaultValue={String(field.value)}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        items={cities.map((c) => ({ label: c.name, value: String(c.id) }))}
                                        isPending={isLoadingCities}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='direction'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Направление (необязательно)</FormLabel>
                                    <FormControl>
                                        <Input placeholder='на перекрёсток' {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                name='latitude'
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Широта</FormLabel>
                                        <FormControl>
                                            <Input placeholder='53.8278' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name='longitude'
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Долгота</FormLabel>
                                        <FormControl>
                                            <Input placeholder='27.5410' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Card className='col-span-12'>
                            <CardHeader>
                                <CardTitle>Выбор точки на карте</CardTitle>
                            </CardHeader>
                            <CardContent className='h-64 p-0 overflow-hidden'>
                                <MapContainer
                                    className='w-full h-full'
                                    center={[initialLat, initialLng]}
                                    zoom={13}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                                    <LocationPicker initialPosition={[initialLat, initialLng]} />
                                </MapContainer>
                            </CardContent>
                        </Card>
                    </form>
                </Form>

                <DialogFooter>
                    <Button type='submit' form='stop-form'>
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
