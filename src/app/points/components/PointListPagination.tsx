'use client';

import { Pagination } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useLayoutEffect, useState } from 'react';
import { fetchHistoryCounts } from '../actions';

export type PointListPaginationProps = {
  sn?: string;
  page?: number;
};

export function PointListPagination({
  sn,
  page = 1,
}: PointListPaginationProps) {
  const router = useRouter();
  const [total, setTotal] = useState(1);

  useLayoutEffect(() => {
    fetchHistoryCounts().then((d) => {
      setTotal(parseInt(d.count, 10));
    });
  });

  const onChange = useCallback(
    (page: number) => {
      router.replace(`/points?page=${page}${sn ? `&sn=${sn}` : ''}`);
    },
    [router, sn],
  );

  return (
    <Pagination
      simple
      rootClassName='self-center'
      current={page ?? 1}
      pageSize={20}
      total={total}
      onChange={onChange}
    />
  );
}
