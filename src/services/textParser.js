/**
 * Text Parser — Converts raw OCR text into structured vendor info + line items.
 * Uses regex/heuristic pattern matching to extract data from quotation documents.
 */

/**
 * Parse raw quotation text into structured data
 * @param {string} rawText - Raw OCR text
 * @returns {{ vendorInfo: Object, lineItems: Array, confidence: number, rawText: string }}
 */
export function parseQuotation(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { vendorInfo: {}, lineItems: [], confidence: 0, rawText: '' };
  }

  const text = rawText.trim();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const vendorInfo = extractVendorInfo(text, lines);
  const lineItems = extractLineItems(text, lines);

  // Calculate confidence based on how much data was extracted
  let confidence = 0;
  if (vendorInfo.vendorName) confidence += 20;
  if (vendorInfo.quotationNumber) confidence += 15;
  if (vendorInfo.quotationDate) confidence += 10;
  if (vendorInfo.vendorContact) confidence += 10;
  if (lineItems.length > 0) confidence += 25;
  if (lineItems.some(item => item.unitPrice > 0)) confidence += 20;

  return {
    vendorInfo,
    lineItems,
    confidence: Math.min(confidence, 100),
    rawText: text,
  };
}

/**
 * Extract vendor information from text
 */
function extractVendorInfo(text, lines) {
  const info = {
    vendorName: '',
    vendorAddress: '',
    vendorContact: '',
    quotationNumber: '',
    quotationDate: '',
    validityPeriod: '',
    paymentTerms: '',
    deliveryTerms: '',
  };

  // --- Vendor Name ---
  // Look for patterns like "Company:", "From:", "Vendor:", or first prominent line
  const namePatterns = [
    /(?:company|vendor|from|supplier|firm)\s*[:：]\s*(.+)/i,
    /(?:^|\n)([A-Z][A-Za-z\s&.,]+(?:Ltd|LLC|Inc|Co|Corp|Limited|Enterprise|Trading|Solutions|Technologies|Tech)\.?)/m,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      info.vendorName = match[1].trim();
      break;
    }
  }

  // --- Quotation Number ---
  const qnPatterns = [
    /(?:quotation|quote|ref|reference|invoice|proforma)\s*(?:no|number|#|ref)?\s*[:：#]\s*([A-Za-z0-9\-\/]+)/i,
    /(?:QTN|QUO|INV|REF|PF)\s*[-:]?\s*([A-Za-z0-9\-\/]+)/i,
  ];
  for (const pattern of qnPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.quotationNumber = match[1].trim();
      break;
    }
  }

  // --- Date ---
  const datePatterns = [
    /(?:date|dated)\s*[:：]\s*(\d{1,2}[\s\-\/\.]\w{3,9}[\s\-\/\.]\d{2,4})/i,
    /(?:date|dated)\s*[:：]\s*(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{2,4})/i,
    /(\d{1,2}[\-\/\.]\d{1,2}[\-\/\.]\d{4})/,
    /(\d{4}[\-\/\.]\d{1,2}[\-\/\.]\d{1,2})/,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      info.quotationDate = match[1].trim();
      break;
    }
  }

  // --- Phone/Contact ---
  const phonePatterns = [
    /(?:phone|tel|mobile|contact|cell)\s*[:：]\s*([+\d\s\-()]{8,})/i,
    /(\+?\d{1,3}[\s\-]?\d{3,5}[\s\-]?\d{3,8})/,
  ];
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      info.vendorContact = match[1].trim();
      break;
    }
  }

  // --- Address ---
  const addressPatterns = [
    /(?:address)\s*[:：]\s*(.+?)(?:\n|$)/i,
    /(\d+[\/\-]?\w?\s+[\w\s,]+(?:road|rd|street|st|lane|ln|avenue|ave|block|sector|area|sarani|nagar)[\w\s,]*)/i,
  ];
  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.vendorAddress = match[1].trim().substring(0, 200);
      break;
    }
  }

  // --- Payment Terms ---
  const paymentPatterns = [
    /(?:payment\s*terms?|payment)\s*[:：]\s*(.+?)(?:\n|$)/i,
    /(\d+%\s*advance.+?)(?:\n|$)/i,
  ];
  for (const pattern of paymentPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.paymentTerms = match[1].trim();
      break;
    }
  }

  // --- Delivery Terms ---
  const deliveryPatterns = [
    /(?:delivery|shipping|lead\s*time)\s*[:：]\s*(.+?)(?:\n|$)/i,
    /(?:within\s+\d+[\s\-]+(?:days?|weeks?).*?)(?:\n|$)/i,
  ];
  for (const pattern of deliveryPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.deliveryTerms = (match[1] || match[0]).trim();
      break;
    }
  }

  // --- Validity ---
  const validityPatterns = [
    /(?:validity|valid\s*(?:for|till|until))\s*[:：]?\s*(.+?)(?:\n|$)/i,
  ];
  for (const pattern of validityPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.validityPeriod = match[1].trim();
      break;
    }
  }

  return info;
}

/**
 * Extract line items from text
 */
