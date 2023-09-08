export type Point = {
  id: string;
  giver_id: string;
  receiver_id: string;
  created_at: string;
  verified_at: string | null;
  rejected_at: string | null;
  rejected_reason: string | null;
  value: number;
  reason: string;
  used_id: string | null;
  given_at: string;
};
