/**
 * Production environment — public-safe config only.
 * Never put Sanity write tokens or private keys here.
 */
export const environment = {
  production: true,
  portfolioUrl: 'https://miguelgutierrezi.github.io',
  /** Set to deployed Cloud Functions / proxy URL when Phase 3 ships. */
  proxyBaseUrl: '',
  sanity: {
    projectId: 'xm49cfca',
    dataset: 'production',
    apiVersion: '2025-01-01',
  },
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
  },
};
