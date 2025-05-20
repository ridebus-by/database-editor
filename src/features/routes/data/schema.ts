import { z } from 'zod'

export const routeSchema = z.object({
  id: z.string(),
  number: z.string(),
  title: z.string(),
  carrierCompany: z.string(),
  description: z.string(),
  following: z.string().optional().default(''),

  fare: z.string(),

  // числовой ID города
  cityId: z.number(),

  // расписания
  departureTimes: z.array(z.string()).optional().default([]),
  weekendDepartureTimes: z.array(z.string()).optional().default([]),

  // интервалы и список остановок
  intervalBetweenStops: z.array(z.number()).optional().default([]),
  stops: z.array(z.string()).optional().default([]),

  // булевые флаги — optional + default(false)
  isCashAccepted: z.boolean().optional().default(false),
  isEcological: z.boolean().optional().default(false),
  isLowFloor: z.boolean().optional().default(false),
  isQRCodeAvailable: z.boolean().optional().default(false),

  // номер маршрута и точность работы
  isWifiAvailable: z.boolean().optional().default(false),

  // внешние связи как строки
  sizeId: z.string().optional().default(''),
  typeId: z.string(),

  // доп. информация
  techInfo: z.string().optional().default(''),
  workingHours: z.string().optional().default(''),
})

export type Route = z.infer<typeof routeSchema>
export const routeListSchema = z.array(routeSchema)