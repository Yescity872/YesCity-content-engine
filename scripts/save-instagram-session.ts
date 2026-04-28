import { chromium } from "playwright";
import path from "path";
import fs from "fs";

async function saveSession() {
  const storageDir = path.join(process.cwd(), "storage");
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir);
  }

  const storagePath = path.join(storageDir, "instagram-auth.json");

  console.log("🚀 Launching browser for manual Instagram login...");
  
  let browser;
  try {
    // Try standard launch
    browser = await chromium.launch({ headless: false });
  } catch (err) {
    console.log("⚠️ Standard launch failed, trying with --no-sandbox...");
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.instagram.com/");

  console.log("--------------------------------------------------");
  console.log("PLEASE LOGIN MANUALLY IN THE BROWSER WINDOW.");
  console.log("The script will wait until you are fully logged in.");
  console.log("Once you see your home feed, wait a few seconds...");
  console.log("--------------------------------------------------");

  // Wait for an element that only appears when logged in
  try {
    // Look for common logged-in elements
    await page.waitForSelector("svg[aria-label='Home'], svg[aria-label='Direct'], img[data-testid='user-avatar']", { timeout: 300000 }); 
    console.log("✅ Login detected!");
    
    // Extra wait for storage to settle
    await page.waitForTimeout(5000);
    
    await context.storageState({ path: storagePath });
    console.log(`✨ Session saved to ${storagePath}`);
  } catch (err) {
    console.error("❌ Timeout waiting for login. Session not saved.");
  } finally {
    await browser.close();
  }
}

saveSession();
