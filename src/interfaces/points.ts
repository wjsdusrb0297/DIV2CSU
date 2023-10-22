import z from 'zod';

export const Point = z.object({
  id: z.string().uuid(),
  giver_id: z.string(),
  receiver_id: z.string(),
  created_at: z.date(),
  verified_at: z.date().nullable(),
  value: z.number(),
  reason: z.string(),
  given_at: z.date(),
  rejected_at: z.date().nullable(),
  rejected_reason: z.string(),
});

export type Point = z.infer<typeof Point>;
