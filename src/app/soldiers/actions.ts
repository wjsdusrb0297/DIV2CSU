'use server';

import { Permission, Soldier } from '@/interfaces';
import { api } from '@/lib/instance';

export async function fetchSoldier(sn: string) {
  return api.query({ sn }).get('/soldiers').json<Soldier>();
}

export async function updatePassword(password: string, newPassword: string) {
  return api.post({ password, newPassword }, '/auth/updatePassword').text();
}

export async function resetPassword(sn: string) {
  return api.post({ sn }, '/auth/resetPassword').json<{ password: string }>();
}

export async function deleteUser(sn: string, value: boolean) {
  return api.query({ sn, value }).delete('/soldiers').text();
}

export async function updatePermission(sn: string, permissions: Permission[]) {
  return api
    .put({ sn, permissions: JSON.stringify(permissions) }, '/soldiers')
    .text();
}
