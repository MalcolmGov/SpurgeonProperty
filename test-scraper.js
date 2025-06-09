const https = require('https');
const http = require('http');

async function testScraping() {
  console.log('Testing property scraping from Spurgeon Property...');
  
  try {
    // Test basic connectivity to Spurgeon Property
    const testUrl = 'https://www.spurgeonproperty.com/property-for-sale';
    
    const response = await new Promise((resolve, reject) => {
      https.get(testUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
    
    console.log('✓ Successfully connected to Spurgeon Property');
    console.log('Response length:', response.length);
    
    // Look for property-related content
    const propertyMatches = response.match(/property|listing|bedroom|bathroom|price/gi);
    console.log('Property-related keywords found:', propertyMatches ? propertyMatches.length : 0);
    
    // Extract some sample property URLs
    const urlMatches = response.match(/href="[^"]*property[^"]*"/gi);
    if (urlMatches) {
      console.log('Property URLs found:', urlMatches.slice(0, 5));
    }
    
    // Test our API endpoint directly
    console.log('\nTesting internal API...');
    
    const apiData = JSON.stringify({});
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/scrape-properties',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Property-Scraper-Test'
      }
    };

    const apiResponse = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ data, statusCode: res.statusCode, headers: res.headers }));
      });
      
      req.on('error', reject);
      req.write(apiData);
      req.end();
    });
    
    console.log('API Status:', apiResponse.statusCode);
    console.log('API Response type:', apiResponse.headers['content-type']);
    
    if (apiResponse.headers['content-type']?.includes('application/json')) {
      const result = JSON.parse(apiResponse.data);
      console.log('API Result:', result);
    } else {
      console.log('API returned HTML instead of JSON - routing issue detected');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testScraping();