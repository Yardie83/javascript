import type { DisplayConfigResource } from '@clerk/types';
import qs from 'qs';

import { hasBannedProtocol, isValidUrl } from './url';

type PickUrlOptions = {
  validator?: (url: string) => boolean;
  formatter?: (url: string) => string;
};

export const pickUrl = (key: string | string[], source: Record<string, any>, opts?: PickUrlOptions): string => {
  const { validator = () => true, formatter } = opts || {};
  const keys = (Array.isArray(key) ? key : [key]).map(k => formatter?.(k) || k);
  const sources = Array.isArray(source) ? source : [source];

  let pickedUrl = '';
  sources.every(s => {
    keys.every(k => {
      const url = s[k];
      if (
        typeof url === 'string' &&
        validator(url) &&
        isValidUrl(url, { includeRelativeUrls: true }) &&
        !hasBannedProtocol(url)
      ) {
        pickedUrl = url;
      }
      return !pickedUrl;
    });
    return !pickedUrl;
  });

  return pickedUrl;
};

interface BuildAuthQueryStringArgs {
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  displayConfig: DisplayConfigResource;
}

export const buildAuthQueryString = (data: BuildAuthQueryStringArgs): string | null => {
  const parseValue = (field: keyof Omit<BuildAuthQueryStringArgs, 'displayConfig'>) => {
    const passed = data[field];
    if (!passed) {
      return undefined;
    }

    // We don't need to modify the query string at all
    // if the URL matches displayConfig
    if (passed === data.displayConfig[field]) {
      return undefined;
    }

    // Convert relative urls to absolute ones
    // Needed because auth modals the hosted pages sso-callback,
    // so an absolute redirectUrl is necessary
    if (passed.startsWith('/')) {
      return window.location.origin + passed;
    }

    return passed;
  };

  const parsedAfterSignInUrl = parseValue('afterSignInUrl');
  const parsedAfterSignUpUrl = parseValue('afterSignUpUrl');

  // Build the query string
  const query: Record<string, string> = {};
  if (parsedAfterSignInUrl && parsedAfterSignInUrl === parsedAfterSignUpUrl) {
    query.redirect_url = parsedAfterSignInUrl;
  } else {
    if (parsedAfterSignUpUrl) {
      query.after_sign_up_url = parsedAfterSignUpUrl;
    }
    if (parsedAfterSignInUrl) {
      query.after_sign_in_url = parsedAfterSignInUrl;
    }
  }
  return Object.keys(query).length === 0 ? null : qs.stringify(query);
};
