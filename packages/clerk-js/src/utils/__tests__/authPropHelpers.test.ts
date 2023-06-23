import { camelToSnake } from '@clerk/shared';

import { pickUrl } from '../authPropHelpers';

describe('pickUrl', () => {
  it('returns empty string if no values exist', () => {
    expect(pickUrl('afterSignInUrl', {})).toEqual('');
  });

  it('returns empty string if the value has a banned protocol', () => {
    expect(
      pickUrl('after_sign_in_url', [
        {
          after_sign_in_url: 'javascript:alert("hi")',
        },
      ]),
    ).toEqual('');
  });

  it('uses the formatter for all keys provided', () => {
    expect(
      pickUrl(
        'thisIsAKeyValue' as any,
        {
          this_is_a_key_value: '/value',
        },
        { formatter: camelToSnake },
      ),
    ).toEqual('/value');
  });

  describe('Priorities', () => {
    it('prioritizes by source', () => {
      expect(
        pickUrl(
          ['afterSignInUrl', 'after_sign_in_url'],
          [
            {
              after_sign_in_url: '/query_after_sign_in_url',
              redirect_url: '/query_redirect_url',
            },
            {
              afterSignInUrl: '/ctx_afterSignInUrl',
              redirectUrl: '/ctx_redirectUrl',
            },
            { afterSignInUrl: '/options_afterSignInUrl' },
            { afterSignInUrl: '/displayConfig_afterSignInUrl' },
          ],
        ),
      ).toEqual('/query_after_sign_in_url');
    });

    it('fallbacks to the second key if the first does not exist', () => {
      expect(
        pickUrl(
          ['afterSignInUrl', 'redirectUrl'],
          {
            redirect_url: '/query_redirect_url',
          },
          { formatter: camelToSnake },
        ),
      ).toEqual('/query_redirect_url');
    });
  });
});
