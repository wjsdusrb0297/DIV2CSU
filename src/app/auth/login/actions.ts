'use server';

import { api } from '@/lib/instance';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function handleSubmit(sn: string, password: string) {
  if (!sn?.length || !password?.length) {
    return { message: '군번과 비밀번호를 입력해주세요' };
  }
  let accessToken = null;
  try {
    const data = await api
      .post({ sn, password }, '/auth/signIn')
      .json<{ accessToken?: string }>();
    accessToken = data?.accessToken;
  } catch (e) {
    return {
      message: (e as any)?.json?.message ?? '알 수 없는 오류가 발생했습니다',
    };
  }
  if (accessToken == null) {
    return { message: '로그인에 실패했습니다' };
  }
  cookies().set('auth.access_token', accessToken, {
    maxAge: 60 * 60,
    httpOnly: true,
    path: '/',
  });
  redirect('/');
}
