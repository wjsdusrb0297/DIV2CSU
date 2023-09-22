'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import { Button, Form, Input } from 'antd';
import { withMask } from 'use-mask-input';
import { handleSubmit } from './actions';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(async (form: any) => {
    setLoading(true);
    setError(null);
    const data = await handleSubmit(form?.sn, form?.password);
    if (data?.message) {
      setError(data?.message);
    }
    setLoading(false);
  }, []);

  return (
    <div
      className='container pt-7 pb-5'
      style={styles.container}
    >
      <div className='flex flex-col items-center mb-5'>
        <Image
          priority
          className='w-40'
          width={400}
          height={400}
          src='https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_South_Korea.png'
          alt='Divison Logo'
        />
        <h1 className='mt-5 text-center font-black text-3xl'>병영생활 관리</h1>
      </div>
      <Form
        onFinish={onSubmit}
        className='flex flex-col w-2/3 mt-5'
      >
        <Form.Item<string>
          name='sn'
          rules={[{ required: true, message: '군번을 입력해주세요' }]}
        >
          <Input
            ref={(ref) =>
              withMask('99-99999[999]', { placeholder: '' })(ref?.input!)
            }
            type='text'
            placeholder='군번'
            prefix={<UserOutlined />}
            inputMode='numeric'
          />
        </Form.Item>
        <Form.Item<string>
          name='password'
          rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
        >
          <Input.Password
            required
            aria-required
            placeholder='비밀번호'
            name='password'
            prefix={<LockOutlined />}
          />
        </Form.Item>
        {error && <p className='mb-3 text-red-400'>{error}</p>}
        <Button
          type='primary'
          loading={loading}
          htmlType='submit'
        >
          로그인
        </Button>
        <div className='flex flex-row mt-3'>
          <Link
            href='/auth/forgotPassword'
            className='text-blue-300'
          >
            비밀번호 찾기
          </Link>
          <div className='mx-3 bg-gray-500 w-px' />
          <Link
            href='/auth/signup'
            className='text-blue-300'
          >
            회원가입
          </Link>
        </div>
      </Form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: '-webkit-fill-available',
    overflow: 'hidden',
  },
  textinput: {
    outline: 'none',
    border: 'none',
  },
};
