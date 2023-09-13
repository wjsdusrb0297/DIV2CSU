import { Permission } from '@/interfaces';
import { Tree } from 'antd';
import { ALL_PERMISSIONS } from '../signup/constants';

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
              children: Object.values(ALL_PERMISSIONS).filter(({ key }) =>
                key.endsWith('User'),
              ),
            },
            {
              ...ALL_PERMISSIONS.PointAdmin,
              children: Object.values(ALL_PERMISSIONS).filter(({ key }) =>
                key.endsWith('Point'),
              ),
            },
          ],
        },
      ]}
    />
  );
}
