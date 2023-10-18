'use server';

import { jsonArrayFrom } from 'kysely/helpers/mysql';
import { kysely } from './kysely';
import { pbkdf2Sync } from 'crypto';
import { NoResultError } from 'kysely';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function signIn({
  sn,
  password,
}: {
  sn: string;
  password: string;
}): Promise<{ message: string | null; accessToken: string | null }> {
  if (!sn || !password) {
    return { message: '군번과 비밀번호를 입력해주세요', accessToken: null };
  }
  let data;
  try {
    data = await kysely
      .selectFrom('soldiers')
      .where('sn', '=', sn)
      .select((eb) => [
        'name',
        'type',
        'verified_at',
        'rejected_at',
        'deleted_at',
        'password',
        jsonArrayFrom(
          eb
            .selectFrom('permissions')
            .select(['value', 'verified_at'])
            .whereRef('permissions.soldiers_id', '=', 'soldiers.sn'),
        ).as('permissions'),
      ])
      .executeTakeFirstOrThrow();
  } catch (e) {
    if (e instanceof NoResultError) {
      return {
        message: '존재하지 않는 사용자입니다',
        accessToken: null,
      };
    }
    return {
      message: '데이터를 불러오는 중 문제가 생겼습니다',
      accessToken: null,
    };
  }
  const salt = data.password.slice(0, 32);
  const hashedPassword = data.password.slice(32);
  const hashed = pbkdf2Sync(password, salt, 104906, 64, 'sha256').toString(
    'base64',
  );
  if (hashedPassword !== hashed) {
    return {
      message: '잘못된 비밀번호 입니다',
      accessToken: null,
    };
  }
  const accessToken = jwt.sign(
    {
      name: data.name,
      sub: sn,
      scope: (data.permissions ?? []).map(({ value }) => value),
      verified: data.verified_at ? true : data.rejected_at ? false : null,
      deleted: !!data.deleted_at,
      type: data.type,
    },
    process.env.JWT_SECRET_KEY!,
    {
      algorithm: 'HS512',
      expiresIn: '1h',
    },
  );
  cookies().set('auth.access_token', accessToken, {
    maxAge: 60 * 60,
    httpOnly: true,
    path: '/',
  });
  redirect('/');
}
