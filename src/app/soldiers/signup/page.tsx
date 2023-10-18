import { UnverifiedUserCardList } from './components';
import { listUnverifiedSoldiers } from '@/app/actions';

export default async function ManageSignUpPage() {
  const { message, data } = await listUnverifiedSoldiers();
  return (
    <UnverifiedUserCardList
      data={data}
      message={message}
    />
  );
}
