import { Card } from 'antd';
import Link from 'next/link';

export type UserCardProps = {
  sn: string;
  name: string;
  type: string;
};

export function UserCard({ type, sn, name }: UserCardProps) {
  return (
    <Link href={`/soldiers?sn=${sn}`}>
      <Card className='my-1 mx-1'>
        <div className='flex flex-row items-center justify-between'>
          <p className='font-bold'>
            {type === 'enlisted' ? '용사' : '간부'} {name}
          </p>
          <p>{'**-' + '*'.repeat(sn.length - 6) + sn.slice(-3)}</p>
        </div>
      </Card>
    </Link>
  );
}
