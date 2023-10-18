import { Empty } from 'antd';
import { PointRequestCard } from '.';
import { fetchPendingPoints } from '@/app/actions';

export async function PointRequestList() {
  const data = await fetchPendingPoints();

  if (data.length === 0) {
    return (
      <div className='py-5 my-5'>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<p>요청된 상벌점이 없습니다</p>}
        />
      </div>
    );
  }
  return data.map(({ id }) => (
    <PointRequestCard
      key={id}
      pointId={id}
    />
  ));
}
