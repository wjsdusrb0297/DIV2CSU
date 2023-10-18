'use client';

import { Permission, Soldier } from '@/interfaces';
import { LoadingOutlined, QuestionOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  FloatButton,
  Input,
  Popconfirm,
  Select,
  Spin,
  message,
} from 'antd';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  currentSoldier,
  deleteSoldier,
  fetchSoldier,
  resetPasswordForce,
  updatePermissions,
} from '../actions';
import _ from 'lodash';
import {
  HelpModal,
  PasswordForm,
  PasswordModal,
  PermissionsTransfer,
} from './components';

export default function MyProfilePage({
  searchParams: { sn },
}: {
  searchParams: { sn: string };
}) {
  const [mySoldier, setMySoldier] = useState<Omit<Soldier, 'password'> | null>(
    null,
  );
  const [targetSoldier, setTargetSoldier] = useState<Omit<
    Soldier,
    'password'
  > | null>(null);
  const data = targetSoldier ?? mySoldier;
  const isViewingMine =
    targetSoldier == null || mySoldier?.sn === targetSoldier.sn;
  const [helpShown, setHelpShwon] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  useLayoutEffect(() => {
    Promise.all([currentSoldier(), sn ? fetchSoldier(sn) : null]).then(
      ([newMySoldier, newTargetSoldier]) => {
        setMySoldier(newMySoldier as any);
        setPermissions(
          newTargetSoldier?.permissions ?? newMySoldier.permissions,
        );
        setTargetSoldier(newTargetSoldier as any);
      },
    );
  }, [sn]);

  const handleUpdatePermissions = useCallback(() => {
    updatePermissions({ sn, permissions }).then(({ message: newMessage }) => {
      if (newMessage != null) {
        return message.error(newMessage);
      }
      setTargetSoldier(
        (state) =>
          ({
            ...state,
            permissions: permissions,
          } as any),
      );
      return message.success('권한을 성공적으로 변경하였습니다');
    });
  }, [sn, permissions]);

  const permissionAlertMessage = useMemo(() => {
    if (isViewingMine) {
      return '본인 권한은 수정할 수 없습니다';
    }
    if (
      !_.intersection(mySoldier?.permissions ?? [], [
        'Admin',
        'UserAdmin',
        'GivePermissionUser',
      ])
    ) {
      return '권한 변경 권한이 없습니다';
    }
    return null;
  }, [isViewingMine, mySoldier?.permissions]);

  const handleResetPassword = useCallback(() => {
    if (!isViewingMine) {
      return;
    }
    resetPasswordForce(sn).then(({ password, message: newMessage }) => {
      if (newMessage) {
        return message.error(newMessage);
      }
      setNewPassword(password);
    });
  }, [sn, isViewingMine]);

  const handleUserDelete = useCallback(() => {
    deleteSoldier({ sn, value: data?.deleted_at == null }).then(
      ({ message: newMessage }) => {
        if (newMessage) {
          message.error(newMessage);
        }
        setTargetSoldier((state) => {
          if (state == null) {
            return null;
          }
          message.success(
            `유저를 ${state.deleted_at == null ? '삭제' : '복원'}하였습니다`,
          );
          return {
            ...state,
            deleted_at: state.deleted_at == null ? new Date() : null,
          };
        });
      },
    );
  }, [sn, data?.deleted_at]);

  if (data == null) {
    return (
      <div className='flex flex-1 min-h-full justify-center items-center'>
        <Spin indicator={<LoadingOutlined spin />} />
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col py-2 px-3'>
      <div className='flex flex-row items-center'>
        <div>
          <span>유형</span>
          <Select
            disabled
            value={data?.type}
          >
            <Select.Option value='enlisted'>용사</Select.Option>
            <Select.Option value='nco'>간부</Select.Option>
          </Select>
        </div>
        <div className='mx-2' />
        <div>
          <span>군번</span>
          <Input
            value={data?.sn}
            disabled
          />
        </div>
        <div className='mx-3' />
        <div>
          <span>이름</span>
          <Input
            value={data?.name}
            disabled
          />
        </div>
      </div>
      <div className='my-3'>
        {!isViewingMine &&
          _.intersection(
            ['Admin', 'PointAdmin', 'ViewPoint'],
            mySoldier?.permissions,
          ).length && (
            <Button href={`/points?sn=${targetSoldier.sn}`}>
              상점 내역 보기
            </Button>
          )}
      </div>
      {isViewingMine && <PasswordForm sn={sn} />}
      <div className='my-1' />
      {data?.type !== 'enlisted' && (
        <>
          <PermissionsTransfer
            permissions={permissions as Permission[]}
            onChange={(t) => setPermissions(t)}
          />
          {permissionAlertMessage && (
            <>
              <div className='my-1' />
              <Alert
                type='warning'
                message={permissionAlertMessage}
              />
            </>
          )}
        </>
      )}
      <div className='flex flex-row mt-5 justify-start'>
        {!isViewingMine && (
          <>
            <Popconfirm
              title='초기화'
              description='정말 초기화하시겠습니까?'
              cancelText='취소'
              okText='초기화'
              okType='danger'
              onConfirm={handleResetPassword}
            >
              <Button danger>비밀번호 초기화</Button>
            </Popconfirm>
            <div className='mx-2' />
          </>
        )}
        {!isViewingMine && (
          <>
            <Popconfirm
              title={`${
                data?.deleted_at == null ? '삭제' : '복원'
              }하시겠습니까?`}
              cancelText='취소'
              okText={data?.deleted_at == null ? '삭제' : '복원'}
              okType='danger'
              onConfirm={handleUserDelete}
            >
              <Button danger>
                {data?.deleted_at == null ? '삭제' : '복원'}
              </Button>
            </Popconfirm>
            <div className='mx-2' />
          </>
        )}
        {data?.type === 'nco' && (
          <Button
            type='primary'
            disabled={
              isViewingMine || _.isEqual(targetSoldier.permissions, permissions)
            }
            onClick={handleUpdatePermissions}
          >
            저장
          </Button>
        )}
      </div>
      <FloatButton
        icon={<QuestionOutlined />}
        onClick={() => setHelpShwon(true)}
      />
      <HelpModal
        shown={helpShown}
        onPressClose={() => setHelpShwon(false)}
      />
      <PasswordModal
        password={newPassword}
        onClose={() => setNewPassword(null)}
      />
    </div>
  );
}
