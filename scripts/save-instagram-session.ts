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
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.instagram.com/");

  console.log("--------------------------------------------------");
  console.log("PLEASE LOGIN MANUALLY IN THE BROWSER WINDOW.");
  console.log("The script will wait until you are fully logged in.");
  console.log("Once you see your home feed, wait a few seconds...");
  console.log("--------------------------------------------------");

  // Wait for an element that only appears when logged in (like the search icon or home icon)
  try {
    await page.waitForSelector("svg[aria-label='Home']", { timeout: 300000 }); // 5 minutes timeout
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
