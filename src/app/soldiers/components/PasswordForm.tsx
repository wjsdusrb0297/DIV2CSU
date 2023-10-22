'use client';

import { resetPassword } from '@/app/actions';
import { App, Button, Form, FormInstance, Input } from 'antd';
import { useCallback, useRef, useState } from 'react';

export type PasswordFormProps = { sn: string };

export function PasswordForm({ sn }: PasswordFormProps) {
  const formRef = useRef<FormInstance | null>(null);
  const { notification } = App.useApp();
  const [mutating, setMutating] = useState(false);

  const handlePasswordForm = useCallback(() => {
    resetPassword({
      sn,
      oldPassword: formRef.current?.getFieldValue('password') as string,
      newPassword: formRef.current?.getFieldValue('newPassword') as string,
      confirmation: formRef.current?.getFieldValue(
        'newPasswordConfirmation',
      ) as string,
    })
      .then(() => {
        notification.success({
          message: '변경 성공',
          description: '비밀번호을 변경하였습닏나',
        });
        formRef.current?.resetFields();
      })
      .finally(() => {
        setMutating(false);
      });
  }, [notification, sn]);

  return (
    <Form
      name='password'
      ref={formRef}
      onFinish={handlePasswordForm}
    >
      <Form.Item
        label='현재 비밀번호'
        name='password'
        required
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label='새 비밀번호'
        name='newPassword'
        rules={[
          { required: true, message: '비밀번호를 입력해주세요' },
          { min: 6, message: '최소 6자리 입니다' },
          { max: 30, message: '최대 30자리 입니다' },
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label='새 비밀번호 재입력'
        name='newPasswordConfirmation'
        required
      >
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button
          type='primary'
          htmlType='submit'
          loading={mutating}
        >
          변경
        </Button>
      </Form.Item>
    </Form>
  );
}
