const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/"
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ data, statusCode: res.statusCode, headers: res.headers }));
    }).on('error', reject);
  });
}

async function testPicuki() {
  const hashtag = 'diwali';
  const url = `https://www.picuki.com/tag/${hashtag}`;
  console.log(`Fetching ${url}...`);
  
  const { data: html, statusCode, headers } = await fetch(url);
  console.log("Status Code:", statusCode);
  console.log("HTML Length:", html.length);
  
  if (html.includes("cloudflare") || html.includes("challenge-platform")) {
      console.log("🛑 Still blocked by Cloudflare challenge.");
  }

  // Check for thumbnails
  const thumbMatches = html.match(/src="(https:\/\/.*?\.cdninstagram\.com\/.*?)"/g);
  console.log("Thumbnail matches:", thumbMatches ? thumbMatches.length : 0);
  
  const postMatches = html.match(/<div class="photo">([\s\S]*?)<\/div>/g);
  console.log("Photo containers:", postMatches ? postMatches.length : 0);
}

testPicuki();
