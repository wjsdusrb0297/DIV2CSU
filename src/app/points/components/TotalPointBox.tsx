'use client';
import { useLayoutEffect, useState } from 'react';
import { fetchTotalPoints } from '@/app/points/actions';
import { Card, Row, Skeleton, Statistic } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { FetchTotalPointsData } from '@/app/points/interfaces';
import { Soldier } from '@/interfaces';

export function TotalPointBox({ user }: { user: Soldier }) {
  const [data, setData] = useState<FetchTotalPointsData | null>(null);

  useLayoutEffect(() => {
    fetchTotalPoints(user.sn).then((d) => setData(d));
  }, [user.sn]);

  return (
    <Row>
      <Card className='flex-1'>
        <Skeleton
          paragraph={{ rows: 1 }}
          active
          loading={data?.unverifiedPoint == null || data?.verifiedPoint == null}
        >
          <Statistic
            title={`총 점수 (${user.name})`}
            value={`${
              parseInt(data?.verifiedPoint ?? '0', 10) +
              parseInt(data?.unverifiedPoint ?? '0', 10)
            }점`}
          />
        </Skeleton>
      </Card>
      <Card className='flex-1'>
        <Skeleton
          paragraph={{ rows: 1 }}
          active
          loading={data?.unverifiedPoint == null}
        >
          <Statistic
            title='미승인 상점'
            value={`${data?.unverifiedPoint}점`}
            prefix={<CloseOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Skeleton>
      </Card>
      <Card className='flex-1'>
        <Skeleton
          paragraph={{ rows: 1 }}
          active
          loading={data?.verifiedPoint == null}
        >
          <Statistic
            title='승인 상점'
            value={`${data?.verifiedPoint}점`}
            prefix={<CheckOutlined />}
            valueStyle={{ color: '#cf1322' }}
          />
        </Skeleton>
      </Card>
    </Row>
  );
}
