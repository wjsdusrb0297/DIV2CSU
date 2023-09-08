import './globals.css';
import type { Metadata } from 'next';
import { AntDesignRegistry } from './registry';
import { MenuLayout } from './MenuLayout';
import { fetchUserFromJwt } from './actions';

export const metadata: Metadata = {
  title: '전투근무지원대대',
  description: '제2신속대응사단 전투근무지원대대',
  authors: { name: 'Keyboard Warrior Club' },
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await fetchUserFromJwt();
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
