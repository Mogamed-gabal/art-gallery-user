/**
 * Runtime Configuration for Anas Ya3qub Art Gallery Storefront
 * Easily customized in production without recompiling Angular.
 */
window.__APP_CONFIG__ = {
  apiBaseUrl: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3005/api/v1'
    : (window.__APP_CONFIG__?.apiBaseUrl || '/api/v1')
};
