import { listUnverifiedSoldiers } from '@/app/actions';
import { UnverifiedUserCardList } from './components';

export default async function ManageSignUpPage() {
  const { message, data } = await listUnverifiedSoldiers();
  return (
    <UnverifiedUserCardList
      data={data}
      message={message}
    />
  );
}
