import fetch from 'node-fetch';

async function testBrightData() {
  const query = 'Dell 15 DC15250 Core 3 100U 15.6" FHD Laptop';
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
      data_format: "parsed"
    })
  });

  const data = await response.json();
  if (data.body) {
     console.log('Body type:', typeof data.body);
     if (typeof data.body === 'string') {
        const bodyParsed = JSON.parse(data.body);
        console.log('Parsed body keys:', Object.keys(bodyParsed));
     } else {
        console.log('Body keys:', Object.keys(data.body));
     }
  }
}

testBrightData();
