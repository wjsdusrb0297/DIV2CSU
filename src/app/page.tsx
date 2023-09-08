import { api } from '@/lib/instance';
import { MenuCard } from './components';

export default async function Home() {
  const data = await api.get('/soldiers').json();
  return <div></div>;
}
