'use client';

import {
  createPoint,
  searchPointsGiver,
  searchPointsReceiver,
} from '@/app/actions';
import {
  App,
  AutoComplete,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd';
import locale from 'antd/es/date-picker/locale/ko_KR';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PointTemplatesInput } from '../components';
import { checkIfNco } from '../give/actions';

export type ManagePointFormProps = {
  type: 'request' | 'give';
};

export function ManagePointForm({ type }: ManagePointFormProps) {
  const [merit, setMerit] = useState(1);
  const [form] = Form.useForm();
  const router = useRouter();
  const query = Form.useWatch(type === 'request' ? 'giverId' : 'receiverId', {
    form,
    preserve: true,
  });
  const [options, setOptions] = useState<{ name: string; sn: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { message } = App.useApp();

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
    if (type === 'give') {
      checkIfNco();
    }
  }, [type]);

  useEffect(() => {
    setSearching(true);
    if (type === 'request') {
      searchPointsGiver(query || '').then((value) => {
        setSearching(false);
        setOptions(value as any);
      });
    } else {
      searchPointsReceiver(query || '').then((value) => {
        setSearching(false);
        setOptions(value as any);
      });
    }
  }, [query, type]);

  const handleSubmit = useCallback(
    async (newForm: any) => {
      await form.validateFields();
      setLoading(true);
      createPoint({
        ...newForm,
        value: merit * newForm.value,
        givenAt: (newForm.givenAt.$d as Date).toISOString(),
      })
        .then(({ message: newMessage }) => {
          if (newMessage) {
            message.error(newMessage);
          }
          message.success(
            type === 'request'
              ? '상벌점 요청을 성공적으로 했습니다'
              : '상벌점을 성공적으로 부여했습니다',
          );
          router.push('/points');
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [router, merit, form, message, type],
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
          rules={[{ required: true, message: '받은 날짜를 입력해주세요' }]}
        >
          <DatePicker
            placeholder='상벌점을 받은 날짜를 선택해주세요'
            picker='date'
            inputReadOnly
            locale={locale}
          />
        </Form.Item>
        <Form.Item<string>>
          <PointTemplatesInput
            onChange={(reason, value) => {
              form.setFieldValue('reason', reason);
              if (value) {
                setMerit(() => (value > 0 ? 1 : -1));
                form.setFieldValue('value', Math.abs(value));
              }
            }}
          />
        </Form.Item>
        <Form.Item<string>
          label={type === 'request' ? '수여자' : '수령자'}
          name={type === 'request' ? 'giverId' : 'receiverId'}
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
            { min: 1, message: '상벌점은 최소 1점입니다' },
          ]}
        >
          <InputNumber
            min={1}
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
        <Form.Item>
          <Button
            ghost={false}
            htmlType='submit'
            type='primary'
            loading={loading}
          >
            {type === 'request' ? '요청하기' : '부여하기'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
