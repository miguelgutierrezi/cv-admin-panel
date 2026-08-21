/**
 * Development environment — public-safe config only.
 * Never put Sanity write tokens or private keys here.
 */
export const environment = {
  production: false,
  /** Portfolio CV (sibling app on :4200) for local integration smoke. */
  portfolioUrl: 'http://localhost:4200',
  /** Write proxy base URL (Cloud Functions). Empty until Phase 3. */
  proxyBaseUrl: '',
  sanity: {
    projectId: 'xm49cfca',
    dataset: 'production',
    apiVersion: '2025-01-01',
  },
  /**
   * Firebase web config is public by design.
   * Fill when Phase 2 Auth is wired; leave empty until then.
   */
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
  },
};
