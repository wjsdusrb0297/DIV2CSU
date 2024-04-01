'use server';

import { sql } from 'kysely';
import { kysely } from './kysely';
import { currentSoldier, fetchSoldier } from './soldiers';
import { checkIfSoldierHasPermission, hasPermission } from './utils';


/*
특정 상벌점의 세부 정보를 가져옵니다.
points 테이블에서 id를 사용하여 해당 상벌점을 검색합니다.
상벌점을 주고 받은 군인의 이름을 가져오기 위해 soldiers 테이블과 조인합니다.
*/
export async function fetchPoint(pointId: number) {
  return kysely
    .selectFrom('points')
    .where('id', '=', pointId)
    .leftJoin('soldiers as g', 'g.sn', 'points.giver_id')
    .leftJoin('soldiers as r', 'r.sn', 'points.receiver_id')
    .selectAll(['points'])
    .select(['r.name as receiver', 'g.name as giver'])
    .executeTakeFirst();
}


/*
특정 사용자에 대한 상벌점 목록을 가져옵니다.
사용자의 유형에 따라 receiver_id 또는 giver_id를 사용하여 해당 사용자가 받은 또는 준 상벌점을 검색합니다.
페이지네이션을 지원하며, 기본적으로 첫 번째 페이지를 반환합니다.
*/
export async function listPoints(sn: string, page: number = 0) {
  const { type } = await kysely
    .selectFrom('soldiers')
    .where('sn', '=', sn)
    .select('type')
    .executeTakeFirstOrThrow();
  const query = kysely
    .selectFrom('points')
    .where(type === 'enlisted' ? 'receiver_id' : 'giver_id', '=', sn);

  const [data, { count }, usedPoints] = await Promise.all([
    query
      .orderBy('created_at desc')
      .select(['id'])
      .limit(20)
      .offset(Math.min(0, page) * 20)
      .execute(),
    query
      .select((eb) => eb.fn.count<string>('id').as('count'))
      .executeTakeFirstOrThrow(),
    type === 'enlisted' &&
      kysely
        .selectFrom('used_points')
        .where('user_id', '=', sn)
        .leftJoin('soldiers', 'soldiers.sn', 'used_points.recorded_by')
        .select('soldiers.name as recorded_by')
        .selectAll(['used_points'])
        .execute(),
  ]);
  return { data, count: parseInt(count, 10), usedPoints: usedPoints || null };
}


/*
현재 로그인한 군인이 주는 상벌점 중에서 아직 검토되지 않은 상벌점 목록을 가져옵니다.
로그인한 군인의 군번(sn)을 기준으로 검색합니다.
*/
export async function fetchPendingPoints() {
  const { sn } = await currentSoldier();
  return kysely
    .selectFrom('points')
    .where('giver_id', '=', sn!)
    .where('verified_at', 'is', null)
    .selectAll()
    .execute();
}