function extractLineItems(text, lines) {
  const items = [];

  // Price patterns: BDT 128,000 | Tk. 32000 | ৳ 12,500 | $5,000 | 128000/-
  const priceRegex = /(?:BDT|Tk\.?|৳|\$|USD|EUR|€)\s*([\d,]+(?:\.\d{1,2})?)|(?:^|[\s(])([\d,]{3,}(?:\.\d{1,2})?)(?:\s*(?:\/\-|BDT|Tk|taka)|\s*$)/gi;

  // Quantity patterns: Qty: 5 | 5 pcs | ×3 | x10 | 5 nos | 5 units
  const qtyRegex = /(?:qty|quantity|nos?|units?|pcs?|sets?|boxes?|rolls?)\s*[:=]?\s*(\d+)|(\d+)\s*(?:pcs?|nos?|units?|sets?|boxes?|rolls?)/i;

  // Try to detect tabular format (numbered lines with items)
  const numberedLineRegex = /^(?:(\d+)[\s.):\-]+)(.+)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip headers and short lines
    if (line.length < 10) continue;
    if (/^(?:sl|s\.?n|item|description|product|unit|qty|rate|amount|total|sub|grand)/i.test(line)) continue;

    // Try numbered line format
    const numMatch = line.match(numberedLineRegex);
    if (numMatch) {
      const content = numMatch[2];
      const item = parseItemLine(content, lines, i);
      if (item && item.itemName) {
        items.push(item);
        continue;
      }
    }

    // Try to detect lines with prices
    const prices = extractPrices(line);
    if (prices.length > 0) {
      const item = parseItemLine(line, lines, i);
      if (item && item.itemName) {
        items.push(item);
      }
    }
  }

  return items;
}

/**
 * Parse a single line into a line item
 */
function parseItemLine(content, allLines, lineIndex) {
  // Extract price
  const prices = extractPrices(content);
  const unitPrice = prices.length > 0 ? prices[0] : 0;

  // Extract quantity
  const qtyMatch = content.match(
    /(?:qty|quantity)\s*[:=]?\s*(\d+)|(\d+)\s*(?:pcs?|nos?|units?|sets?|boxes?|rolls?)|[×x]\s*(\d+)/i
  );
  const quantity = qtyMatch
    ? parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3], 10)
    : 1;

  // Extract unit
  const unitMatch = content.match(/\b(pcs?|nos?|units?|sets?|boxes?|rolls?|pairs?|meters?|kg|ltr|bags?)\b/i);
  const unit = unitMatch ? normalizeUnit(unitMatch[1]) : 'pcs';

  // Clean item name: remove price, quantity, and unit patterns
  let itemName = content
    .replace(/(?:BDT|Tk\.?|৳|\$|USD|EUR|€)\s*[\d,]+(?:\.\d{1,2})?/gi, '')
    .replace(/[\d,]{4,}(?:\.\d{1,2})?\s*(?:\/\-)?/g, '')
    .replace(/(?:qty|quantity)\s*[:=]?\s*\d+/gi, '')
    .replace(/\d+\s*(?:pcs?|nos?|units?|sets?)\b/gi, '')
    .replace(/[×x]\s*\d+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Remove trailing punctuation
  itemName = itemName.replace(/[\s\-:,.;|]+$/, '').trim();

  if (itemName.length < 3) return null;

  // Try to extract brand (common patterns)
  const brandMatch = itemName.match(/^(Dell|HP|Samsung|Logitech|APC|D-Link|Canon|Epson|Lenovo|Asus|Acer|LG|Sony|Panasonic|Toshiba|Brother|Havells|Crompton|Orient|Walton)\b/i);
  const brand = brandMatch ? brandMatch[1] : '';

  return {
    id: `ocr-${Date.now()}-${lineIndex}`,
    itemName,
    sku: '',
    brand,
    specs: '',
    unit,
    quantity,
    unitPrice,
    currency: 'BDT',
    marketSources: [],
  };
}

/**
 * Extract numeric prices from text
 */
function extractPrices(text) {
  const prices = [];

  // BDT/Tk/৳ prefix
  const bdtMatches = text.matchAll(/(?:BDT|Tk\.?|৳)\s*([\d,]+(?:\.\d{1,2})?)/gi);
  for (const m of bdtMatches) {
    prices.push(parsePrice(m[1]));
  }

  // $ prefix
  const usdMatches = text.matchAll(/\$\s*([\d,]+(?:\.\d{1,2})?)/gi);
  for (const m of usdMatches) {
    prices.push(parsePrice(m[1]));
  }

  // Large number with /- suffix (common in BD)
  const slashMatches = text.matchAll(/([\d,]{4,})\s*\/\-/gi);
  for (const m of slashMatches) {
    prices.push(parsePrice(m[1]));
  }

  // Standalone large numbers (likely prices in context)
  if (prices.length === 0) {
    const numMatches = text.matchAll(/(?:^|[\s(:])([\d,]{4,}(?:\.\d{1,2})?)(?:[\s).,;]|$)/g);
    for (const m of numMatches) {
      const val = parsePrice(m[1]);
      if (val >= 100) prices.push(val); // Only consider reasonable price values
    }
  }

  return prices.filter(p => p > 0);
}

/**
 * Parse a price string to number
 */
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/,/g, '')) || 0;
}

/**
 * Normalize unit strings
 */
function normalizeUnit(unit) {
  const u = unit.toLowerCase();
  if (/^pcs?$/.test(u)) return 'pcs';
  if (/^nos?$/.test(u)) return 'pcs';
  if (/^units?$/.test(u)) return 'pcs';
  if (/^sets?$/.test(u)) return 'sets';
  if (/^box(es)?$/.test(u)) return 'box';
  if (/^rolls?$/.test(u)) return 'roll';
  if (/^pairs?$/.test(u)) return 'pair';
  if (/^meters?$/.test(u)) return 'meter';
  return u;
}
