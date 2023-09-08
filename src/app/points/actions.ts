'use server';

import { api } from '@/lib/instance';
import {
  FetchTotalPointsData,
  FetchHistoryCountsData,
  FetchPointData,
} from './interfaces';

export async function fetchTotalPoints(sn?: string) {
  return api.query({ sn }).get('/points/total').json<FetchTotalPointsData>();
}

export async function fetchHistoryCounts() {
  return api.get('/points').json<FetchHistoryCountsData>();
}

export async function fetchPoint(pointId: string) {
  return api.query({ id: pointId }).get('/points').json<FetchPointData>();
}

export async function deletePoint(pointId: string) {
  return api.query({ id: pointId }).delete('/points').text();
}

export async function verifyPoint(
  pointId: string,
  value: boolean,
  rejectReason?: string,
) {
  return api
    .post({ id: pointId, value, rejectReason }, '/points/verify')
    .text();
}
