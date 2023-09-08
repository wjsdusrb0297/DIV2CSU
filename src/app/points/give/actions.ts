'use server';

import { fetchUserFromJwt } from '@/app/actions';
import { api } from '@/lib/instance';
import { redirect } from 'next/navigation';

export async function checkIfNco() {
  const data = await fetchUserFromJwt();
  if (data?.type === 'enlisted') {
    redirect('/points/request');
  }
}

export async function searchPossiblePointsReceiver(query: string) {
  return api
    .query({ query, type: 'enlisted', autoComplete: true })
    .get('/soldiers/search')
    .json();
}

export async function givePoint(data: any) {
  return api.post(data, '/points').json();
}
