/**
 * Professional PDF Report Generator for CST Analyzer
 * Generates a clean, print-ready statement-style PDF
 */

import { formatBDT, formatVariance, formatDate } from './formatters';

/**
 * Build the print-ready HTML for the PDF
 */
function buildPrintHTML(report) {
  const vendor = report.vendorInfo || {};
  const summary = report.summary || {};
  const items = report.items || [];
  const topNeg = report.topNegotiationItems || [];
  const altVendors = report.alternativeVendors || [];
  const negPoints = report.negotiationPoints || [];
  const counterOffer = report.counterOfferTotal || 0;

  const generatedDate = formatDate(report.generatedAt);
  const quotationDate = formatDate(vendor.quotationDate);

  // Status flag helpers
  const getFlagLabel = (flag) => flag?.label || 'N/A';
  const getFlagColor = (cssClass) => {
    switch (cssClass) {
      case 'overpriced': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'fair': return '#28a745';
      case 'good': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  // Build item rows for the summary table
  const itemSummaryRows = items.map((item, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${item.itemName || 'N/A'}</td>
      <td style="text-align:center;">${item.quantity} ${item.unit || 'pcs'}</td>
      <td style="text-align:right; font-family:'Courier New',monospace;">${formatBDT(item.unitPrice)}</td>
      <td style="text-align:right; font-family:'Courier New',monospace;">${formatBDT(item.medianMarketPrice)}</td>
      <td style="text-align:right; font-family:'Courier New',monospace;">${formatBDT(item.lowestMarketPrice)}</td>
      <td style="text-align:right; font-family:'Courier New',monospace; color:${item.variance > 5 ? '#dc3545' : item.variance < -5 ? '#28a745' : '#333'};">${formatVariance(item.variance)}</td>
      <td style="text-align:center; font-size:8.5px; font-weight:700; color:${getFlagColor(item.statusFlag?.cssClass)};">${getFlagLabel(item.statusFlag)}</td>
      <td style="text-align:right; font-family:'Courier New',monospace; color:#28a745;">${formatBDT(item.savingTotal)}</td>
    </tr>
  `).join('');

  // Build detail blocks for each item
  const itemDetails = items.map((item, i) => {
    const sourcesTable = (item.marketSources && item.marketSources.length > 0) ? `
      <table style="width:100%; border-collapse:collapse; margin-top:6px; font-size:9px;">
        <thead>
          <tr style="background:#f0f4f8;">
            <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:left;">#</th>
            <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:left;">Seller / Source</th>
            <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:right;">Price (BDT)</th>
            <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:center;">Stock Status</th>
          </tr>
        </thead>
        <tbody>
          ${item.marketSources.map((src, si) => `
            <tr>
              <td style="border:1px solid #d0d5dd; padding:3px 6px; text-align:center;">${si + 1}</td>
              <td style="border:1px solid #d0d5dd; padding:3px 6px;">${src.seller || 'N/A'}</td>
              <td style="border:1px solid #d0d5dd; padding:3px 6px; text-align:right; font-family:'Courier New',monospace;">${formatBDT(src.price)}</td>
              <td style="border:1px solid #d0d5dd; padding:3px 6px; text-align:center;">${src.stock || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p style="font-size:9px; color:#888; margin:4px 0;">No market sources available for this item.</p>';

    const noteSection = item.variance > 5 ? `
      <p style="font-size:9px; color:#dc3545; margin:6px 0 0 0; font-style:italic;">
        ⚠ Vendor price is ${Math.abs(item.variance).toFixed(1)}% above market median.${item.savingTotal > 0 ? ` Potential total saving of ${formatBDT(item.savingTotal)}.` : ''}${item.variance > 15 ? ' Strong negotiation case.' : ' Worth negotiating.'}
      </p>
    ` : '';

    return `
      <div style="margin-bottom:16px; page-break-inside:avoid;">
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#1a3a5c; color:#fff;">
            <td style="padding:6px 10px; font-weight:700; font-size:10px;" colspan="2">
              Item ${i + 1}: ${item.itemName || 'Unnamed Item'}
              <span style="float:right; font-size:9px; font-weight:700; color:#fff; letter-spacing:0.3px;">
                ${getFlagLabel(item.statusFlag)}
              </span>
            </td>
          </tr>
        </table>
        <table style="width:100%; border-collapse:collapse; font-size:9px;">
          <tr>
            <td style="border:1px solid #d0d5dd; padding:4px 8px; width:50%; background:#f8f9fa;"><strong>Specifications:</strong> ${[item.brand, item.sku, item.specs].filter(Boolean).join(', ') || 'N/A'}</td>
            <td style="border:1px solid #d0d5dd; padding:4px 8px; width:50%; background:#f8f9fa;"><strong>Quantity:</strong> ${item.quantity} ${item.unit || 'pcs'}</td>
          </tr>
        </table>
        <table style="width:100%; border-collapse:collapse; font-size:9px;">
          <tr>
            <td style="border:1px solid #d0d5dd; padding:4px 8px; width:50%;"><strong>Vendor Quoted (Unit):</strong></td>
            <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; font-family:'Courier New',monospace;">${formatBDT(item.unitPrice)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #d0d5dd; padding:4px 8px;"><strong>Lowest Market Price:</strong></td>
            <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; font-family:'Courier New',monospace; color:#28a745;">${formatBDT(item.lowestMarketPrice)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #d0d5dd; padding:4px 8px;"><strong>Median Market Price:</strong></td>
            <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; font-family:'Courier New',monospace;">${formatBDT(item.medianMarketPrice)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #d0d5dd; padding:4px 8px;"><strong>Highest Market Price:</strong></td>
            <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; font-family:'Courier New',monospace;">${formatBDT(item.highestMarketPrice)}</td>
          </tr>
          <tr style="background:#fff3cd;">
            <td style="border:1px solid #d0d5dd; padding:4px 8px;"><strong>Variance from Median:</strong></td>
            <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; font-family:'Courier New',monospace; font-weight:700; color:${item.variance > 5 ? '#dc3545' : item.variance < -5 ? '#28a745' : '#333'};">${formatVariance(item.variance)}</td>
          </tr>
          <tr style="background:#d4edda;">
            <td style="border:1px solid #d0d5dd; padding:4px 8px;"><strong>Potential Saving (Total):</strong></td>
            <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; font-family:'Courier New',monospace; font-weight:700; color:#28a745;">${formatBDT(item.savingTotal)}</td>
          </tr>
        </table>

        <div style="margin-top:6px;">
          <p style="font-size:9px; font-weight:700; margin:0 0 2px 0; color:#1a3a5c;">Market Price Sources:</p>
          ${sourcesTable}
        </div>
        ${noteSection}
      </div>
    `;
  }).join('');

  // Top negotiation items
  const topNegRows = topNeg.map((item, i) => `
    <tr>
      <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:center; font-weight:700;">${i + 1}</td>
      <td style="border:1px solid #d0d5dd; padding:4px 8px;">${item.name}</td>
      <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; color:#dc3545; font-weight:600;">${Math.abs(item.overpricePercent).toFixed(1)}%</td>
      <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; font-family:'Courier New',monospace;">${formatBDT(item.currentPrice)}</td>
      <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; font-family:'Courier New',monospace; color:#28a745;">${formatBDT(item.targetPrice)}</td>
      <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:right; font-family:'Courier New',monospace; font-weight:700; color:#28a745;">${formatBDT(item.totalSaving)}</td>
    </tr>
  `).join('');

  // Alt vendors
  const altVendorRows = altVendors.map((v, i) => `
    <tr>
      <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:center;">${i + 1}</td>
      <td style="border:1px solid #d0d5dd; padding:4px 8px; font-weight:600;">${v.name}</td>
      <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:center;">${v.itemsLowest}</td>
      <td style="border:1px solid #d0d5dd; padding:4px 8px; text-align:center;">${v.totalItems}</td>
    </tr>
  `).join('');

  // Recommendation styling
  const getRecBg = (rec) => {
    switch (rec) {
      case 'ACCEPT': return '#d4edda';
      case 'NEGOTIATE': return '#fff3cd';
      case 'REJECT': return '#f8d7da';
      default: return '#e2e3e5';
    }
  };
  const getRecColor = (rec) => {
    switch (rec) {
      case 'ACCEPT': return '#155724';
      case 'NEGOTIATE': return '#856404';
      case 'REJECT': return '#721c24';
      default: return '#383d41';
    }
  };

  return `
    <div id="pdf-report" style="
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #1a1a2e;
      background: #ffffff;
      padding: 30px 36px;
      font-size: 10px;
      line-height: 1.5;
      max-width: 210mm;
    ">

      <!-- ========== HEADER ========== -->
      <div style="border-bottom:3px solid #1a3a5c; padding-bottom:14px; margin-bottom:18px;">
        <table style="width:100%;">
          <tr>
            <td style="vertical-align:top;">
              <h1 style="margin:0; font-size:20px; color:#1a3a5c; font-weight:800; letter-spacing:-0.5px;">
                COMPARATIVE STATEMENT REPORT
              </h1>
              <p style="margin:3px 0 0 0; font-size:10px; color:#6c757d;">Vendor Quotation Analysis & Market Price Comparison</p>
            </td>
            <td style="vertical-align:top; text-align:right;">
              <p style="margin:0; font-size:9px; color:#6c757d;">Report ID</p>
              <p style="margin:0; font-size:11px; font-weight:700; color:#1a3a5c;">${report.id || 'N/A'}</p>
              <p style="margin:6px 0 0 0; font-size:9px; color:#6c757d;">Generated</p>
              <p style="margin:0; font-size:10px; font-weight:600;">${generatedDate}</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- ========== VENDOR INFORMATION ========== -->
      <div style="margin-bottom:18px; page-break-inside:avoid;">
        <h2 style="font-size:12px; color:#1a3a5c; border-bottom:1px solid #dee2e6; padding-bottom:4px; margin:0 0 8px 0;">
          VENDOR INFORMATION
        </h2>
        <table style="width:100%; border-collapse:collapse; font-size:9.5px;">
          <tr>
            <td style="padding:5px 10px; background:#f0f4f8; border:1px solid #d0d5dd; width:25%;"><strong>Vendor Name</strong></td>
            <td style="padding:5px 10px; border:1px solid #d0d5dd; width:25%;">${vendor.vendorName || 'N/A'}</td>
            <td style="padding:5px 10px; background:#f0f4f8; border:1px solid #d0d5dd; width:25%;"><strong>Quotation Ref</strong></td>
            <td style="padding:5px 10px; border:1px solid #d0d5dd; width:25%;">${vendor.quotationNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:5px 10px; background:#f0f4f8; border:1px solid #d0d5dd;"><strong>Quotation Date</strong></td>
            <td style="padding:5px 10px; border:1px solid #d0d5dd;">${quotationDate}</td>
            <td style="padding:5px 10px; background:#f0f4f8; border:1px solid #d0d5dd;"><strong>Payment Terms</strong></td>
            <td style="padding:5px 10px; border:1px solid #d0d5dd;">${vendor.paymentTerms || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:5px 10px; background:#f0f4f8; border:1px solid #d0d5dd;"><strong>Contact</strong></td>
            <td style="padding:5px 10px; border:1px solid #d0d5dd;">${vendor.vendorContact || 'N/A'}</td>
            <td style="padding:5px 10px; background:#f0f4f8; border:1px solid #d0d5dd;"><strong>Delivery Terms</strong></td>
            <td style="padding:5px 10px; border:1px solid #d0d5dd;">${vendor.deliveryTerms || 'N/A'}</td>
          </tr>
          ${vendor.vendorAddress ? `
          <tr>
            <td style="padding:5px 10px; background:#f0f4f8; border:1px solid #d0d5dd;"><strong>Address</strong></td>
            <td style="padding:5px 10px; border:1px solid #d0d5dd;" colspan="3">${vendor.vendorAddress}</td>
          </tr>` : ''}
        </table>
      </div>

      <!-- ========== EXECUTIVE SUMMARY ========== -->
      <div style="margin-bottom:18px; page-break-inside:avoid;">
        <h2 style="font-size:12px; color:#1a3a5c; border-bottom:1px solid #dee2e6; padding-bottom:4px; margin:0 0 8px 0;">
          EXECUTIVE SUMMARY
        </h2>
        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <tr>
            <td style="border:1px solid #d0d5dd; padding:8px 12px; text-align:center; width:25%; background:#f0f4f8;">
              <div style="font-size:8px; color:#6c757d; text-transform:uppercase;">Total Items</div>
              <div style="font-size:18px; font-weight:800; color:#1a3a5c;">${summary.totalItems || 0}</div>
            </td>
            <td style="border:1px solid #d0d5dd; padding:8px 12px; text-align:center; width:25%; background:#f0f4f8;">
              <div style="font-size:8px; color:#6c757d; text-transform:uppercase;">Quoted Value</div>
              <div style="font-size:14px; font-weight:700; color:#1a3a5c; font-family:'Courier New',monospace;">${formatBDT(summary.totalQuoted)}</div>
            </td>
            <td style="border:1px solid #d0d5dd; padding:8px 12px; text-align:center; width:25%; background:#f0f4f8;">
              <div style="font-size:8px; color:#6c757d; text-transform:uppercase;">Fair Market Value</div>
              <div style="font-size:14px; font-weight:700; color:#1a3a5c; font-family:'Courier New',monospace;">${formatBDT(summary.totalFairMarket)}</div>
            </td>
            <td style="border:1px solid #d0d5dd; padding:8px 12px; text-align:center; width:25%; background:#f8d7da;">
              <div style="font-size:8px; color:#6c757d; text-transform:uppercase;">Potential Overpayment</div>
              <div style="font-size:14px; font-weight:700; color:#dc3545; font-family:'Courier New',monospace;">${formatBDT(summary.totalPotentialSaving)}</div>
              <div style="font-size:9px; color:#dc3545;">${formatVariance(summary.overpaymentPercent)}</div>
            </td>
          </tr>
        </table>

        <!-- Status Distribution -->
        <table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:9px;">
          <tr>
            <td style="border:1px solid #d0d5dd; padding:5px 8px; text-align:center; background:#f8d7da;">
              <strong style="color:#dc3545;">🚨 Overpriced</strong><br/>${summary.counts?.overpriced || 0} of ${summary.totalItems}
            </td>
            <td style="border:1px solid #d0d5dd; padding:5px 8px; text-align:center; background:#fff3cd;">
              <strong style="color:#856404;">⚠️ Slightly High</strong><br/>${summary.counts?.slightlyHigh || 0} of ${summary.totalItems}
            </td>
            <td style="border:1px solid #d0d5dd; padding:5px 8px; text-align:center; background:#d4edda;">
              <strong style="color:#155724;">✅ Fair</strong><br/>${summary.counts?.fair || 0} of ${summary.totalItems}
            </td>
            <td style="border:1px solid #d0d5dd; padding:5px 8px; text-align:center; background:#d1ecf1;">
              <strong style="color:#0c5460;">💚 Good Deal</strong><br/>${summary.counts?.goodDeal || 0} of ${summary.totalItems}
            </td>
          </tr>
        </table>

        <!-- Recommendation -->
        <div style="margin-top:10px; padding:10px 14px; border-radius:4px; background:${getRecBg(summary.recommendation)}; border-left:4px solid ${getRecColor(summary.recommendation)};">
          <p style="margin:0; font-size:9px; text-transform:uppercase; color:${getRecColor(summary.recommendation)}; letter-spacing:0.5px;">Recommended Action</p>
          <p style="margin:2px 0; font-size:14px; font-weight:800; color:${getRecColor(summary.recommendation)};">${summary.recommendation || 'N/A'}</p>
          <p style="margin:4px 0 0 0; font-size:9px; color:${getRecColor(summary.recommendation)};">${summary.reasoning || ''}</p>
        </div>
      </div>

      <!-- ========== COMPARATIVE STATEMENT TABLE ========== -->
      <div style="margin-bottom:18px;">
        <h2 style="font-size:12px; color:#1a3a5c; border-bottom:1px solid #dee2e6; padding-bottom:4px; margin:0 0 8px 0;">
          COMPARATIVE STATEMENT — LINE ITEMS
        </h2>
        <table style="width:100%; border-collapse:collapse; font-size:8.5px;">
          <thead>
            <tr style="background:#1a3a5c; color:#ffffff;">
              <th style="border:1px solid #1a3a5c; padding:5px 6px; text-align:center; width:30px;">#</th>
              <th style="border:1px solid #1a3a5c; padding:5px 6px; text-align:left;">Item Description</th>
              <th style="border:1px solid #1a3a5c; padding:5px 6px; text-align:center;">Qty</th>
              <th style="border:1px solid #1a3a5c; padding:5px 6px; text-align:right;">Vendor Price</th>
              <th style="border:1px solid #1a3a5c; padding:5px 6px; text-align:right;">Market Median</th>
              <th style="border:1px solid #1a3a5c; padding:5px 6px; text-align:right;">Lowest Found</th>
              <th style="border:1px solid #1a3a5c; padding:5px 6px; text-align:center;">Variance</th>
              <th style="border:1px solid #1a3a5c; padding:5px 6px; text-align:center;">Status</th>
              <th style="border:1px solid #1a3a5c; padding:5px 6px; text-align:right;">Saving (Total)</th>
            </tr>
          </thead>
          <tbody>
            ${itemSummaryRows}
            <tr style="background:#f0f4f8; font-weight:700;">
              <td colspan="3" style="border:1px solid #d0d5dd; padding:5px 8px; text-align:right;">TOTALS</td>
              <td style="border:1px solid #d0d5dd; padding:5px 8px; text-align:right; font-family:'Courier New',monospace;">${formatBDT(summary.totalQuoted)}</td>
              <td style="border:1px solid #d0d5dd; padding:5px 8px; text-align:right; font-family:'Courier New',monospace;">${formatBDT(summary.totalFairMarket)}</td>
              <td style="border:1px solid #d0d5dd; padding:5px 8px;"></td>
              <td style="border:1px solid #d0d5dd; padding:5px 8px; text-align:center; font-family:'Courier New',monospace; color:#dc3545;">${formatVariance(summary.overpaymentPercent)}</td>
              <td style="border:1px solid #d0d5dd; padding:5px 8px;"></td>
              <td style="border:1px solid #d0d5dd; padding:5px 8px; text-align:right; font-family:'Courier New',monospace; color:#28a745;">${formatBDT(summary.totalPotentialSaving)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ========== DETAILED ITEM ANALYSIS ========== -->
      <div style="margin-bottom:18px;">
        <h2 style="font-size:12px; color:#1a3a5c; border-bottom:1px solid #dee2e6; padding-bottom:4px; margin:0 0 10px 0;">
          DETAILED ITEM ANALYSIS
        </h2>
        ${itemDetails}
      </div>

      <!-- ========== RECOMMENDATIONS ========== -->
      <div style="margin-bottom:18px; page-break-inside:avoid;">
        <h2 style="font-size:12px; color:#1a3a5c; border-bottom:1px solid #dee2e6; padding-bottom:4px; margin:0 0 8px 0;">
          RECOMMENDATIONS
        </h2>

        ${topNeg.length > 0 ? `
          <h3 style="font-size:10px; color:#1a3a5c; margin:8px 0 4px 0;">Priority Items for Negotiation</h3>
          <table style="width:100%; border-collapse:collapse; font-size:9px;">
            <thead>
              <tr style="background:#f0f4f8;">
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:center;">Priority</th>
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:left;">Item</th>
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:right;">Overpriced By</th>
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:right;">Current Price</th>
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:right;">Target Price</th>
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:right;">Potential Saving</th>
              </tr>
            </thead>
            <tbody>${topNegRows}</tbody>
          </table>
        ` : ''}

        ${altVendors.length > 0 ? `
          <h3 style="font-size:10px; color:#1a3a5c; margin:12px 0 4px 0;">Alternative Vendors Worth Contacting</h3>
          <table style="width:100%; border-collapse:collapse; font-size:9px;">
            <thead>
              <tr style="background:#f0f4f8;">
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:center;">#</th>
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:left;">Vendor Name</th>
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:center;">Lowest On</th>
                <th style="border:1px solid #d0d5dd; padding:4px 6px; text-align:center;">Total Items</th>
              </tr>
            </thead>
            <tbody>${altVendorRows}</tbody>
          </table>
        ` : ''}

        ${negPoints.length > 0 ? `
          <h3 style="font-size:10px; color:#1a3a5c; margin:12px 0 4px 0;">Negotiation Talking Points</h3>
          <ol style="font-size:9px; padding-left:18px; margin:0;">
            ${negPoints.map(p => `<li style="margin-bottom:4px;">${p}</li>`).join('')}
          </ol>
        ` : ''}

        <!-- Counter Offer Summary -->
        <div style="margin-top:12px; padding:12px 16px; background:#e8f5e9; border:2px solid #28a745; border-radius:4px; page-break-inside:avoid;">
          <h3 style="font-size:11px; margin:0 0 8px 0; color:#1a3a5c;">Suggested Counter-Offer</h3>
          <table style="width:100%; border-collapse:collapse; font-size:10px;">
            <tr>
              <td style="padding:4px 8px; width:33%;"><strong>Vendor Quoted:</strong></td>
              <td style="padding:4px 8px; font-family:'Courier New',monospace; font-size:13px; font-weight:700;">${formatBDT(summary.totalQuoted)}</td>
            </tr>
            <tr>
              <td style="padding:4px 8px;"><strong>Counter-Offer:</strong></td>
              <td style="padding:4px 8px; font-family:'Courier New',monospace; font-size:13px; font-weight:700; color:#28a745;">${formatBDT(counterOffer)}</td>
            </tr>
            <tr style="border-top:1px dashed #28a745;">
              <td style="padding:4px 8px;"><strong>Estimated Savings:</strong></td>
              <td style="padding:4px 8px; font-family:'Courier New',monospace; font-size:13px; font-weight:700; color:#dc3545;">${formatBDT((summary.totalQuoted || 0) - counterOffer)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- ========== DISCLAIMERS ========== -->
      <div style="margin-top:20px; padding:10px 14px; background:#f8f9fa; border:1px solid #dee2e6; border-radius:4px; page-break-inside:avoid;">
        <h3 style="font-size:9px; margin:0 0 4px 0; color:#6c757d; text-transform:uppercase; letter-spacing:0.5px;">Disclaimers & Limitations</h3>
        <ul style="font-size:8px; color:#6c757d; padding-left:14px; margin:0;">
          <li>Market prices are live at the time of this report and may fluctuate.</li>
          <li>Online prices often exclude: shipping, VAT, warranty, installation, after-sales service.</li>
          <li>For custom/imported items with no online match, physical market survey is recommended.</li>
          <li>Verify SKU compatibility and warranty terms before final purchase.</li>
          <li>This report is a decision-support tool, not a final purchase order.</li>
        </ul>
      </div>

      <!-- ========== FOOTER ========== -->
      <div style="margin-top:20px; padding-top:10px; border-top:2px solid #1a3a5c; text-align:center;">
        <p style="font-size:8px; color:#6c757d; margin:0;">
          Generated by <strong>CST-AI v1.0</strong> — Comparative Statement Auto-Generator  |  Report Date: ${generatedDate}
        </p>
        <p style="font-size:7px; color:#adb5bd; margin:4px 0 0 0;">
          This is a machine-generated report for internal use only. All data should be verified before making procurement decisions.
        </p>
      </div>

    </div>
  `;
}

/**
 * Export the report as a professionally formatted PDF
 */
export async function exportProfessionalPDF(report) {
  try {
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    // Build print HTML
    const printHTML = buildPrintHTML(report);

    // Create offscreen container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.background = '#ffffff';
    container.innerHTML = printHTML;
    document.body.appendChild(container);

    const element = container.firstElementChild;

    // Sanitize filename
    const vendorName = (report.vendorInfo?.vendorName || 'Unknown')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const pdfFilename = `CST-Report-${vendorName}-${dateStr}.pdf`;

    const opt = {
      margin: [8, 8, 12, 8],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');

    // Cleanup offscreen container
    document.body.removeChild(container);

    // Trigger download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdfFilename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (err) {
    console.error('PDF export failed:', err);
    throw err;
  }
}
