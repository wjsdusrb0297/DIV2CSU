import { Point } from '@/interfaces';

export type FetchTotalPointsData = {
  verifiedPoint: string;
  unverifiedPoint: string;
};

export type FetchHistoryCountsData = {
  count: string;
};

export type FetchPointData = Point & {
  giver: string | null;
  receiver: string | null;
};
