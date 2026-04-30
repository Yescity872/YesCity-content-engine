// Using native fetch

async function validateRSS() {
  const country = "IN";
  const RSS_URL = `https://trends.google.com/trending/rss?geo=${country}`;
  
  console.log(`[Validation] Attempting RSS Fetch: ${RSS_URL}`);
  
  try {
    const response = await fetch(RSS_URL);
    if (!response.ok) {
      console.error(`[Validation] RSS Failed. HTTP Status: ${response.status}`);
      return;
    }

    const xmlData = await response.text();
    console.log(`[Validation] RSS Received. Length: ${xmlData.length} chars`);

    const items = xmlData.split("<item>").slice(1);
    console.log(`[Validation] Items Found: ${items.length}`);

    if (items.length > 0) {
      const firstItem = items[0];
      const title = firstItem.match(/<title>(.*?)<\/title>/)?.[1];
      const traffic = firstItem.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1];
      
      console.log(`[Validation] TEST SUCCESS`);
      console.log(`[Validation] First Trend: ${title}`);
      console.log(`[Validation] First Traffic: ${traffic}`);
    } else {
      console.error(`[Validation] RSS Parse Failed: No <item> tags found.`);
    }
  } catch (e) {
    console.error(`[Validation] Error:`, e);
  }
}

validateRSS();
