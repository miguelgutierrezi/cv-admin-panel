/**
 * Development environment — public-safe config only.
 * Never put Sanity write tokens or private keys here.
 * Firebase web apiKey is public by design.
 */
export const environment = {
  production: false,
  /** Portfolio CV (sibling app on :4200) for local integration smoke. */
  portfolioUrl: 'http://localhost:4200',
  /**
   * Region for Firebase callable Functions (sanityWrite).
   * Write token stays on the server — not here.
   */
  functionsRegion: 'us-central1',
  sanity: {
    projectId: 'xm49cfca',
    dataset: 'production',
    apiVersion: '2025-01-01',
  },
  /**
   * Firebase web app "CV Admin Panel" on project miguel-angel-gutierrez-ibague.
   * Enable Email/Password in Console → Authentication → Sign-in method.
   * Create the single author user under Authentication → Users.
   */
  firebase: {
    apiKey: 'AIzaSyBDXihse3r17dDBwqzZZuQp7RmCxe7mekY',
    authDomain: 'miguel-angel-gutierrez-ibague.firebaseapp.com',
    projectId: 'miguel-angel-gutierrez-ibague',
    storageBucket: 'miguel-angel-gutierrez-ibague.firebasestorage.app',
    messagingSenderId: '104464044983',
    appId: '1:104464044983:web:32ae63da2d5a5270a80e32',
  },
  /**
   * Optional hard allow-list (single author). Empty = any Firebase Auth user.
   * Set to your admin email after creating the user in Console.
   */
  allowedAdminEmail: '',
};
