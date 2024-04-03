'use server';

import { Permission } from '@/interfaces';
import jwt from 'jsonwebtoken';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { validateSoldier } from './auth';
import { kysely } from './kysely';
import { hasPermission } from './utils';


/*
현재 인증되지 않은 군인의 정보를 가져옵니다.
접근 토큰(cookie로부터)을 확인하여 사용자를 식별합니다.
JWT 토큰을 검증하고, 유효한 경우 해당 군인의 정보를 반환합니다.
*/
export async function unauthenticated_currentSoldier() {
  const accessToken = cookies().get('auth.access_token')?.value;
  if (accessToken == null) {
    return null;
  }
  let jwtPayload;
  try {
    jwtPayload = jwt.verify(accessToken, process.env.JWT_SECRET_KEY!, {
      algorithms: ['HS512'],
    }) as {
      name: string;
      type: string;
      sub: string;
    };
  } catch (e) {
    cookies().delete('auth.access_token');
    return null;
  }
  const soldier = await fetchSoldier(jwtPayload.sub);
  return soldier;
}


/*
현재 인증된 군인의 정보를 가져옵니다.
unauthenticated_currentSoldier 함수를 호출하여 사용자를 인증하고, 인증된 경우 유효성을 검사합니다.
*/
export async function currentSoldier() {
  const soldier = await unauthenticated_currentSoldier();
  await validateSoldier(soldier);
  return soldier!;
}


/*
특정 군인의 정보를 가져옵니다.
군번(sn)을 사용하여 soldiers 테이블에서 해당 군인의 정보를 조회합니다.
사용자의 권한 정보도 함께 가져옵니다.
*/
export const fetchSoldier = cache(async (sn: string) => {
  const data = await kysely
    .selectFrom('soldiers')
    .where('sn', '=', sn)
    .select((eb) => [
      'soldiers.sn',
      'soldiers.name',
      'soldiers.type',
      'soldiers.verified_at',
      'soldiers.deleted_at',
      'soldiers.rejected_at',
      jsonArrayFrom(
        eb
          .selectFrom('permissions')
          .select(['value'])
          .whereRef('permissions.soldiers_id', '=', 'soldiers.sn'),
      ).as('permissions'),
    ])
    .executeTakeFirst();
  return {
    ...data,
    permissions: (data?.permissions ?? []).map(
      ({ value }) => value as Permission,
    ),
  };
});


/*
승인되지 않은 군인 목록을 가져옵니다.
현재 로그인한 군인이 관리자 또는 사용자 관리 권한이 있는지 확인합니다.
verified_at이 null인 군인 목록을 조회합니다.
*/
export async function listUnverifiedSoldiers() {
  const current = await currentSoldier();
  if (
    !hasPermission(current.permissions, ['Admin', 'UserAdmin', 'VerifyUser'])
  ) {
    return { message: '권한이 없습니다', data: null };
  }
  const data = await kysely
    .selectFrom('soldiers')
    .select(['sn', 'name', 'type'])
    .where('verified_at', 'is', null)
    .execute();
  return { message: null, data };
}


/*
특정 군인의 승인 또는 거부를 처리합니다.
현재 로그인한 군인이 관리자 또는 사용자 관리 권한이 있는지 확인합니다.
soldiers 테이블에서 해당 군인의 정보를 업데이트하여 승인 또는 거부 상태를 반영합니다.
*/
export async function verifySoldier(sn: string, value: boolean) {
  try {
    const current = await currentSoldier();
    if (
      !hasPermission(current.permissions, ['Admin', 'UserAdmin', 'VerifyUser'])
    ) {
      return {
        success: false,
        message: '권한이 없습니다',
      };
    }
    await kysely
      .updateTable('soldiers')
      .where('sn', '=', sn)
      .set(
        value
          ? { verified_at: new Date(), rejected_at: null }
          : { rejected_at: new Date(), verified_at: null },
      )
      .executeTakeFirstOrThrow();
    return {
      success: true,
      message: value ? '승인되었습니다' : '반려되었습니다',
    };
  } catch (e) {
    return { success: false, message: '실패하였습니다' };
  }
}


