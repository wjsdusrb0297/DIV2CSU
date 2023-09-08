'use server';

import { api } from '@/lib/instance';

export async function verifyUser(sn: string, value: boolean) {
  return api.post({ sn, value }, '/soldiers/verify').text();
}
