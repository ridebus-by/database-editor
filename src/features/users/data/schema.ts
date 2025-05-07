import { z } from 'zod'

export const staffUserSchema = z.object({
  id: z.string(),
  firebaseUid: z.string(),
  iconUrl: z.string().url(),
  profileUrl: z.string().url(),
  username: z.string(),
})
export type StaffUser = z.infer<typeof staffUserSchema>
export const staffListSchema = z.array(staffUserSchema)