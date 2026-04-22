import fetch from 'node-fetch';

async function testBrightData() {
  const query = 'startech Dell 15 DC15250 Core 3 100U 15.6" FHD Laptop';
  const apiKey = '4e7796b5-4047-42dd-9307-f41a70ed2ce4';

  const googleQueryUrl = new URL('https://www.google.com.bd/search');
  googleQueryUrl.searchParams.set('q', query);
  googleQueryUrl.searchParams.set('brd_json', '1');
  googleQueryUrl.searchParams.set('gl', 'BD');
  googleQueryUrl.searchParams.set('hl', 'en');
  googleQueryUrl.searchParams.set('location', 'Dhaka Division,Bangladesh');

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
      country: "bd"
    })
  });

  const data = await response.json();
  let parsedBody = data;
  if (data.body) {
    try {
      parsedBody = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    } catch (e) {}
  }
  const organicResults = parsedBody.organic || [];
  
  console.log(`Found ${organicResults.length} organic results`);
  for (let i = 0; i < Math.min(3, organicResults.length); i++) {
     const item = organicResults[i];
     console.log(`${i+1}. ${item.title}`);
     console.log(`   URL: ${item.link}`);
     console.log(`   Desc: ${item.description || item.snippet}`);
     console.log(`   Ext: ${JSON.stringify(item.extensions)}`);
  }
}

testBrightData();
