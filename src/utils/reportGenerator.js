/**
 * Report generator — assembles full CST report data
 */
import { analyzeItem, generateExecutiveSummary } from './priceAnalysis';

/**
 * Generate negotiation talking points based on analyzed items
 */
export function generateNegotiationPoints(analyzedItems, vendorInfo) {
  const overpricedItems = analyzedItems
    .filter(item => item.statusFlag?.cssClass === 'overpriced' || item.statusFlag?.cssClass === 'high')
    .sort((a, b) => (b.variance || 0) - (a.variance || 0));

  const points = [];

  if (overpricedItems.length > 0) {
    const top = overpricedItems[0];
    points.push(
      `Market research shows your quoted price for ${top.itemName} is ${Math.abs(top.variance).toFixed(1)}% above current online market rate of BDT ${top.medianMarketPrice?.toLocaleString()} on ${top.marketSources?.[0]?.seller || 'multiple platforms'}.`
    );
  }

  if (overpricedItems.length > 1) {
    const second = overpricedItems[1];
    points.push(
      `We have alternative quotations available at BDT ${second.lowestMarketPrice?.toLocaleString()} for ${second.itemName} — we'd like to proceed with you if pricing is aligned.`
    );
  }

  points.push('Can you match or beat the lowest market price for bulk order?');

  return points;
}

/**
 * Get top items to negotiate
 */
export function getTopNegotiationItems(analyzedItems, count = 3) {
  return analyzedItems
    .filter(item => item.savingTotal > 0)
    .sort((a, b) => b.savingTotal - a.savingTotal)
    .slice(0, count)
    .map(item => ({
      name: item.itemName,
      overpricePercent: item.variance,
      targetPrice: item.lowestMarketPrice,
      currentPrice: Number(item.unitPrice),
      totalSaving: item.savingTotal,
    }));
}

/**
 * Get alternative vendors from market sources
 */
export function getAlternativeVendors(analyzedItems, count = 3) {
  const vendorMap = {};

  analyzedItems.forEach(item => {
    (item.marketSources || []).forEach(source => {
      if (!vendorMap[source.seller]) {
        vendorMap[source.seller] = {
          name: source.seller,
          url: source.url,
          itemsLowest: 0,
          totalItems: 0,
        };
      }
      vendorMap[source.seller].totalItems++;
      if (source.price === item.lowestMarketPrice) {
        vendorMap[source.seller].itemsLowest++;
      }
    });
  });

  return Object.values(vendorMap)
    .sort((a, b) => b.itemsLowest - a.itemsLowest)
    .slice(0, count);
}

/**
 * Generate complete CST Report
 */
export function generateFullReport(vendorInfo, lineItems) {
  const analyzedItems = lineItems.map(item => analyzeItem(item));
  const summary = generateExecutiveSummary(analyzedItems);
  const negotiationPoints = generateNegotiationPoints(analyzedItems, vendorInfo);
  const topItems = getTopNegotiationItems(analyzedItems);
  const altVendors = getAlternativeVendors(analyzedItems);

  const counterOfferTotal = analyzedItems.reduce(
    (sum, item) => sum + (item.lowestMarketPrice || Number(item.unitPrice)) * Number(item.quantity),
    0
  );

  return {
    vendorInfo,
    items: analyzedItems,
    summary,
    negotiationPoints,
    topNegotiationItems: topItems,
    alternativeVendors: altVendors,
    counterOfferTotal,
    generatedAt: new Date().toISOString(),
    version: 'CST-AI v1.0',
  };
}
