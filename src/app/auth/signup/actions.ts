'use server';

import { redirect } from 'next/navigation';
import { SignUpForm } from './interfaces';
import { api } from '@/lib/instance';
import { cookies } from 'next/headers';

export async function handleSignup(form: SignUpForm) {
  const data = await api.post(form, '/auth/signup').json<{
    accessToken: string;
  }>();
  if (data?.accessToken != null) {
    cookies().set('auth.access_token', data.accessToken, {
      maxAge: 60 * 60,
      path: '/',
      httpOnly: true,
    });
    redirect('/auth/needVerification');
  }
}
