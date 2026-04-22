import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually for this test script
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
const envLines = envContent.split('\n');
for (const line of envLines) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    process.env.GEMINI_API_KEY = line.substring('GEMINI_API_KEY='.length).trim();
  }
}

async function runTest(query) {
  console.log(`\n=== Testing Query: "${query}" ===`);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error("No valid GEMINI_API_KEY found in .env");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const location = 'Dhaka Division, Bangladesh';

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
   - url (string, the direct link to the product page)
   - thumbnail (string, URL to the product image if available, otherwise an empty string)
   - stock (string, e.g., "In Stock" or "Unknown")
4. Format the output STRICTLY as a JSON array of objects. Do not include markdown code blocks like \`\`\`json. Return only the raw JSON array.
5. If you cannot find relevant e-commerce products, return an empty array [].
6. Make sure the currency is BDT (Tk) and you focus on stores operating in Bangladesh.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: query }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        tools: [{ googleSearch: {} }],
      }
    });

    const outputText = response.text || '';
    
    let results = [];
    try {
      const startIdx = outputText.indexOf('[');
      const endIdx = outputText.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1) {
         const jsonStr = outputText.substring(startIdx, endIdx + 1);
         results = JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error('Failed to parse Gemini output:', outputText);
      return;
    }

    console.log(`Found ${results.length} products.`);
    results.forEach((r, i) => {
      console.log(`\nResult ${i + 1}:`);
      console.log(`- Title: ${r.title}`);
      console.log(`- Seller: ${r.seller}`);
      console.log(`- Price: ${r.priceFormatted} (${r.price})`);
      console.log(`- URL: ${r.url}`);
      console.log(`- Stock: ${r.stock}`);
      console.log(`- Image: ${r.thumbnail ? r.thumbnail : 'No image'}`);
    });

  } catch (err) {
    console.error("Error during API call:", err);
  }
}

async function main() {
  await runTest('dell 15 dc15250 laptop');
  await runTest('building cement 50kg bag price in bangladesh');
}

main();
