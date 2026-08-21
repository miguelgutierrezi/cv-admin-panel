/**
 * Production environment — public-safe config only.
 * Never put Sanity write tokens or private keys here.
 */
export const environment = {
  production: true,
  portfolioUrl: 'https://miguel-angel-gutierrez-ibague.web.app',
  functionsRegion: 'us-central1',
  sanity: {
    projectId: 'xm49cfca',
    dataset: 'production',
    apiVersion: '2025-01-01',
  },
  firebase: {
    apiKey: 'AIzaSyBDXihse3r17dDBwqzZZuQp7RmCxe7mekY',
    authDomain: 'miguel-angel-gutierrez-ibague.firebaseapp.com',
    projectId: 'miguel-angel-gutierrez-ibague',
    storageBucket: 'miguel-angel-gutierrez-ibague.firebasestorage.app',
    messagingSenderId: '104464044983',
    appId: '1:104464044983:web:32ae63da2d5a5270a80e32',
  },
  allowedAdminEmail: '',
};
