'use client';

import { fetchPointTemplates } from '@/app/actions';
import { AutoComplete, Button, Input } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useEffect, useState } from 'react';

export type PointTemplatesInputProps = {
  onChange?: (reason: string, value?: number | null) => void;
};

export function PointTemplatesInput({ onChange }: PointTemplatesInputProps) {
  const [options, setOptions] = useState<DefaultOptionType[] | undefined>(
    undefined,
  );

  useEffect(() => {
    fetchPointTemplates().then((newData) => {
      setOptions(
        ['공통', '보급', '수송', '의무'].map((value) => ({
          label: value,
          options: newData
            .filter(({ unit }) =>
              value === '공통' ? unit == null : unit === value,
            )
            .map((row) => ({
              id: row.id,
              value: row.reason,
              label: (
                <div
                  onClick={() => {
                    onChange?.(row.reason);
                  }}
                  className='flex flex-row items-center'
                  key={row.id}
                >
                  <span className='flex-1'>{row.reason}</span>
                  {row.merit && (
                    <Button
                      onClick={() => {
                        onChange?.(row.reason, row.merit);
                      }}
                    >
                      {row.merit}
                    </Button>
                  )}
                  {row.demerit && (
                    <Button
                      className='ml-2'
                      onClick={() => {
                        onChange?.(row.reason, row.demerit);
                      }}
                    >
                      {row.demerit}
                    </Button>
                  )}
                  <div className='mx-2' />
                </div>
              ),
            })),
        })),
      );
    });
  }, [onChange]);

  return (
    <AutoComplete
      size='large'
      popupMatchSelectWidth={500}
      options={options}
    >
      <Input.Search
        size='large'
        placeholder='상벌점 템플릿'
      />
    </AutoComplete>
  );
}
