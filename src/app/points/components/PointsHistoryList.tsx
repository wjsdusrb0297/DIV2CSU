import { api } from '@/lib/instance';
import { PointCard } from './PointCard';
import { Empty } from 'antd';

export type PointsHistoryListProps = { sn?: string; page?: number };

export async function PointsHistoryList({
  sn,
  page = 0,
}: PointsHistoryListProps) {
  const data = await api
    .query({ page, sn })
    .get('/points/list')
    .json<{ id: string }[]>();

  if (data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<p>받은 상벌점이 없습니다</p>}
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
