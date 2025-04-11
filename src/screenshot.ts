import puppeteer from 'puppeteer';
import { launch as launchChrome } from 'chrome-launcher';
import sharp from 'sharp';

export interface ScreenshotOptions {
  url: string;
  fullPage?: boolean;
}

export async function takeScreenshot(options: ScreenshotOptions): Promise<Buffer> {
  // Launch Chrome using chrome-launcher
  const chrome = await launchChrome({
    chromeFlags: [
      '--headless=new',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu'
    ]
  });

  try {
    // Connect Puppeteer to the launched Chrome instance
    const browser = await puppeteer.connect({
      browserURL: `http://localhost:${chrome.port}`,
    });

    try {
      const page = await browser.newPage();
      
      // Set standard desktop viewport size (MacBook-like)
      await page.setViewport({
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
      });

      // Navigate to URL with better error handling
      try {
        await page.goto(options.url, {
          waitUntil: ['networkidle0', 'domcontentloaded', 'load'],  // Wait for everything to load
          timeout: 30000,
        });

        // Wait for any remaining network activity to settle
        await page.waitForNetworkIdle({
          timeout: 10000,
          idleTime: 1000
        });

        // Additional wait for any JavaScript animations or delayed renders
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Navigation failed:', error);
        throw error;
      }

      // Take screenshot in PNG format first for better quality
      const screenshot = await page.screenshot({
        fullPage: options.fullPage || false,
        type: 'png'
      });

      // Post-process the screenshot to minimize size while maintaining readability for LLM
      const processedImage = await sharp(screenshot)
        .resize(800, null, { // Resize width to 800px, maintain aspect ratio
          withoutEnlargement: true
        })
        .jpeg({ // Convert to JPEG for better LLM compatibility
          quality: 50,  // Balanced quality for LLM
          mozjpeg: true, // Use mozjpeg for better compression
          chromaSubsampling: '4:2:0' // Additional compression
        })
        .toBuffer();

      return processedImage;
    } finally {
      await browser.close();
    }
  } finally {
    // Make sure Chrome is killed
    await chrome.kill();
  }
} 