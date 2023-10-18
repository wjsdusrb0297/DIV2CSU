'use client';

import { UserCard } from './components';
import { Card, Input, Pagination, Skeleton } from 'antd';
import { ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { fetchAllSoldiers } from './actions';
import { useRouter } from 'next/navigation';
import { listSoldiers } from '@/app/actions';

export default function ManageSoldiersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<
    Awaited<ReturnType<typeof fetchAllSoldiers>>[0] | null
  >(null);

  const [query, setQuery] = useState('');
  const [count, setCount] = useState(1);

  const onChangeQuery: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setQuery(event.target.value);
    },
    [],
  );

  const handlePagination = useCallback(
    (page: number) => {
      router.push(`/soldiers/list?page=${page}`);
    },
    [router],
  );

  useEffect(() => {
    listSoldiers({ query, page: parseInt(searchParams.page || '1', 10) }).then(
      ({ count, data }) => {
        setData(data);
        setCount(count);
      },
    );
  }, [query, searchParams.page]);

  return (
    <div className='flex flex-1 flex-col'>
      <Input
        placeholder='검색'
        onChange={onChangeQuery}
      />
      {data == null &&
        Array(10)
          .fill(0)
          .map((d, i) => (
            <Card key={`skeletion.${i}`}>
              <Skeleton paragraph={{ rows: 0 }} />
            </Card>
          ))}
      {data?.map((d) => (
        <UserCard
          key={d.sn}
          {...d}
        />
      ))}
      {true && (
        <Pagination
          className='mt-2 self-center'
          pageSize={10}
          total={count}
          current={parseInt(searchParams.page || '1', 10)}
          onChange={handlePagination}
        />
      )}
    </div>
  );
}
