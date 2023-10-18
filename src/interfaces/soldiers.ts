import z from 'zod';
import { Permission } from './permissions';

export const Soldier = z.object({
  sn: z
    .string()
    .trim()
    .regex(/^\d{2}-\d{5,8}$/, { message: '잘못된 형식의 군번입니다' }),
  password: z
    .string()
    .trim()
    .min(1, { message: '비밀번호는 최소 1자리 입니다.' })
    .max(30, { message: '비밀번호는 최대 30자리 입니다.' }),
  type: z.enum(['enlisted', 'nco']),
  name: z
    .string()
    .trim()
    .min(1, { message: '이름은 최소 1자리 입니다.' })
    .max(5, { message: '이름은 최대 5자리 입니다.' }),
  verified_at: z.date().nullable(),
  rejected_at: z.date().nullable(),
  deleted_at: z.date().nullable(),
  permissions: z.array(Permission),
});

export type Soldier = z.infer<typeof Soldier>;
