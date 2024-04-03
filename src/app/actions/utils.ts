import { Permission } from '@/interfaces';
import _ from 'lodash';
import z from 'zod';


/*
permissions 배열에 특정 권한(requires 배열에 있는 값)이 포함되어 있는지 확인합니다.
lodash 라이브러리의 intersection 함수를 사용하여 두 배열 간의 교집합을 찾습니다.
만약 권한이 존재하면 true를 반환하고, 그렇지 않으면 false를 반환합니다.
*/
export function hasPermission(
  permissions: Permission[],
  requires: Permission[],
) {
  return !!_.intersection(requires, permissions).length;
}


/*
권한 배열을 정렬합니다.
만약 'Admin' 권한이 포함되어 있다면, 'Admin'으로만 배열을 대체합니다.
'UserAdmin' 권한이 포함되어 있다면, 'UserAdmin'을 끌어올리고 다른 'User'로 시작하는 권한은 제거합니다.
'PointAdmin' 권한이 포함되어 있다면, 'PointAdmin'을 끌어올리고 다른 'Point'로 시작하는 권한은 제거합니다.
정렬된 배열을 반환합니다.
*/
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


/*
주어진 권한 배열이 유효한지 확인합니다.
zod 스키마를 사용하여 Permission 타입의 배열인지 검사하고, 유효한 경우 true를 반환합니다.
*/
export function validatePermission(permissions: string[]) {
  const { success } = z.array(Permission).safeParse(permissions);
  return success;
}


/*
군인이 특정 점수를 부여할 권한이 있는지 확인합니다.
'Admin' 또는 'PointAdmin' 권한이 있는 경우 모든 권한이 허용됩니다.
양수 점수를 부여할 경우, 'GiveMeritPoint' 권한이 있는지 확인하고 없는 경우 메시지를 반환합니다.
음수 점수를 부여할 경우, 'GiveDemeritPoint' 권한이 있는지 확인하고 없는 경우 메시지를 반환합니다.
특정 범위 이상의 점수를 부여할 경우, 해당하는 큰 권한('GiveLargeMeritPoint', 'GiveLargeDemeritPoint')이 있는지 확인하고 없는 경우 메시지를 반환합니다.
권한 여부에 따라 메시지와 함께 객체를 반환합니다.
*/
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
