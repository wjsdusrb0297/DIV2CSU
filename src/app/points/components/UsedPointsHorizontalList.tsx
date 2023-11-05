'use client';

import { listPoints } from '@/app/actions';
import { Card, Row } from 'antd';
import dayjs from 'dayjs';

export type UsedPointsHorizontalListProps = {
  data: Awaited<ReturnType<typeof listPoints>>['usedPoints'];
};

export function UsedPointsHorizontalList({
  data,
}: UsedPointsHorizontalListProps) {
  return (
    <Row gutter={16}>
      {(data ?? []).map((p) => (
        <Card key={p.id}>
          <Card.Meta
            title={`${dayjs(p.created_at).format('YYYY년 MM월 DD일')} - ${
              p.value
            }점`}
            description={`${p.reason}`}
          />
        </Card>
      ))}
    </Row>
  );
}
