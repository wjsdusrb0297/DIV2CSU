import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';
import { PlanetScaleDialect } from 'kysely-planetscale';

export const kysely = new Kysely<DB>({
  dialect: new PlanetScaleDialect({
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  }),
});
