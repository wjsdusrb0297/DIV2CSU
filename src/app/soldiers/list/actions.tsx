'use server';

import { api } from '@/lib/instance';

type Data = { sn: string; name: string; type: string };

export async function fetchAllSoldiers(query: string, page: number) {
  return api
    .query({ query, count: true, page })
    .get('/soldiers/search')
    .json<[Data[], { count: string }]>();
}
