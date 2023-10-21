'use server';

import { Soldier } from '@/interfaces';
import { DatabaseError } from '@planetscale/database';
import { pbkdf2Sync, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { NoResultError } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/mysql';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import z from 'zod';
import { kysely } from './kysely';
import { currentSoldier } from './soldiers';
import { hasPermission } from './utils';

const AuthParams = Soldier.pick({ sn: true, password: true });

const ValidateSoldierParams = Soldier.partial().pick({
  deleted_at: true,
  rejected_at: true,
  verified_at: true,
});

export async function validateSoldier(
  data?: z.infer<typeof ValidateSoldierParams> | null,
) {
  if (data == null) {
    redirect('/auth/login');
  }
  if (data.deleted_at) {
    redirect('/auth/deleted');
  }
  if (data.rejected_at) {
    redirect('/auth/rejected');
  }
  if (!data.verified_at) {
    redirect('/auth/needVerification');
  }
}

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
  await validateSoldier(data);
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

export async function resetPassword({
  sn,
  oldPassword,
  newPassword,
  confirmation,
}: {
  sn: string;
  oldPassword: string;
  newPassword: string;
  confirmation: string;
}) {
  const { sn: requestingSoldierSN } = await currentSoldier();
  if (sn !== requestingSoldierSN) {
    return { message: '본인만 비밀번호를 변경할 수 있습니다' };
  }
  if (newPassword !== confirmation) {
    return { message: '새 비밀번호와 재입력이 일치하지 않습니다' };
  }
  if (!newPassword.trim()) {
    return { message: '비밀번호는 최소 한자리입니다' };
  }
  const data = await kysely
    .selectFrom('soldiers')
    .where('sn', '=', sn)
    .select('password')
    .executeTakeFirstOrThrow();

  const oldSalt = data.password.slice(0, 32);
  const oldHashedPassword = data.password.slice(32);
  const oldHashed = pbkdf2Sync(
    oldPassword,
    oldSalt,
    104906,
    64,
    'sha256',
  ).toString('base64');
  if (oldHashedPassword !== oldHashed) {
    return { message: '잘못된 비밀번호 입니다' };
  }

  const salt = randomBytes(24).toString('base64');
  const hashed = pbkdf2Sync(
    newPassword as string,
    salt,
    104906,
    64,
    'sha256',
  ).toString('base64');

  await kysely
    .updateTable('soldiers')
    .where('sn', '=', sn)
    .set({ password: salt + hashed })
    .executeTakeFirstOrThrow();
}

export async function resetPasswordForce(sn: string) {
  const current = await currentSoldier();
  if (
    !hasPermission(
      ['Admin', 'UserAdmin', 'ResetPasswordUser'],
      current.permissions,
    )
  ) {
    return { message: '비밀번호 초기화 권한이 없습니다', password: null };
  }
  if (current.sn === sn) {
    return { message: '본인 비밀번호는 초기화 할 수 없습니다', password: null };
  }
  // 랜덤 비밀번호 생성
  const password = randomBytes(6).toString('hex');
  const salt = randomBytes(24).toString('base64');
  const hashed = pbkdf2Sync(password, salt, 104906, 64, 'sha256').toString(
    'base64',
  );
  try {
    await kysely
      .updateTable('soldiers')
      .where('sn', '=', sn)
      .set({ password: salt + hashed })
      .executeTakeFirstOrThrow();
    return { password, message: null };
  } catch (e) {
    return { password: null, message: '비밀번호 초기화에 실패했습니다' };
  }
}