/*
군인 목록을 가져옵니다.
현재 로그인한 군인이 관리자인 경우 모든 군인을, 그렇지 않은 경우 승인된 군인만 조회합니다.
검색 쿼리와 페이지네이션을 지원합니다.
*/
export async function listSoldiers({
  query,
  page,
}: {
  query?: string | null;
  page?: number | null;
}) {
  await currentSoldier();
  const [{ count }, data] = await Promise.all([
    kysely
      .selectFrom('soldiers')
      .select((eb) => eb.fn.count<string>('sn').as('count'))
      .executeTakeFirstOrThrow(),
    kysely
      .selectFrom('soldiers')
      .where((eb) =>
        eb.and([
          eb.or([eb('sn', '=', query ?? ''), eb('name', 'like', `%${query}%`)]),
          eb.or([
            eb('rejected_at', 'is not', null),
            eb('verified_at', 'is not', null),
          ]),
        ]),
      )
      .limit(10)
      .$if(page != null, (qb) => qb.offset(Math.max(1, page!) * 10 - 10))
      .select(['sn', 'name', 'type'])
      .execute(),
  ]);
  return { count: parseInt(count, 10), data };
}


/*
상벌점의 수신자 및 발신자를 검색합니다.
주어진 검색어와 일치하는 군인을 조회하고, 상벌점 관리자 권한을 가진 군인만 발신자로 검색됩니다.
*/
export async function searchPointsReceiver(query: string) {
  return kysely
    .selectFrom('soldiers')
    .where((eb) =>
      eb.and([
        eb('type', '=', 'enlisted'),
        eb.or([
          eb('sn', 'like', `%${query}%`),
          eb('name', 'like', `%${query}%`),
        ]),
        eb.or([
          eb('rejected_at', 'is not', null),
          eb('verified_at', 'is not', null),
        ]),
      ]),
    )
    .select(['sn', 'name'])
    .execute();
}


/*
상벌점의 수신자 및 발신자를 검색합니다.
주어진 검색어와 일치하는 군인을 조회하고, 상벌점 관리자 권한을 가진 군인만 발신자로 검색됩니다.
*/
export async function searchPointsGiver(query: string) {
  return kysely
    .selectFrom('soldiers')
    .where((eb) =>
      eb.and([
        eb('type', '=', 'nco'),
        eb.or([
          eb('sn', 'like', `%${query}%`),
          eb('name', 'like', `%${query}%`),
        ]),
        eb.or([
          eb('rejected_at', 'is not', null),
          eb('verified_at', 'is not', null),
        ]),
        eb.exists(
          eb
            .selectFrom('permissions')
            .whereRef('permissions.soldiers_id', '=', 'soldiers.sn')
            .having('value', 'in', [
              'GiveMeritPoint',
              'GiveLargeMeritPoint',
              'GiveDemeritPoint',
              'GiveLargeDemeritPoint',
              'PointAdmin',
              'Admin',
            ])
            .select('permissions.value')
            .groupBy('permissions.value'),
        ),
      ]),
    )
    .select(['sn', 'name'])
    .execute();
}


/*
특정 군인을 삭제합니다.
현재 로그인한 군인이 관리자이며, 권한이 충분한 경우에만 실행됩니다.
deleted_at을 설정하여 삭제된 군인을 표시합니다.
*/
export async function deleteSoldier({
  sn,
  value,
}: {
  sn: string;
  value: boolean;
}) {
  const { sn: requestSn, permissions } = await currentSoldier();
  if (sn == null) {
    return { message: 'sn(군번) 값이 없습니다' };
  }
  if (value == null) {
    return { message: 'value 값이 없습니다' };
  }
  if (requestSn === sn) {
    return { message: '본인은 삭제할 수 없습니다' };
  }
  const target = await fetchSoldier(sn);
  if (target.permissions.includes('Admin')) {
    return { message: '관리자는 삭제할 수 없습니다' };
  }
  if (!hasPermission(permissions, ['Admin', 'UserAdmin', 'DeleteUser'])) {
    return { message: '유저 삭제 권한이 없습니다' };
  }
  await kysely
    .updateTable('soldiers')
    .where('sn', '=', sn)
    .set({ deleted_at: value ? new Date() : null })
    .executeTakeFirstOrThrow();
  return { message: null };
}
