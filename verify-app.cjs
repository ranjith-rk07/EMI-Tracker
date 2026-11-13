const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runVerification() {
  const screenshotDir = path.resolve(__dirname, 'public/screenshots');
  const artifactDir = 'C:\\Users\\ranji\\.gemini\\antigravity\\brain\\ab18639c-6deb-44c5-bf3e-b352959397c9';
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('Launching Chromium with local Chrome...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Desktop Overview
  console.log('Capturing Desktop Overview...');
  const overviewPath = path.join(screenshotDir, 'desktop-overview.png');
  await page.screenshot({ path: overviewPath, fullPage: true });

  // 2. Plans & Detail Drawer
  console.log('Navigating to Payment plans...');
  await page.click('button:has-text("Payment plans")');
  await page.waitForTimeout(600);
  console.log('Opening Laptop EMI detail drawer...');
  await page.click('text=Laptop EMI');
  await page.waitForTimeout(600);
  const drawerPath = path.join(screenshotDir, 'desktop-plan-drawer.png');
  await page.screenshot({ path: drawerPath, fullPage: true });

  // Close drawer
  const closeBtn = page.locator('button:has(svg.lucide-x)').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(400);
  }

  // 3. Calendar View
  console.log('Navigating to Calendar...');
  await page.click('button:has-text("Calendar")');
  await page.waitForTimeout(600);
  const calendarPath = path.join(screenshotDir, 'desktop-calendar.png');
  await page.screenshot({ path: calendarPath, fullPage: true });

  // 4. Payment History View
  console.log('Navigating to Payment history...');
  await page.click('button:has-text("Payment history")');
  await page.waitForTimeout(600);
  const historyPath = path.join(screenshotDir, 'desktop-history.png');
  await page.screenshot({ path: historyPath, fullPage: true });

  // 5. Settings View
  console.log('Navigating to Settings...');
  await page.click('button:has-text("Settings")');
  await page.waitForTimeout(600);
  const settingsPath = path.join(screenshotDir, 'desktop-settings.png');
  await page.screenshot({ path: settingsPath, fullPage: true });

  // 6. Help & Support View
  console.log('Navigating to Help & support...');
  await page.click('button:has-text("Help & support")');
  await page.waitForTimeout(600);
  const helpPath = path.join(screenshotDir, 'desktop-help.png');
  await page.screenshot({ path: helpPath, fullPage: true });

  // 7. Auth Modal
  console.log('Opening Auth modal...');
  await page.click('button:has-text("Sign in / Sync")');
  await page.waitForTimeout(600);
  const authPath = path.join(screenshotDir, 'desktop-auth-modal.png');
  await page.screenshot({ path: authPath });

  // Close Auth Modal
  const modalClose = page.locator('button:has(svg.lucide-x)').first();
  if (await modalClose.isVisible()) {
    await modalClose.click();
    await page.waitForTimeout(400);
  }

  // 8. Mobile Viewport
  console.log('Switching to mobile viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const mobilePath = path.join(screenshotDir, 'mobile-overview.png');
  await page.screenshot({ path: mobilePath, fullPage: true });

  console.log('All screenshots captured successfully!');
  await browser.close();

  // Copy all screenshots to artifactDir for embedding
  const files = fs.readdirSync(screenshotDir);
  files.forEach(f => {
    fs.copyFileSync(path.join(screenshotDir, f), path.join(artifactDir, f));
  });
  console.log('Copied screenshots to artifact directory:', artifactDir);
}

runVerification().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});

