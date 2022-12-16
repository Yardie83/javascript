import { type CreateBackendApiOptions, createBackendApiClient } from './api';
import { type CreateAuthenticateRequestOptions, createAuthenticateRequest } from './tokens';

export * from './api/resources';
export * from './tokens';
export * from './tokens/jwt';
export * from './tokens/verify';

export type ClerkOptions = CreateBackendApiOptions & Pick<CreateAuthenticateRequestOptions, 'jwtKey'>;

export default function Clerk(options: ClerkOptions) {
  const apiClient = createBackendApiClient(options);
  const requestState = createAuthenticateRequest({ ...options, apiClient });

  return {
    ...apiClient,
    ...requestState,
  };
}