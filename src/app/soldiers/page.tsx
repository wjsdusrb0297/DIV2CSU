'use client';

import { Permission, Soldier } from '@/interfaces';
import { LoadingOutlined, QuestionOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  FloatButton,
  Form,
  FormInstance,
  Input,
  Popconfirm,
  Select,
  Spin,
  Transfer,
  Tree,
  message,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteUser,
  fetchSoldier,
  resetPassword,
  updatePassword,
  updatePermission,
} from './actions';
import { ALL_PERMISSIONS } from './signup/constants';
import { fetchUserFromJwt } from '../actions';
import _ from 'lodash';
import { HelpModal, PasswordModal, PermissionsTransfer } from './components';

export default function MyProfilePage({
  searchParams: { sn },
}: {
  searchParams: { sn: string };
}) {
  const [myData, setMyData] =
    useState<Awaited<ReturnType<typeof fetchUserFromJwt> | null>>(null);
  const [data, setData] = useState<Soldier | null>(null);
  const [helpShown, setHelpShwon] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const originalData = useRef<Soldier | null>(null);
  const formRef = useRef<FormInstance>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [mutatingPassword, setMutatingPassword] = useState(false);
  const [passwordMutateError, setPasswordMutateError] = useState<string | null>(
    null,
  );

  const handleUpdatePermissions = useCallback(() => {
    updatePermission(sn, permissions as Permission[])
      .then(() => {
        if (originalData.current?.permissions) {
          originalData.current.permissions = permissions.map((p) => ({
            value: p as Permission,
          }));
        }
        setData(
          (state) =>
            ({
              ...state,
              permissions: permissions.map((p) => ({ value: p })),
            } as any),
        );
        return message.success('권한을 성공적으로 변경하였습니다');
      })
      .catch((e) => {
        if ((e as any)?.message) {
          return message.error(JSON.parse((e as any).message)?.message);
        }
        message.error('권한 변경에 실패하였습니다');
      });
  }, [sn, permissions]);

  const permissionAlertMessage = useMemo(() => {
    if (sn == null || data?.sn === myData?.sub) {
      return '본인 권한은 수정할 수 없습니다';
    }
    if (
      !_.intersection(
        myData?.scope ?? ['Admin', 'UserAdmin', 'GivePermissionUser'],
      )
    ) {
      return '권한 변경 권한이 없습니다';
    }
    return null;
  }, [data, myData, sn]);

  const handleResetPassword = useCallback(() => {
    resetPassword(sn)
      .then(({ password }) => {
        setNewPassword(password);
      })
      .catch((e: any) => {
        if ((e as any)?.message) {
          return message.error(JSON.parse((e as any).message)?.message);
        }
        message.error('초기화에 실패하였습니다');
      });
  }, [sn]);

  const handlePasswordForm = useCallback(
    (form: {
      password: string;
      newPassword: string;
      newPasswordConfirmation: string;
    }) => {
      if (form.newPassword !== form.newPasswordConfirmation) {
        return setPasswordMutateError(
          '새 비밀번호와 재입력이 일치하지 않습니다',
        );
      }
      if (form.password === form.newPassword) {
        return setPasswordMutateError('변경하려는 비밀번호가 이전과 같습니다');
      }
      setMutatingPassword(true);
      updatePassword(form.password, form.newPassword)
        .then(() => {
          message.success('비밀번호를 변경하였습니다');
          formRef.current?.resetFields();
          setPasswordMutateError(null);
        })
        .catch((e) => {
          if ((e as any)?.message) {
            return setPasswordMutateError(
              JSON.parse((e as any).message)?.message,
            );
          }
          message.error('알 수 없는 오류가 발생했습니다');
        })
        .finally(() => {
          setMutatingPassword(false);
        });
    },
    [],
  );

  const handleUserDelete = useCallback(() => {
    deleteUser(sn, data?.deleted_at == null)
      .then(() => {
        setData((state) => {
          if (state == null) {
            return null;
          }
          message.success(
            `유저를 ${state.deleted_at == null ? '삭제' : '복원'}하였습니다`,
          );
          return {
            ...state,
            deleted_at: state.deleted_at == null ? 'deleted' : null,
          };
        });
      })
      .catch((e) => {
        message.error('유저 삭제를 실패하였습니다');
      });
  }, [sn, data?.deleted_at]);

  useEffect(() => {
    Promise.all([fetchUserFromJwt(), fetchSoldier(sn)]).then(([myD, d]) => {
      setMyData(myD);
      setData(d);
      setPermissions(d.permissions.map(({ value }) => value));
      originalData.current = d;
    });
  }, [sn]);

  if (data == null || myData == null) {
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
            value={data.type}
          >
            <Select.Option value='enlisted'>용사</Select.Option>
            <Select.Option value='nco'>간부</Select.Option>
          </Select>
        </div>
        <div className='mx-2' />
        <div>
          <span>군번</span>
          <Input
            value={data.sn}
            disabled
          />
        </div>
        <div className='mx-3' />
        <div>
          <span>이름</span>
          <Input
            value={data.name}
            disabled
          />
        </div>
      </div>
      {(sn == null || data?.sn === myData?.sub) && (
        <Form
          className='mt-5'
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
          {passwordMutateError && (
            <span className='text-red-400 m-2'>{passwordMutateError}</span>
          )}
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              loading={mutatingPassword}
            >
              변경
            </Button>
          </Form.Item>
        </Form>
      )}
      <div className='my-1' />
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
      <div className='flex flex-row mt-5 justify-start'>
        {!(sn == null || data?.sn === myData?.sub) && (
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
        {!(sn == null || data?.sn === myData?.sub) && (
          <>
            <Popconfirm
              title={`${
                data.deleted_at == null ? '삭제' : '복원'
              }하시겠습니까?`}
              cancelText='취소'
              okText={data.deleted_at == null ? '삭제' : '복원'}
              okType='danger'
              onConfirm={handleUserDelete}
            >
              <Button danger>
                {data.deleted_at == null ? '삭제' : '복원'}
              </Button>
            </Popconfirm>
            <div className='mx-2' />
          </>
        )}
        <Button
          type='primary'
          disabled={
            sn == null ||
            data?.sn === myData?.sub ||
            _.isEqual(
              originalData.current?.permissions.map(({ value }) => value),
              permissions,
            )
          }
          onClick={handleUpdatePermissions}
        >
          저장
        </Button>
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
