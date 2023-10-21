'use client';

import { verifySoldier } from '@/app/actions';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { App, Button, Card, Popconfirm } from 'antd';
import { useCallback, useState } from 'react';

export type UnverifiedUserCardProps = {
  name: string;
  sn: string;
  type: 'enlisted' | 'nco';
};

export function UnverifiedUserCard({
  name,
  sn,
  type,
}: UnverifiedUserCardProps) {
  const [state, setState] = useState<'idle' | 'accepted' | 'rejected'>('idle');
  const [loading, setLoading] = useState(false);
  const backgroundColor = {
    idle: '#FFF',
    accepted: '#A7C0FF',
    rejected: '#ED2939',
  }[state];
  const { message } = App.useApp();

  const handleClick = useCallback(
    (value: boolean) => async () => {
      setLoading(true);
      const { success, message: resultMessage } = await verifySoldier(
        sn,
        value,
      );
      if (success) {
        setState(value ? 'accepted' : 'rejected');
        message.success(resultMessage);
      } else {
        message.error(resultMessage);
      }
      setLoading(false);
    },
    [sn, message],
  );

  return (
    <Card
      className='m-2'
      style={{
        backgroundColor,
        textDecorationLine: state !== 'idle' ? 'line-through' : 'none',
      }}
    >
      <div className='flex flex-row'>
        <div className='flex-1'>
          <p className='font-bold text-lg'>
            {type === 'enlisted' ? '용사' : '간부'} {name}
          </p>
          <p className='text-black'>{sn}</p>
        </div>
        <div className='flex flex-row'>
          <Popconfirm
            title='회원가입을 반려하시겠습니까?'
            cancelText='취소'
            okText='반려'
            okType='danger'
            onConfirm={handleClick(false)}
          >
            <Button
              icon={<CloseOutlined />}
              danger
              loading={loading}
            />
          </Popconfirm>
          <div className='mx-2' />
          <Popconfirm
            title='회원가입을 승인하시겠습니까?'
            cancelText='취소'
            okText='승인'
            okType='primary'
            onConfirm={handleClick(true)}
          >
            <Button
              icon={<CheckOutlined />}
              type='primary'
              loading={loading}
            />
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
}
