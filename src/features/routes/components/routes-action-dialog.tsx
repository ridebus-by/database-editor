import { z } from "zod";
import { Route } from "../data/schema";
import { useRoutes } from "../context/routes-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { child, get, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { SelectDropdown } from "@/components/select-dropdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const formSchema = z
    .object({
        number: z.string().min(1, { message: 'Номер маршрута обязателен.' }),
        title: z.string().min(1, { message: 'Название обязательно.' }),
        carrierCompany: z
            .string()
            .min(1, { message: 'Перевозчик обязателен.' }),
        description: z
            .string()
            .min(1, { message: 'Описание обязательно.' }),
        following: z
            .string()
            .min(1, { message: 'Маршрут следования обязателен.' }),
        fare: z.string().min(1, { message: 'Тариф обязателен.' }),
        cityId: z.string().min(1, { message: 'Город обязателен.' }),
        sizeId: z.string().min(1, { message: 'Размер обязателен.' }),
        typeId: z.string().min(1, { message: 'Тип транспорта обязателен.' }),
        stops: z
            .array(z.string())
            .min(1, { message: 'Нужно выбрать хотя бы одну остановку.' }),
        departureTimes: z.string().refine(
            (val) => {
                if (!val) return true;
                const times = val.split(', ');
                return times.every(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time));
            },
            { message: 'Время должно быть в формате ЧЧ:ММ, разделенное запятой и пробелом' }
        ),
        weekendDepartureTimes: z.string().refine(
            (val) => {
                if (!val) return true;
                const times = val.split(', ');
                return times.every(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time));
            },
            { message: 'Время должно быть в формате ЧЧ:ММ, разделенное запятой и пробелом' }
        ),
        intervalBetweenStops: z.string().refine(
            (val) => {
                if (!val) return true;
                const intervals = val.split(', ');
                return intervals.every(interval => !isNaN(Number(interval)));
            },
            { message: 'Интервалы должны быть числами, разделенными запятой и пробелом' }
        ),
        isCashAccepted: z.boolean().default(true),
        isEcological: z.boolean().default(false),
        isLowFloor: z.boolean().default(false),
        isQRCodeAvailable: z.boolean().default(false),
        isWifiAvailable: z.boolean().default(false),
        techInfo: z.string().optional(),
        workingHours: z.string().optional(),
        isEdit: z.boolean(),
    })

type RouteForm = z.infer<typeof formSchema>

