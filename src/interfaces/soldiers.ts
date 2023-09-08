import { Permission } from './permissions';

export type Soldier = {
  sn: string;
  name: string;
  type: 'enlisted' | 'nco';
  verified_at: string | null;
  rejected_at: string | null;
  deleted_at: string | null;
  permissions: { value: Permission }[];
};
