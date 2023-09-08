import { Soldier } from '@/interfaces';
import { api } from '@/lib/instance';
import { UnverifiedUserCard } from './components';

export default async function ManageSignUpPage() {
  const data = await api
    .query({ unverifiedOnly: true })
    .get('/soldiers/search')
    .json<Pick<Soldier, 'name' | 'sn' | 'type'>[]>();
  return data.map((d) => (
    <UnverifiedUserCard
      key={d.sn}
      {...d}
    />
  ));
}
