'use client';

import {
  ContainerOutlined,
  DeleteOutlined,
  HomeOutlined,
  LikeOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SendOutlined,
  UnlockOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Button, ConfigProvider, Layout, Menu, MenuProps } from 'antd';
import locale from 'antd/locale/ko_KR';
import _ from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { useCallback, useMemo, useState } from 'react';
import { currentSoldier, signOut } from './actions';

const title = {
  '/points': '상점 관리',
  '/points/request': '상점 요청',
  '/points/give': '상점 부여',
  '/points/redeem': '상점 사용',
  '/soldiers/list': '유저 관리',
  '/soldiers/signup': '회원가입 관리',
};

function renderTitle(pathname: string) {
  if (pathname in title) {
    return title[pathname as keyof typeof title];
  }
  return '병영생활 관리';
}


/*
사용자가 로그인한 상태에서 메뉴 레이아웃을 표시합니다.
사용자가 로그인하지 않은 경우, 로그인 페이지로 리다이렉션합니다.
사용자의 상태와 권한에 따라 메뉴 항목을 동적으로 렌더링합니다.
*/
export function MenuLayout({
  data,
  children,
  /*
  -data: currentSoldier 함수에서 반환된 사용자 데이터입니다. 사용자가 로그인하지 않은 경우 null입니다.
  -children: 메뉴 레이아웃 내의 자식 컴포넌트입니다.
  */
}: {
  data: Awaited<ReturnType<typeof currentSoldier>> | null;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const onClick: MenuClickEventHandler = useCallback(
    (info) => {
      router.replace(info.key);
      setCollapsed(true);
    },
    [router],
  );

  const onSignOut = useCallback(async () => {
    await signOut();
    router.replace('/auth/logout');
    setCollapsed(true);
  }, [router]);

  const items: MenuProps['items'] = useMemo(
    /*
    사용자의 권한과 상태를 기반으로 메뉴 항목을 동적으로 렌더링합니다.
    items 배열에는 각 메뉴 항목의 정보가 포함되어 있습니다. 이 정보는 사용자의 권한에 따라 다르게 설정됩니다.
    각 메뉴 항목은 특정 경로와 연결되어 있으며, 클릭시 해당 경로로 이동합니다.
    일부 메뉴 항목은 특정 권한을 가진 사용자만 접근할 수 있도록 설정되어 있습니다.
    */
    () =>
      data == null
        ? []
        : [
            {
              key: '/soldiers',
              // key  = 다른 파일로 연결시킴
              label: data.name ?? '',
              //얘가 마이페이지
              icon: <UserOutlined />,
              onClick,
            },
            { key: '/home_menu', label: '홈', icon: <HomeOutlined />, onClick },
          /*
          *홈에는 key가 설정되어있지 않기 때문에 빈화면 뜸
          -> 새로운 파일에 사진 띄우고 그걸 key로 연결하면 끝
          */
            {
              key: '/soldiers/#',
              // #은 바로가기 없는거. (밑에 children 있는항목)
              label: '유저',
              icon: <UserOutlined />,
              children: [
                {
                  key: '/soldiers/list',
                  label: '유저 관리',
                  icon: <UserOutlined />,
                  disabled:
                    _.intersection(data.permissions, [
                      'Admin',
                      'UserAdmin',
                      'ListUser',
                    ]).length === 0,
                  onClick,
                },
                {
                  key: '/soldiers/signup',
                  label: '회원가입 관리',
                  icon: <UserAddOutlined />,
                  disabled:
                    _.intersection(data.permissions, [
                      'Admin',
                      'UserAdmin',
                      'ListUser',
                      'VerifyUser',
                    ]).length === 0,
                  onClick,
                },
              ],
            },
            {
              key: '/points/#',
              label: '상점',
              icon: <LikeOutlined />,
              children: [
                {
                  key: '/points',
                  label: '상점 관리',
                  icon: <ContainerOutlined />,
                  onClick,
                },
                {
                  key: '/points/request',
                  label: '상점 요청',
                  icon: <MailOutlined />,
                  disabled: data.type !== 'enlisted',
                  onClick,
                },
                {
                  key: '/points/give',
                  label: '상점 부여',
                  icon: <SendOutlined />,
                  onClick,
                  disabled:
                    _.intersection(data.permissions, [
                      'Admin',
                      'PointAdmin',
                      'GiveMeritPoint',
                      'GiveLargeMeritPoint',
                      'GiveDemeritPoint',
                      'GiveLargeDemeritPoint',
                    ]).length === 0,
                },
                {
                  key: '/points/redeem',
                  label: '상점 사용',
                  icon: <DeleteOutlined />,
                  onClick,
                  disabled:
                    _.intersection(data.permissions, [
                      'Admin',
                      'PointAdmin',
                      'UsePoint',
                    ]).length === 0,
                },
              ],
            },
            {
              key: '/auth/logout',
              label: '로그아웃',
              icon: <UnlockOutlined />,
              danger: true,
              onClick: onSignOut,
            },
          ],
    [data, onClick, onSignOut],
  );

  const onClickMenu = useCallback(() => setCollapsed((state) => !state), []);

  if (data == null) {
    if (pathname.startsWith('/auth')) {
      return children;
    }
    router.replace('/auth/login');
    return children;
  }

  return (
    <ConfigProvider locale={locale}>
      <App>
        <Layout style={{ minHeight: '100vh' }}>
          <Layout.Sider
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 60,
              bottom: 0,
              zIndex: 1,
            }}
            collapsible
            collapsed={collapsed}
            collapsedWidth={0}
            trigger={null}
          >
            <Menu
              theme='dark'
              mode='inline'
              items={items}
              selectedKeys={[pathname]}
            />
          </Layout.Sider>
          <Layout>
            <Layout.Header
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                display: 'flex',
                flexDirection: 'row',
                padding: 0,
                paddingLeft: 20,
                alignItems: 'center',
              }}
            >
              <Button
                type='text'
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={onClickMenu}
                style={{ color: '#FFF' }}
              />
              <p className='text-white font-bold text-xl ml-5'>
                {renderTitle(pathname)}
              </p>
            </Layout.Header>
            <Layout.Content>{children}</Layout.Content>
            <Layout.Footer style={{ textAlign: 'center' }}>
              <span className='text-black font-bold'>©2023 키보드워리어</span>
            </Layout.Footer>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
}
