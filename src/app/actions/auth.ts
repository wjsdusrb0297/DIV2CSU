'use server';

import { jsonArrayFrom } from 'kysely/helpers/mysql';
import { kysely } from './kysely';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { NoResultError } from 'kysely';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import z from 'zod';
import { DatabaseError } from '@planetscale/database';
import { Soldier } from '@/interfaces';

const AuthParams = Soldier.pick({ sn: true, password: true });

export async function signIn({
  sn,
  password,
}: z.infer<typeof AuthParams>): Promise<{
  message: string | null;
  accessToken: string | null;
}> {
  const result = AuthParams.safeParse({ sn, password });
  if (!result.success) {
    return { message: result.error.issues.pop()!.message, accessToken: null };
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

const SignUpParams = Soldier.pick({
  sn: true,
  password: true,
  type: true,
  name: true,
});

export async function signUp(
  form: z.infer<typeof SignUpParams>,
): Promise<{ message: string | null; accessToken: string | null }> {
  const validation = SignUpParams.safeParse(form);
  if (!validation.success) {
    return { message: validation.error.issues[0].message, accessToken: null };
  }
  const salt = randomBytes(24).toString('base64');
  const hashed = pbkdf2Sync(
    form.password as string,
    salt,
    104906,
    64,
    'sha256',
  ).toString('base64');
  try {
    await kysely
      .insertInto('soldiers')
      .values({
        name: form.name,
        sn: form.sn,
        type: form.type,
        password: salt + hashed,
      })
      .executeTakeFirstOrThrow();
  } catch (e) {
    if (e instanceof DatabaseError) {
      if (e.body.message.includes('AlreadyExists')) {
        return { message: '이미 존재하는 사용자입니다', accessToken: null };
      }
    }
    return { message: '회원가입에 실패하였습니다', accessToken: null };
  }
  if (form.type === 'nco') {
    await kysely
      .insertInto('permissions')
      .values(
        ['GiveMeritPoint', 'GiveDemeritPoint'].map((p) => ({
          soldiers_id: form.sn,
          value: p,
        })),
      )
      .executeTakeFirst();
  }
  const accessToken = jwt.sign(
    {
      name: form.name,
      sub: form.sn,
      scope: [],
      verified: null,
      deleted: false,
      type: form.type,
    },
    process.env.JWT_SECRET_KEY!,
    {
      algorithm: 'HS512',
      expiresIn: '1h',
    },
  );
  cookies().set('auth.access_token', accessToken, {
    maxAge: 60 * 60,
    path: '/',
    httpOnly: true,
  });
  redirect('/auth/needVerification');
}
