import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:5173/api/search-prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'Dell 15 DC15250 Core 3 100U 15.6" FHD Laptop',
        provider: 'brightdata'
      })
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log(`Found ${data.results?.length} results.`);
    if (data.results && data.results.length > 0) {
       console.log('First result:', data.results[0].title);
       console.log('Price:', data.results[0].price);
    }
  } catch(e) {
    console.error(e);
  }
}

test();
