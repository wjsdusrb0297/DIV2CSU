import { createKysely } from '@vercel/postgres-kysely';
import { DB } from 'kysely-codegen';

export const kysely = createKysely<DB>();
