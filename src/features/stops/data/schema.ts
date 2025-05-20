import { z } from 'zod'

export const stopSchema = z.object({
    cityId: z.number().optional(),
    direction: z.string(),
    id: z.string(),
    kindRouteId: z.number(),
    latitude: z.string(),
    longitude: z.string(),
    name: z.string(),
    typeId: z.number(),
})
export type Stop = z.infer<typeof stopSchema>
export const stopListSchema = z.array(stopSchema)