/*
특정 상벌점을 삭제합니다.
해당 상벌점의 소유자에 대한 확인 및 권한 검사를 수행합니다.
*/
export async function deletePoint(pointId: number) {
  const { type, sn } = await currentSoldier();
  if (type === 'nco') {
    return { message: '간부는 상벌점을 지울 수 없습니다' };
  }
  const data = await fetchPoint(pointId);
  if (data == null) {
    return { message: '상벌점이 존재하지 않습니다' };
  }
  if (data.receiver_id !== sn) {
    return { message: '본인 상벌점만 삭제 할 수 있습니다' };
  }
  if (data.verified_at || data.rejected_at || data.rejected_reason) {
    return { message: '이미 수락, 반려, 사용한 상벌점은 지울 수 없습니다' };
  }
  try {
    await kysely
      .deleteFrom('points')
      .where('id', '=', pointId)
      .executeTakeFirstOrThrow();
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
  return { message: null };
}


/*
특정 상벌점의 검토를 승인하거나 거부합니다.
군인이 자신에게 주어진 상벌점을 확인하고, 승인 또는 거부할 수 있습니다.
*/
export async function verifyPoint(
  pointId: number,
  value: boolean,
  rejectReason?: string,
) {
  const [point, current] = await Promise.all([
    fetchPoint(pointId),
    currentSoldier(),
  ]);
  if (point == null) {
    return { message: '본 상벌점이 존재하지 않습니다' };
  }
  if (point.giver_id !== current.sn) {
    return { message: '본인한테 요청된 상벌점만 승인/반려 할 수 있십니다' };
  }
  if (current.type === 'enlisted') {
    return { message: '용사는 상벌점을 승인/반려 할 수 없습니다' };
  }
  if (!value && rejectReason == null) {
    return { message: '반려 사유를 입력해주세요' };
  }
  if (value) {
    const { message } = checkIfSoldierHasPermission(
      point.value,
      current.permissions,
    );
    if (message) {
      return { message };
    }
  }
  try {
    await kysely
      .updateTable('points')
      .where('id', '=', pointId)
      .set({
        verified_at: value ? new Date() : null,
        rejected_at: !value ? new Date() : null,
        rejected_reason: rejectReason,
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '승인/반려에 실패하였습니다' };
  }
}


/*
특정 사용자에 대한 상벌점 요약 정보를 가져옵니다.
사용자가 받은 상점, 받은 벌점 및 사용한 상점의 총계를 계산합니다.
*/
export async function fetchPointSummary(sn: string) {
  const pointsQuery = kysely.selectFrom('points').where('receiver_id', '=', sn);
  const usedPointsQuery = kysely
    .selectFrom('used_points')
    .where('user_id', '=', sn);
  const [meritData, demeritData, usedMeritData] = await Promise.all([
    pointsQuery
      .where('value', '>', 0)
      .select((eb) => eb.fn.sum<string>('value').as('value'))
      .executeTakeFirst(),
    pointsQuery
      .where('value', '<', 0)
      .select((eb) => eb.fn.sum<string>('value').as('value'))
      .executeTakeFirst(),
    usedPointsQuery
      .where('value', '>', 0)
      .select((eb) => eb.fn.sum<string>('value').as('value'))
      .executeTakeFirst(),
  ]);
  return {
    merit: parseInt(meritData?.value ?? '0', 10),
    demerit: parseInt(demeritData?.value ?? '0', 10),
    usedMerit: parseInt(usedMeritData?.value ?? '0', 10),
  };
}


/*
새로운 상벌점을 만듭니다.
주는 사람과 받는 사람에 대한 확인 및 권한 검사를 수행합니다.
*/
export async function createPoint({
  value,
  giverId,
  receiverId,
  reason,
  givenAt,
}: {
  value: number;
  giverId?: string | null;
  receiverId?: string | null;
  reason: string;
  givenAt: Date;
}) {
  if (reason.trim() === '') {
    return { message: '상벌점 수여 이유를 작성해주세요' };
  }
  if (value !== Math.round(value)) {
    return { message: '상벌점은 정수여야 합니다' };
  }
  if (value === 0) {
    return { message: '1점 이상이거나 -1점 미만이어야합니다' };
  }
  const { type, sn, permissions } = await currentSoldier();
  if (
    (type === 'enlisted' && giverId == null) ||
    (type === 'nco' && receiverId == null)
  ) {
    return { message: '대상을 입력해주세요' };
  }
  const target = await fetchSoldier(
    type === 'enlisted' ? giverId! : receiverId!,
  );
  if (target == null) {
    return { message: '대상이 존재하지 않습니다' };
  }
  if (type === 'enlisted') {
    if (giverId === sn) {
      return { message: '스스로에게 수여할 수 없습니다' };
    }
    try {
      await kysely
        .insertInto('points')
        .values({
          given_at: givenAt,
          receiver_id: sn!,
          reason,
          giver_id: giverId!,
          value,
          verified_at: null,
        })
        .executeTakeFirstOrThrow();
      return { message: null };
    } catch (e) {
      return { message: '알 수 없는 오류가 발생했습니다' };
    }
  }
  const { message } = checkIfSoldierHasPermission(value, permissions);
  if (message) {
    return { message };
  }
  try {
    await kysely
      .insertInto('points')
      .values({
        receiver_id: receiverId!,
        reason,
        giver_id: sn!,
        given_at: givenAt,
        value,
        verified_at: new Date(),
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
}


/*
상벌점을 사용합니다.
군인이 자신의 상벌점을 사용하거나 특정 군인에게 상벌점을 부여할 수 있습니다.
*/
export async function redeemPoint({
  value,
  userId,
  reason,
}: {
  value: number;
  userId: string;
  reason: string;
}) {
  if (reason.trim() === '') {
    return { message: '상벌점 사용 이유를 작성해주세요' };
  }
  if (value !== Math.round(value)) {
    return { message: '상벌점은 정수여야 합니다' };
  }
  if (value <= 0) {
    return { message: '1점 이상이어야합니다' };
  }
  const { type, sn, permissions } = await currentSoldier();
  if (sn == null) {
    return { message: '로그아웃후 재시도해 주세요' };
  }
  if (type === 'enlisted') {
    return { message: '용사는 상점을 사용할 수 없습니다' };
  }
  if (userId == null) {
    return { message: '대상을 입력해주세요' };
  }
  const target = await fetchSoldier(userId);
  if (target == null) {
    return { message: '대상이 존재하지 않습니다' };
  }
  if (!hasPermission(permissions, ['Admin', 'PointAdmin', 'UsePoint'])) {
    return { message: '권한이 없습니다' };
  }
  try {
    const [{ total }, { used_points }] = await Promise.all([
      kysely
        .selectFrom('points')
        .where('receiver_id', '=', userId)
        .select(({ fn }) =>
          fn
            .coalesce(fn.sum<string>('points.value'), sql<string>`0`)
            .as('total'),
        )
        .executeTakeFirstOrThrow(),
      kysely
        .selectFrom('used_points')
        .where('user_id', '=', userId)
        .select(({ fn }) =>
          fn
            .coalesce(fn.sum<string>('used_points.value'), sql<string>`0`)
            .as('used_points'),
        )
        .executeTakeFirstOrThrow(),
    ]);
    if (parseInt(total, 10) - parseInt(used_points, 10) < value) {
      return { message: '상점이 부족합니다' };
    }
    await kysely
      .insertInto('used_points')
      .values({
        user_id: userId,
        recorded_by: sn,
        reason,
        value,
      })
      .executeTakeFirstOrThrow();
    return { message: null };
  } catch (e) {
    return { message: '알 수 없는 오류가 발생했습니다' };
  }
}


/*
상벌점 템플릿을 가져옵니다.
이 함수는 상벌점을 만들 때 사용되는 템플릿 데이터를 반환합니다.
*/
export async function fetchPointTemplates() {
  return kysely.selectFrom('point_templates').selectAll().execute();
}
