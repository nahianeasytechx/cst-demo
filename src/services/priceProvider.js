/**
 * Price Search Provider — Abstracts market price search behind a single interface.
 * All searches go through the serverless proxy which holds the API key server-side.
 */

import { getApiConfig } from './apiConfig';

/**
 * Search for market prices of a product
 * @param {string} query - Product name/description to search
 * @param {Object} options - Search options
 * @param {string} options.gl - Country code (default: 'us')
 * @param {string} options.hl - Language (default: 'en')
 * @param {number} options.num - Number of results (default: 10)
 * @returns {Promise<{results: Array, meta: Object}>}
 */
export async function searchPrices(query, options = {}) {
  const config = getApiConfig();
  const provider = config.priceSearch.activeProvider;

  const { gl = 'BD', hl = 'en', num = 10 } = options;

  const response = await fetch('/api/search-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      provider,
      gl,
      hl,
      num,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      throw new Error('GEMINI_API_KEY_INVALID');
    }
    if (response.status === 429) {
      throw new Error('GEMINI_RATE_LIMIT');
    }
    if (response.status === 500 && errorData.error?.includes('GEMINI_API_KEY')) {
      throw new Error('GEMINI_API_KEY_MISSING');
    }
    if (response.status === 500 && errorData.error?.includes('GEMINI_503_OVERLOAD')) {
      throw new Error('GEMINI_503_OVERLOAD');
    }

    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Price search is available when the server has the API key configured.
 * We can't check from the frontend — just return true and let the server error.
 */
export function isPriceSearchConfigured() {
  return true;
}
