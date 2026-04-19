/**
 * Price analysis utilities matching the CST spec formulas
 */

/**
 * Calculate median of an array of numbers
 */
export function calculateMedian(prices) {
  if (!prices || prices.length === 0) return 0;
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate variance percentage
 * Formula: ((Vendor Price − Median) / Median) × 100
 */
export function calculateVariance(vendorPrice, medianPrice) {
  if (!medianPrice || medianPrice === 0) return 0;
  return ((vendorPrice - medianPrice) / medianPrice) * 100;
}

/**
 * Get status flag based on variance percentage
 * 
 * 💚 GOOD DEAL — Vendor price ≥5% below market median
 * ✅ FAIR — Within ±5% of market median
 * ⚠️ SLIGHTLY HIGH — 6%–15% above market median
 * 🚨 OVERPRICED — 15%+ above market median
 * ❓ UNVERIFIABLE — Less than 2 reliable market data points
 */
export function getStatusFlag(variancePercent, dataPointCount = 3) {
  if (dataPointCount < 2) {
    return { emoji: '❓', label: 'UNVERIFIABLE', color: 'var(--flag-unverifiable)', cssClass: 'unverifiable' };
  }
  if (variancePercent <= -5) {
    return { emoji: '💚', label: 'GOOD DEAL', color: 'var(--flag-good)', cssClass: 'good' };
  }
  if (variancePercent >= -5 && variancePercent <= 5) {
    return { emoji: '✅', label: 'FAIR', color: 'var(--flag-fair)', cssClass: 'fair' };
  }
  if (variancePercent > 5 && variancePercent <= 15) {
    return { emoji: '⚠️', label: 'SLIGHTLY HIGH', color: 'var(--flag-high)', cssClass: 'high' };
  }
  return { emoji: '🚨', label: 'OVERPRICED', color: 'var(--flag-overpriced)', cssClass: 'overpriced' };
}

/**
 * Calculate savings
 */
export function calculateSaving(vendorPrice, lowestPrice, quantity) {
  const perUnit = Math.max(0, vendorPrice - lowestPrice);
  return {
    perUnit,
    total: perUnit * quantity,
  };
}

/**
 * Analyze a single item with its market prices
 */
export function analyzeItem(item) {
  const marketPrices = (item.marketSources || [])
    .map(s => Number(s.price))
    .filter(p => p > 0);

  if (marketPrices.length === 0) {
    return {
      ...item,
      lowestMarketPrice: 0,
      highestMarketPrice: 0,
      medianMarketPrice: 0,
      variance: 0,
      statusFlag: getStatusFlag(0, 0),
      savingPerUnit: 0,
      savingTotal: 0,
    };
  }

  const lowest = Math.min(...marketPrices);
  const highest = Math.max(...marketPrices);
  const median = calculateMedian(marketPrices);
  const variance = calculateVariance(Number(item.unitPrice), median);
  const statusFlag = getStatusFlag(variance, marketPrices.length);
  const saving = calculateSaving(Number(item.unitPrice), lowest, Number(item.quantity));

  return {
    ...item,
    lowestMarketPrice: lowest,
    highestMarketPrice: highest,
    medianMarketPrice: median,
    variance,
    statusFlag,
    savingPerUnit: saving.perUnit,
    savingTotal: saving.total,
  };
}

/**
 * Generate executive summary from analyzed items
 */
export function generateExecutiveSummary(analyzedItems) {
  const totalQuoted = analyzedItems.reduce(
    (sum, item) => sum + Number(item.unitPrice) * Number(item.quantity),
    0
  );

  const totalFairMarket = analyzedItems.reduce(
    (sum, item) => sum + (item.medianMarketPrice || Number(item.unitPrice)) * Number(item.quantity),
    0
  );

  const totalPotentialSaving = analyzedItems.reduce(
    (sum, item) => sum + (item.savingTotal || 0),
    0
  );

  const overpaymentPercent = totalFairMarket > 0
    ? ((totalQuoted - totalFairMarket) / totalFairMarket) * 100
    : 0;

  const counts = {
    overpriced: 0,
    slightlyHigh: 0,
    fair: 0,
    goodDeal: 0,
    unverifiable: 0,
  };

  analyzedItems.forEach(item => {
    switch (item.statusFlag?.cssClass) {
      case 'overpriced': counts.overpriced++; break;
      case 'high': counts.slightlyHigh++; break;
      case 'fair': counts.fair++; break;
      case 'good': counts.goodDeal++; break;
      case 'unverifiable': counts.unverifiable++; break;
    }
  });

  // Determine recommendation
  let recommendation = 'ACCEPT';
  let reasoning = '';

  if (totalPotentialSaving > 5000) {
    if (counts.overpriced >= 3) {
      recommendation = 'REJECT';
      reasoning = `Multiple items (${counts.overpriced}) are significantly overpriced with potential savings of BDT ${totalPotentialSaving.toLocaleString()}. Recommend seeking alternative vendors or aggressive negotiation.`;
    } else if (counts.overpriced >= 1) {
      recommendation = 'NEGOTIATE';
      reasoning = `${counts.overpriced} item(s) are overpriced and ${counts.slightlyHigh} slightly high. Total potential savings of BDT ${totalPotentialSaving.toLocaleString()} justify negotiation before acceptance.`;
    } else {
      recommendation = 'NEGOTIATE';
      reasoning = `While no items are severely overpriced, cumulative savings of BDT ${totalPotentialSaving.toLocaleString()} are achievable through negotiation on slightly elevated prices.`;
    }
  } else if (counts.overpriced === 0 && counts.slightlyHigh <= 1) {
    recommendation = 'ACCEPT';
    reasoning = 'Pricing is competitive and aligned with market rates. Minimal savings achievable through negotiation.';
  } else {
    recommendation = 'NEGOTIATE';
    reasoning = `Some items are above market rate. Potential savings of BDT ${totalPotentialSaving.toLocaleString()} are worth pursuing.`;
  }

  return {
    totalItems: analyzedItems.length,
    totalQuoted,
    totalFairMarket,
    totalPotentialSaving,
    overpaymentPercent,
    counts,
    recommendation,
    reasoning,
  };
}
