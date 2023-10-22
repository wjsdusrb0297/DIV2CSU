import { Permission } from '@/interfaces';
import _ from 'lodash';
import z from 'zod';

export function hasPermission(
  permissions: Permission[],
  requires: Permission[],
) {
  return !!_.intersection(requires, permissions).length;
}

export function sortPermission(permissions: string[]) {
  if (permissions.includes('Admin')) {
    permissions = ['Admin'];
  }
  if (permissions.includes('UserAdmin')) {
    permissions = permissions
      .filter((p) => !p.includes('User'))
      .concat('UserAdmin');
  }
  if (permissions.includes('PointAdmin')) {
    permissions = permissions
      .filter((p) => !p.includes('Point'))
      .concat('PointAdmin');
  }
  return permissions;
}

export function validatePermission(permissions: string[]) {
  const { success } = z.array(Permission).safeParse(permissions);
  return success;
}

export function checkIfSoldierHasPermission(value: number, scope: string[]) {
  if (scope.includes('Admin') || scope.includes('PointAdmin')) {
    return { message: null };
  }
  if (value > 0 && !scope.includes('GiveMeritPoint')) {
    return { message: '상점을 줄 권한이 없습니다' };
  }
  if (value > 5 && !scope.includes('GiveLargeMeritPoint')) {
    return { message: '5점 이상 상점을 줄 권한이 없습니다' };
  }
  if (value < 0 && !scope.includes('GiveDemeritPoint')) {
    return { message: '벌점을 줄 권한이 없습니다' };
  }
  if (value < -5 && !scope.includes('GiveLargeDemeritPoint')) {
    return { message: '5점 이상 벌점을 줄 권한이 없습니다' };
  }
  return { message: null };
}
