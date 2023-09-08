'use server';

import { api } from '@/lib/instance';

export async function searchPossiblePointsGiver(query: string) {
  return api
    .query({ query, autoComplete: true })
    .get('/soldiers/search')
    .json();
}

export async function requestPoint(data: any) {
  return api.post(data, '/points').json();
}
