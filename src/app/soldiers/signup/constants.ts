import { Permission } from '@/interfaces';

export const ALL_PERMISSIONS: {
  [key in Permission]: {
    key: Permission;
    title: string;
    disabled?: boolean;
  };
} = {
  Admin: {
    key: 'Admin',
    title: '관리자',
    disabled: true,
  },
  UserAdmin: {
    key: 'UserAdmin',
    title: '유저 관리자',
  },
  ListUser: {
    key: 'ListUser',
    title: '유저 리스트 뷰어 권한',
  },
  DeleteUser: {
    key: 'DeleteUser',
    title: '유저 삭제 권한',
  },
  VerifyUser: {
    key: 'VerifyUser',
    title: '회원 가입 승인 권한',
  },
  GivePermissionUser: {
    key: 'GivePermissionUser',
    title: '권한 부여 권한',
  },
  ResetPasswordUser: {
    key: 'ResetPasswordUser',
    title: '비밀번호 초기화 권한',
  },
  PointAdmin: {
    key: 'PointAdmin',
    title: '상벌점에 관한 모든 권한',
  },
  ViewPoint: {
    key: 'ViewPoint',
    title: '유저 상점 내역 접근 권한',
  },
  GiveMeritPoint: {
    key: 'GiveMeritPoint',
    title: '상점 부여 권한',
  },
  GiveLargeMeritPoint: {
    key: 'GiveLargeMeritPoint',
    title: '5점 초과 상점 부여',
  },
  GiveDemeritPoint: {
    key: 'GiveDemeritPoint',
    title: '벌점 부여 권한',
  },
  GiveLargeDemeritPoint: {
    key: 'GiveLargeDemeritPoint',
    title: '5점 초과 벌점 부여',
  },
};
