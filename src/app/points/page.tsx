import { FloatButton } from 'antd';
import {
  PointsHistoryList,
  TotalPointBox,
  PointListPagination,
  PointRequestList,
} from './components';
import { api } from '@/lib/instance';
import { Soldier } from '@/interfaces';
import { PlusOutlined } from '@ant-design/icons';

async function EnlistedPage({ user, page }: { user: Soldier; page: number }) {
  return (
    <div className='flex flex-1 flex-col'>
      <TotalPointBox user={user} />
      <div className='flex-1 mb-2'>
        <PointsHistoryList
          sn={user.sn}
          page={page}
        />
      </div>
      <PointListPagination
        sn={user.sn}
        page={page}
      />
      <FloatButton
        icon={<PlusOutlined />}
        href='/points/request'
      />
    </div>
  );
}

async function NcoPage() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 mb-2'>
        <PointRequestList />
      </div>
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
  const user = await api
    .query({ sn: searchParams.sn })
    .get('/soldiers')
    .json<Soldier>();
  const page = parseInt(searchParams?.page ?? '1', 10) || 1;

  if (searchParams.sn || user.type === 'enlisted') {
    return (
      <EnlistedPage
        user={user}
        page={page}
      />
    );
  }
  return <NcoPage />;
}
