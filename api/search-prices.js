/**
 * Vercel Serverless Function — Bright Data SERP API Proxy
 * API key is read from environment variable BRIGHTDATA_KEY.
 * The frontend never sees or sends the key.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, provider = 'brightdata', gl = 'BD', hl = 'en', location = 'Dhaka Division,Bangladesh', num = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Read API key from environment variable
    const apiKey = process.env.BRIGHTDATA_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'BRIGHTDATA_KEY not configured on server. Add BRIGHTDATA_KEY to your environment variables.' });
    }

    if (provider === 'brightdata') {
      const googleQueryUrl = new URL('https://www.google.com.bd/search');
      googleQueryUrl.searchParams.set('q', query);
      googleQueryUrl.searchParams.set('brd_json', '1');
      googleQueryUrl.searchParams.set('gl', gl);
      googleQueryUrl.searchParams.set('hl', hl);
      if (location) {
        googleQueryUrl.searchParams.set('location', location);
      }

      const response = await fetch(`https://api.brightdata.com/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          zone: "serp_api1",
          url: googleQueryUrl.toString(),
          format: "json",
          data_format: "parsed",
          country: gl.toLowerCase()
        })
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => '');
        return res.status(response.status).json({
          error: `Bright Data error: ${response.status} ${errorData}`,
        });
      }

      const data = await response.json();
      let parsedBody = data;
      if (data.body) {
        try {
          parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        } catch (e) {
          console.error('Failed to parse Bright Data body:', e);
        }
      }
      
      const organicResults = parsedBody.organic || [];

      const results = organicResults.map((item) => {
        let price = 0;
        let priceFormatted = '';
        if (item.extensions) {
          for (const ext of item.extensions) {
            if (ext.type === 'text' && (ext.text.includes('BDT') || ext.text.includes('Tk') || ext.text.includes('৳') || ext.text.includes('$') || /\b\d{1,3}(,\d{3})*(\.\d{2})?\b/.test(ext.text))) {
              const numStr = ext.text.replace(/[^\d.]/g, '');
              const parsed = parseFloat(numStr);
              if (parsed > 0 && !price) {
                price = parsed;
                priceFormatted = ext.text;
              }
            }
          }
        }
        if (!price && (item.description || item.snippet || item.snippet_highlighted_words)) {
          const textToSearch = (item.description || '') + ' ' + (item.snippet || '') + ' ' + (item.snippet_highlighted_words?.join(' ') || '');
          const match = textToSearch.match(/(?:BDT|Tk|৳|Rs|\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i) || 
                        textToSearch.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:BDT|Tk|৳)/i);
          if (match) {
            const numStr = match[1].replace(/[^\d.]/g, '');
            const parsed = parseFloat(numStr);
            if (parsed > 0) {
              price = parsed;
              priceFormatted = match[0];
            }
          }
        }
        
        return {
          title: item.title || '',
          seller: item.source || (item.link ? new URL(item.link).hostname.replace('www.', '') : 'Unknown'),
          price: price,
          priceFormatted: priceFormatted,
          url: item.link || '',
          thumbnail: item.image || item.icon || '',
          rating: null,
          reviews: 0,
          delivery: '',
          stock: item.extensions?.some(e => e.text?.toLowerCase().includes('stock')) ? 'In Stock' : 'Unknown',
        };
      });

      return res.status(200).json({
        results,
        meta: {
          provider: 'brightdata',
          query,
          totalResults: results.length,
          searchId: data.general?.request_id || null,
        },
      });
    }

    return res.status(400).json({ error: `Unknown provider: ${provider}` });
  } catch (error) {
    console.error('Search proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
