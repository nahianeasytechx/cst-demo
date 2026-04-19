/**
 * Formatting utilities for the CST Analyzer
 */

const USD_TO_BDT = 122;

/**
 * Format number as BDT currency
 */
export function formatBDT(amount) {
  if (amount == null || isNaN(amount)) return 'BDT 0';
  return `BDT ${Number(amount).toLocaleString('en-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-BD');
}

/**
 * Convert USD to BDT
 */
export function usdToBDT(usd) {
  return Math.round(usd * USD_TO_BDT);
}

/**
 * Format a percentage with sign
 */
export function formatVariance(percent) {
  if (percent == null || isNaN(percent)) return '0%';
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  if (!date) return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Generate a short unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export { USD_TO_BDT };
