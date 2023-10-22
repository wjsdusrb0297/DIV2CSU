import type { Metadata } from 'next';
import { MenuLayout } from './MenuLayout';
import { unauthenticated_currentSoldier } from './actions';
import './globals.css';
import { AntDesignRegistry } from './registry';

export const metadata: Metadata = {
  title: '병영생활 관리',
  description: '제2신속대응사단 병영생활 관리',
  authors: { name: 'Keyboard Warrior Club' },
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await unauthenticated_currentSoldier();
  return (
    <html lang='ko'>
      <body>
        <AntDesignRegistry>
          <MenuLayout data={data}>{children}</MenuLayout>
        </AntDesignRegistry>
      </body>
    </html>
  );
}
