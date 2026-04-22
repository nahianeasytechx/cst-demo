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
    activeProvider: 'gemini', // 'gemini' | 'brightdata' | 'serpapi' | 'google-cse' | 'custom'
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
  gemini: {
    name: 'Gemini AI',
    endpoint: '/api/search-prices',
    docsUrl: 'https://ai.google.dev/docs',
  },
  tesseract: {
    name: 'Tesseract.js',
    description: 'Free, runs in browser. No API key needed.',
  },
};
