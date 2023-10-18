'use client';

import { Pagination } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export type PointListPaginationProps = {
  sn: string;
  total: number;
  page?: number;
};

export function PointListPagination({
  sn,
  total,
  page = 1,
}: PointListPaginationProps) {
  const router = useRouter();

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
