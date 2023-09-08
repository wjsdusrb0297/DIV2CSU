'use client';

import {
  AutoComplete,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import { useCallback, useEffect, useRef, useState } from 'react';
import { requestPoint, searchPossiblePointsGiver } from './actions';
import { useRouter } from 'next/navigation';

export default function RequestPointFormPage() {
  const [merit, setMerit] = useState(1);
  const [form] = Form.useForm();
  const router = useRouter();
  const query = Form.useWatch('giverId', { form, preserve: true });
  const [options, setOptions] = useState<{ name: string; sn: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const renderPlaceholder = useCallback(
    ({ name, sn }: { name: string; sn: string }) => (
      <div className='flex flex-row justify-between'>
        <span className='text-black'>{name}</span>
        <span className='text-black'>{sn}</span>
      </div>
    ),
    [],
  );

  useEffect(() => {
    setSearching(true);
    searchPossiblePointsGiver(query).then((value) => {
      setSearching(false);
      setOptions(value as any);
    });
  }, [query]);

  const handleSubmit = useCallback(
    async (form: any) => {
      if (!form?.givenAt?.$d) {
        setError('날짜를 입력해주세요');
      }
      try {
        setLoading(true);
        await requestPoint({
          ...form,
          value: merit * form.value,
          givenAt: (form.givenAt.$d as Date).toISOString(),
        });
        setLoading(false);
        message.success('상발점 요청을 성공적으로 했습니다');
        router.back();
      } catch (e) {
        if ((e as any)?.message) {
          setError(JSON.parse((e as any).message)?.message);
        }
        setLoading(false);
      }
    },
    [router, merit],
  );

  return (
    <div className='px-4'>
      <div className='my-5' />
      <Form
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          name='givenAt'
          label='받은 날짜'
          colon={false}
        >
          <DatePicker
            placeholder='상벌점을 받은 날짜를 선택해주세요'
            picker='date'
            inputReadOnly
            locale={locale}
          />
        </Form.Item>
        <Form.Item<string>
          label='수여자'
          name='giverId'
          rules={[
            { required: true, message: '수령자를 입력해주세요' },
            { pattern: /^[0-9]{2}-[0-9]{5,8}$/, message: '잘못된 군번입니다' },
          ]}
        >
          <AutoComplete
            options={options.map((t) => ({
              value: t.sn,
              label: renderPlaceholder(t),
            }))}
          >
            <Input.Search loading={searching} />
          </AutoComplete>
        </Form.Item>
        <Form.Item<number>
          name='value'
          rules={[
            { required: true, message: '상벌점을 입력해주세요' },
            // { min: 1, message: '최소 1점 이상이어야 합니다' },
            // { max: 15, message: '최대 15점 입니다' },
          ]}
        >
          <InputNumber
            min={1}
            max={15}
            controls
            addonAfter='점'
            type='number'
            inputMode='numeric'
            addonBefore={
              <Select
                value={merit}
                onChange={useCallback((value: number) => setMerit(value), [])}
              >
                <Select.Option value={1}>상점</Select.Option>
                <Select.Option value={-1}>벌점</Select.Option>
              </Select>
            }
          />
        </Form.Item>
        <Form.Item<string>
          name='reason'
          rules={[{ required: true, message: '지급이유를 입력해주세요' }]}
        >
          <Input.TextArea
            showCount
            maxLength={500}
            placeholder='상벌점 지급 이유'
            style={{ height: 150 }}
          />
        </Form.Item>
        {error && (
          <Form.Item>
            <span className='text-red-600'>{error}</span>
          </Form.Item>
        )}
        <Form.Item>
          <Button
            ghost={false}
            htmlType='submit'
            type='primary'
            loading={loading}
          >
            요청하기
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}