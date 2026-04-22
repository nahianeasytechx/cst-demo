/**
 * Central API Configuration
 * API keys are managed via environment variables on the server side.
 * The frontend calls the proxy endpoint which reads keys from process.env.
 */

const defaultConfig = {
  ocr: {
    activeProvider: 'tesseract', // 'tesseract' | 'google-vision' | 'ocr-space'
  },
  priceSearch: {
    activeProvider: 'brightdata', // 'brightdata' | 'serpapi' | 'google-cse' | 'custom'
  },
};

/**
 * Get the API config
 */
export function getApiConfig() {
  return { ...defaultConfig };
}

/**
 * Provider endpoint configurations
 */
export const PROVIDERS = {
  brightdata: {
    name: 'Bright Data',
    endpoint: '/api/search-prices',
    docsUrl: 'https://brightdata.com/products/serp-api',
  },
  tesseract: {
    name: 'Tesseract.js',
    description: 'Free, runs in browser. No API key needed.',
  },
};
