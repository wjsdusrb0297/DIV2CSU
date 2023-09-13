import { api } from '@/lib/instance';
import { PointCard } from './PointCard';
import { Empty } from 'antd';
import { Soldier } from '@/interfaces';

export type PointsHistoryListProps = { user?: Soldier; page?: number };

export async function PointsHistoryList({
  user,
  page = 0,
}: PointsHistoryListProps) {
  const data = await api
    .query({ page, sn: user?.sn })
    .get('/points/list')
    .json<{ id: string }[]>();

  if (data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <p>
              {user?.type === 'enlisted'
                ? '받은 상벌점이 없습니다'
                : '부여한 상벌점이 없습니다'}
            </p>
          }
        />
      </div>
    );
  }
  return data.map(({ id }) => (
    <PointCard
      key={id}
      pointId={id}
    />
  ));
}
