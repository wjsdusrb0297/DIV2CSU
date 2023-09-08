'use server';

import { Permission, Soldier } from '@/interfaces';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function fetchUserFromJwt() {
  const accessToken = cookies().get('auth.access_token')?.value;
  if (accessToken == null) {
    return null;
  }
  const data = jwt.verify(accessToken, process.env.JWT_SECRET_KEY!, {
    algorithms: ['HS512'],
  });
  return data as unknown as Pick<Soldier, 'type' | 'name'> & {
    sub: string;
    verified: boolean;
    deleted: boolean;
    scope: Permission[];
  };
}
