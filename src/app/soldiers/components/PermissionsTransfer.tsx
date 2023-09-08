import { Permission } from '@/interfaces';
import { Transfer, Tree, TreeProps } from 'antd';
import { ALL_PERMISSIONS } from '../signup/constants';
import { useCallback } from 'react';

export type PermissionsTransferProps = {
  permissions: Permission[];
  onChange?: (newPermissions: Permission[]) => void;
};

export function PermissionsTransfer({
  permissions,
  onChange,
}: PermissionsTransferProps) {
  return (
    <Tree
      className='my-2'
      defaultExpandAll
      checkedKeys={permissions}
      blockNode
      selectable={false}
      checkable
      onCheck={(checked) => {
        onChange?.(checked as Permission[]);
      }}
      treeData={[
        {
          ...ALL_PERMISSIONS.Admin,
          key: 'Admin',
          children: [
            {
              ...ALL_PERMISSIONS.UserAdmin,
              children: [
                ALL_PERMISSIONS.ListUser,
                ALL_PERMISSIONS.DeleteUser,
                ALL_PERMISSIONS.VerifyUser,
                ALL_PERMISSIONS.GivePermissionUser,
                ALL_PERMISSIONS.ResetPasswordUser,
              ],
            },
            {
              ...ALL_PERMISSIONS.PointAdmin,
              children: [
                ALL_PERMISSIONS.GiveMeritPoint,
                ALL_PERMISSIONS.GiveLargeMeritPoint,
                ALL_PERMISSIONS.GiveDemeritPoint,
                ALL_PERMISSIONS.GiveLargeDemeritPoint,
              ],
            },
          ],
        },
      ]}
    />
  );
}

/*
import { Permission } from '@/interfaces';
import { Transfer, Tree, TreeProps } from 'antd';
import { ALL_PERMISSIONS } from '../signup/constants';
import { useCallback } from 'react';

export type PermissionsTransferProps = {
  permissions: Permission[];
  onChange?: (newPermissions: Permission[]) => void;
};

export function PermissionsTransfer({
  permissions,
  onChange,
}: PermissionsTransferProps) {
  return (
    <Transfer
      rootClassName='flex flex-col-reverse w-100'
      targetKeys={permissions}
      operationStyle={{
        display: 'flex',
        flexDirection: 'column',
        transform: 'rotate(-90deg)',
      }}
      showSelectAll={false}
      render={(item) => item.title}
      dataSource={Object.values(ALL_PERMISSIONS)}
      titles={[<p key='left'>권한</p>, <p key='right'>보유 권한</p>]}
      onChange={useCallback(
        (t: string[]) => {
          onChange?.(t as Permission[]);
        },
        [onChange],
      )}
    >
      {({ direction, onItemSelect, onItemSelectAll, selectedKeys }) => {
        if (direction === 'right') {
          return;
        }
        const onCheck: TreeProps['onCheck'] = (_, { node: { key } }) => {
          if (permissions.includes(key as Permission)) {
            return;
          }
          onItemSelect(
            key as Permission,
            !selectedKeys.includes(key as Permission),
          );
        };
        return (
          <div>
            <Tree
              defaultExpandAll
              checkedKeys={[...selectedKeys, ...permissions]}
              blockNode
              selectable={false}
              checkable
              onCheck={onCheck}
              treeData={[
                {
                  ...ALL_PERMISSIONS.Admin,
                  key: 'Admin',
                  children: [
                    {
                      ...ALL_PERMISSIONS.UserAdmin,
                      children: [
                        ALL_PERMISSIONS.ListUser,
                        ALL_PERMISSIONS.DeleteUser,
                        ALL_PERMISSIONS.VerifyUser,
                        ALL_PERMISSIONS.GivePermissionUser,
                        ALL_PERMISSIONS.ResetPasswordUser,
                      ],
                    },
                    {
                      ...ALL_PERMISSIONS.PointAdmin,
                      children: [
                        ALL_PERMISSIONS.GiveMeritPoint,
                        ALL_PERMISSIONS.GiveLargeMeritPoint,
                        ALL_PERMISSIONS.GiveDemeritPoint,
                        ALL_PERMISSIONS.GiveLargeDemeritPoint,
                      ],
                    },
                  ],
                },
              ]}
            />
          </div>
        );
      }}
    </Transfer>
  );
}

*/
