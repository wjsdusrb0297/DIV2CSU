import { cookies } from 'next/headers';
import wretch from 'wretch';
import { queryStringAddon } from 'wretch/addons';

export const api = wretch(
  process.env.NODE_ENV === 'production'
    ? process.env.API_PROD_URL
    : process.env.API_DEV_URL,
)
  .addon(queryStringAddon)
  .middlewares([
    (next) => (url, opts) => {
      opts.headers = { ...opts.headers };
      opts.headers.Authorization = `Bearer ${
        cookies().get('auth.access_token')?.value
      }`;
      return next(url, opts);
    },
  ]);
