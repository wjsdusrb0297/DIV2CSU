import { Soldier } from '@/interfaces';
import { PlusOutlined } from '@ant-design/icons';
import { Divider, FloatButton } from 'antd';
import { currentSoldier, fetchSoldier, listPoints } from '../actions';
import {
  PointListPagination,
  PointRequestList,
  PointsHistoryList,
  TotalPointBox,
} from './components';

async function EnlistedPage({ user, page }: { user: Soldier; page: number }) {
  const { data, count } = await listPoints(user?.sn, page);
  return (
    <div className='flex flex-1 flex-col'>
      <TotalPointBox user={user} />
      <div className='flex-1 mb-2'>
        <PointsHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <PointListPagination
        sn={user.sn}
        total={count}
        page={page}
      />
      <FloatButton
        icon={<PlusOutlined />}
        href='/points/request'
      />
    </div>
  );
}

async function NcoPage({
  user,
  page,
  showRequest,
}: {
  user: Soldier;
  page: number;
  showRequest: boolean;
}) {
  const { data, count } = await listPoints(user?.sn, page);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        {showRequest && (
          <>
            <PointRequestList />
            <Divider />
          </>
        )}
        <PointsHistoryList
          type={user.type}
          data={data}
        />
      </div>
      <Divider />
      <PointListPagination
        sn={user.sn}
        total={count}
        page={page}
      />
      <FloatButton
        icon={<PlusOutlined />}
        href='/points/give'
      />
    </div>
  );
}

export default async function ManagePointsPage({
  searchParams,
}: {
  searchParams: { sn?: string; page?: string };
}) {
  const [user, profile] = await Promise.all([
    searchParams.sn ? fetchSoldier(searchParams.sn) : currentSoldier(),
    currentSoldier(),
  ]);
  const page = parseInt(searchParams?.page ?? '1', 10) || 1;

  if (user.type === 'enlisted') {
    return (
      <EnlistedPage
        user={user as any}
        page={page}
      />
    );
  }
  return (
    <NcoPage
      user={user as any}
      page={page}
      showRequest={profile.sn === user.sn}
    />
  );
}