interface Props {
    currentRow?: Route
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Вспомогательная функция для преобразования массива в строку с разделителями
function arrayToString(arr: string[] | number[] | undefined): string {
    if (!arr || arr.length === 0) return '';
    return arr.join(', ');
}

// Вспомогательная функция для преобразования строки в массив
function stringToArray<T extends string | number>(str: string, type: 'string' | 'number'): T[] {
    if (!str) return [] as T[];
    const arr = str.split(', ').filter(item => item.trim() !== '');
    return type === 'number' 
        ? arr.map(item => Number(item)) as T[]
        : arr as T[];
}

function StopsSelectorDialog({
    open,
    stopsOptions,
    selected,
    onChange,
    onClose,
}: {
    open: boolean
    stopsOptions: { id: string; name: string; direction: string }[]
    selected: string[]
    onChange: (ids: string[]) => void
    onClose: () => void
}) {
    const [local, setLocal] = useState<string[]>(selected)

    useEffect(() => {
        setLocal(selected)
    }, [selected])

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Выберите остановки</DialogTitle>
                    <DialogDescription>Отметьте все остановки, которые входят в маршрут</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stopsOptions.map((stop) => (
                        <div key={stop.id} className="flex items-center">
                            <Checkbox
                                checked={local.includes(stop.id)}
                                onCheckedChange={(c) => {
                                    setLocal((prev) =>
                                        c
                                            ? [...prev, stop.id]
                                            : prev.filter((id) => id !== stop.id)
                                    )
                                }}
                            />
                            <span className="ml-2">{stop.name} - {stop.direction}</span>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => {
                            onChange(local)
                            onClose()
                        }}
                    >
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function RoutesActionDialog({ currentRow, open, onOpenChange }: Props) {
    const isEdit = Boolean(currentRow)
    const isMobile = useIsMobile()
    const [activeTab, setActiveTab] = useState("basic")

    const [cities, setCities] = useState<{ id: string; name: string }[]>([])
    const [sizes, setSizes] = useState<{ id: string; name: string }[]>([])
    const [types, setTypes] = useState<{ id: string; name: string }[]>([])
    const [stopsOptions, setStopsOptions] = useState<{ id: string; name: string; direction: string }[]>([])
    const [stopsDialog, setStopsDialog] = useState(false)

    const form = useForm<RouteForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? {
                // строковые поля
                number: currentRow!.number,
                title: currentRow!.title,
                carrierCompany: currentRow!.carrierCompany,
                description: currentRow!.description,
                following: currentRow!.following || '',
                fare: currentRow!.fare,

                // селекты — строки
                cityId: String(currentRow!.cityId),
                sizeId: currentRow!.sizeId,
                typeId: currentRow!.typeId,
                stops: currentRow!.stops,

                // расписания и интервалы (преобразуем массивы в строки)
                departureTimes: arrayToString(currentRow!.departureTimes),
                weekendDepartureTimes: arrayToString(currentRow!.weekendDepartureTimes),
                intervalBetweenStops: arrayToString(currentRow!.intervalBetweenStops),

                // булевые флаги
                isCashAccepted: currentRow!.isCashAccepted || false,
                isEcological: currentRow!.isEcological || false,
                isLowFloor: currentRow!.isLowFloor || false,
                isQRCodeAvailable: currentRow!.isQRCodeAvailable || false,
                isWifiAvailable: currentRow!.isWifiAvailable || false,

                // дополнительная информация
                techInfo: currentRow!.techInfo || '',
                workingHours: currentRow!.workingHours || '',
                
                isEdit: true,
            }
            : {
                number: '',
                title: '',
                carrierCompany: '',
                description: '',
                following: '',
                fare: '',
                cityId: '',
                sizeId: '',
                typeId: '',
                stops: [],
                departureTimes: '',
                weekendDepartureTimes: '',
                intervalBetweenStops: '',
                isCashAccepted: true,
                isEcological: false,
                isLowFloor: false,
                isQRCodeAvailable: false,
                isWifiAvailable: false,
                techInfo: '',
                workingHours: '',
                isEdit: false,
            },
    })

    useEffect(() => {
        async function loadList(node: string, setter: any) {
            const snap = await get(child(ref(db), node))
            if (!snap.exists()) return
            const obj = snap.val() as Record<string, any>
            setter(
                Object.values(obj).map((v: any) => ({
                    id: v.id ?? v.key,
                    name: v.name ?? v.title ?? v.number,
                    direction: v.direction
                }))
            )
        }
        loadList('city', setCities)
        loadList('sizes', setSizes)
        loadList('types', setTypes)
        loadList('stops', setStopsOptions)
    }, [])

    const { addRoute, updateRoute } = useRoutes()

    const onSubmit = async (values: RouteForm) => {
        try {
            const routeData = {
                ...values,
                // Преобразуем строки в массивы
                departureTimes: stringToArray<string>(values.departureTimes, 'string'),
                weekendDepartureTimes: stringToArray<string>(values.weekendDepartureTimes, 'string'),
                intervalBetweenStops: stringToArray<number>(values.intervalBetweenStops, 'number'),
                
                // Преобразуем cityId из строки в число
                cityId: Number(values.cityId)
            };
            
            if (isEdit && currentRow) {
                await updateRoute(currentRow.id, routeData)
            } else {
                await addRoute(routeData as Omit<Route, "id">)
            }
            form.reset()
            onOpenChange(false)
        } catch (error) {
            console.error("Ошибка при сохранении маршрута:", error)
            // Можно добавить отображение ошибки пользователю
        }
    }

    // Функция для отображения содержимого вкладки
    const renderTabContent = () => {
        switch (activeTab) {
            case "basic":
                return (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                {/* Номер и название маршрута */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="number" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Номер маршрута</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="1" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="title" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Название</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Швейная фабрика - Богатырская" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                
                                {/* Перевозчик */}
                                <FormField name="carrierCompany" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Перевозчик</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="ОАО Витебскоблавтотранс" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                {/* Описание и маршрут следования */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="description" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Описание</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Краткое описание маршрута" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="following" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Маршрут следования</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Через какие улицы проходит" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                
                                {/* Тариф */}
                                <FormField name="fare" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Тариф</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="0.80" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                {/* Справочники */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField name="cityId" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Город</FormLabel>
                                            <SelectDropdown
                                                placeholder="Выберите город"
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                items={cities.map((c) => ({ label: c.name, value: String(c.id) }))}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="sizeId" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Размер маршрута</FormLabel>
                                            <SelectDropdown
                                                placeholder="Выберите размер"
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                items={sizes.map((c) => ({ label: c.name, value: c.id }))}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="typeId" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Тип транспорта</FormLabel>
                                            <SelectDropdown
                                                placeholder="Выберите тип"
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                items={types.map((c) => ({ label: c.name, value: c.id }))}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                
                                {/* Остановки */}
                                <FormField name="stops" control={form.control} render={() => (
                                    <FormItem>
                                        <FormLabel>Остановки</FormLabel>
                                        <div className="flex items-center space-x-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => setStopsDialog(true)}>
                                                Выбрать остановки ({form.watch('stops').length})
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    </div>
                );
            case "schedule":
                return (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <FormField name="departureTimes" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Время отправления (будни)</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                {...field} 
                                                placeholder="05:20, 06:30, 07:30, 08:00, 09:05" 
                                                className="min-h-[100px]"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Введите время в формате ЧЧ:ММ, разделяя значения запятой и пробелом
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                <FormField name="weekendDepartureTimes" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Время отправления (выходные)</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                {...field} 
                                                placeholder="06:05, 07:06, 08:10, 09:12, 10:10" 
                                                className="min-h-[100px]"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Введите время в формате ЧЧ:ММ, разделяя значения запятой и пробелом
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                <FormField name="intervalBetweenStops" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Интервалы между остановками (в минутах)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                placeholder="0, 2, 5, 7, 9, 11, 13, 15, 17, 19" 
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Введите числа, разделяя значения запятой и пробелом
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                
                                <FormField name="workingHours" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Часы работы</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="05:00-23:00" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    </div>
                );
            case "features":
                return (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="isCashAccepted" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Наличная оплата</FormLabel>
                                                <FormDescription>
                                                    Принимается ли оплата наличными
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                    
                                    <FormField name="isQRCodeAvailable" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Оплата по QR-коду</FormLabel>
                                                <FormDescription>
                                                    Доступна ли оплата по QR-коду
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="isLowFloor" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Низкопольный транспорт</FormLabel>
                                                <FormDescription>
                                                    Используется ли низкопольный транспорт
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                    
                                    <FormField name="isEcological" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Экологичный транспорт</FormLabel>
                                                <FormDescription>
                                                    Используется ли экологичный транспорт
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                                
                                <FormField name="isWifiAvailable" control={form.control} render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Wi-Fi</FormLabel>
                                            <FormDescription>
                                                Доступен ли Wi-Fi в транспорте
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    </div>
                );
            case "additional":
                return (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <FormField name="techInfo" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Техническая информация</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                {...field} 
                                                placeholder="Дополнительная техническая информация о маршруте" 
                                                className="min-h-[150px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => { form.reset(); onOpenChange(v) }}>
                <DialogContent className={`${isMobile ? 'max-w-full' : 'sm:max-w-4xl'} max-h-[90vh] overflow-hidden`}>
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Редактировать маршрут' : 'Новый маршрут'}</DialogTitle>
                        <DialogDescription>Заполните все поля</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form id="route-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[calc(90vh-10rem)] overflow-y-auto">
                            {isMobile ? (
                                <div className="mb-4">
                                    <Select value={activeTab} onValueChange={setActiveTab}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выберите раздел" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="basic">Основная информация</SelectItem>
                                            <SelectItem value="schedule">Расписание</SelectItem>
                                            <SelectItem value="features">Особенности</SelectItem>
                                            <SelectItem value="additional">Дополнительно</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
                                        <TabsTrigger value="basic">
                                            Основная информация
                                        </TabsTrigger>
                                        <TabsTrigger value="schedule">
                                            Расписание
                                        </TabsTrigger>
                                        <TabsTrigger value="features">
                                            Особенности
                                        </TabsTrigger>
                                        <TabsTrigger value="additional">
                                            Дополнительно
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            )}
                            
                            {renderTabContent()}
                        </form>
                    </Form>
                    <DialogFooter>
                        <Button type="submit" form="route-form">
                            Сохранить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Внешний диалог выбора остановок */}
            <StopsSelectorDialog
                open={stopsDialog}
                stopsOptions={stopsOptions}
                selected={form.getValues('stops')}
                onChange={(ids) => form.setValue('stops', ids, { shouldDirty: true })}
                onClose={() => setStopsDialog(false)}
            />
        </>
    )
}
