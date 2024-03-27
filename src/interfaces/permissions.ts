import z from 'zod';

//export 는 다른 파일에서 import 가능. 
//즉, 여기 코드는 z란 객체의 enum속의 리스트들을 Permission(권한) 변수에 저장함.
export const Permission = z.enum([
  'Admin',
  'UserAdmin',
  'DeleteUser',
  'VerifyUser',
  'GivePermissionUser',
  'ResetPasswordUser',
  'PointAdmin',
  'ViewPoint',
  'GiveMeritPoint',
  'GiveLargeMeritPoint',
  'GiveDemeritPoint',
  'GiveLargeDemeritPoint',
  'UsePoint',
]);

export type Permission = z.infer<typeof Permission>;
