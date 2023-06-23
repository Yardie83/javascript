import { parse } from 'cookie';

import runtime from '../runtime';

type IsomorphicRequestOptions = (Request: Request, Headers: Headers) => Request;

export const createIsomorphicRequest = (cb: IsomorphicRequestOptions): Request => {
  return cb(runtime.Request as unknown as Request, runtime.Headers as unknown as Headers);
};

const decode = (str: string): string => {
  if (!str) {
    return str;
  }
  return str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
};

export const parseIsomorphicRequestCookies = (req: Request) => {
  const cookies = req.headers && req.headers?.get('cookie') ? parse(req.headers.get('cookie') as string) : {};
  return (key: string): string | undefined => {
    const value = cookies?.[key];
    if (value === undefined) {
      return undefined;
    }
    return decode(value);
  };
};
