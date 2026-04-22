/**
 * Vercel Serverless Function — Gemini AI Search Grounding
 * API key is read from environment variable GEMINI_API_KEY.
 * The frontend never sees or sends the key.
 */

import { GoogleGenAI } from '@google/genai';

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
    const { query, location = 'Dhaka Division, Bangladesh' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Read API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server. Add GEMINI_API_KEY to your environment variables.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a product search assistant helping users in ${location}.
Your task is to search the web for the exact product specified by the user and return a list of available e-commerce products with their prices.
Rules:
1. ONLY return results from actual e-commerce or retail websites where the product can be purchased.
2. STRICTLY DO NOT include Facebook, social media, blogs, news articles, or informational websites.
3. For each product, extract: 
   - title (string)
   - seller (string, the e-commerce store name, e.g., Daraz, Star Tech, Pickaboo)
   - price (number, the parsed numeric value, e.g., 5500)
   - priceFormatted (string, the price with currency, e.g., "5,500 BDT")
   - url (string, the direct link to the product page. MUST be the original store URL like https://www.startech.com.bd/... DO NOT return vertexaisearch.cloud.google.com grounding redirect links!)
   - thumbnail (string, URL to the product image if available, otherwise an empty string)
   - stock (string, e.g., "In Stock" or "Unknown")
4. Format the output STRICTLY as a JSON array of objects. Do not include markdown code blocks like \`\`\`json. Return only the raw JSON array.
5. If you cannot find relevant e-commerce products, return an empty array [].
6. Make sure the currency is BDT (Tk) and you focus on stores operating in Bangladesh.`;

    let response;
    let retries = 3;
    let delay = 1500; // 1.5 seconds

    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: query }] }
          ],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.1,
            tools: [{ googleSearch: {} }],
          }
        });
        break; // Success, exit retry loop
      } catch (e) {
        if (e.status === 503 || (e.message && e.message.includes('503'))) {
          retries--;
          if (retries === 0) {
            throw new Error('GEMINI_503_OVERLOAD');
          }
          console.log(`Gemini API 503 Overload. Retrying in ${delay}ms...`);
          await new Promise(res => setTimeout(res, delay));
          delay += 1000; // Exponential backoff
        } else {
          throw e; // Unhandled error, throw immediately
        }
      }
    }

    const outputText = response.text || '';
    
    // Parse the JSON array from the response
    let results = [];
    try {
      // Find the first '[' and last ']' to extract JSON array in case there's extra text
      const startIdx = outputText.indexOf('[');
      const endIdx = outputText.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1) {
         const jsonStr = outputText.substring(startIdx, endIdx + 1);
         results = JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error('Failed to parse Gemini output:', outputText);
      return res.status(500).json({ error: 'Failed to parse AI response into structured data.' });
    }

    return res.status(200).json({
      results,
      meta: {
        provider: 'gemini',
        query,
        totalResults: results.length,
        searchId: `gemini-${Date.now()}`,
      },
    });

  } catch (error) {
    console.error('Search proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
