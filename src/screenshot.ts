import puppeteer from 'puppeteer';
import { launch as launchChrome } from 'chrome-launcher';
import sharp from 'sharp';
import { copyImg } from 'img-clipboard';
import { keyboard, Key } from '@nut-tree-fork/nut-js';

export interface ScreenshotOptions {
  url: string;
  fullPage?: boolean;
}

export async function takeScreenshot(options: ScreenshotOptions): Promise<void> {
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

      // Take screenshot in PNG format
      const screenshot = await page.screenshot({
        fullPage: options.fullPage || false,
        type: 'png'
      });

      // Process the image to optimize size while maintaining quality
      const processedImage = await sharp(screenshot)
        .resize(800, null, { // Resize width to 800px, maintain aspect ratio
          withoutEnlargement: true
        })
        .png({ // Keep as PNG for better quality
          quality: 80
        })
        .toBuffer();

      // Copy image to clipboard using native API
      const [err] = await copyImg(processedImage);
      if (err) {
        throw new Error(`Failed to copy image to clipboard: ${err}`);
      }
      
      // Simulate Command+V keypress on macOS, Ctrl+V on other platforms
      const isMac = process.platform === 'darwin';
      try {
        console.log(`Attempting to simulate ${isMac ? 'Command' : 'Ctrl'}+V on ${process.platform}`);
        if (isMac) {
          await keyboard.pressKey(Key.LeftCmd);
          await keyboard.pressKey(Key.V);
          await keyboard.releaseKey(Key.V);
          await keyboard.releaseKey(Key.LeftCmd);
        } else {
          await keyboard.pressKey(Key.LeftControl);
          await keyboard.pressKey(Key.V);
          await keyboard.releaseKey(Key.V);
          await keyboard.releaseKey(Key.LeftControl);
        }
        console.log('Key simulation completed successfully');
      } catch (error) {
        console.error('Failed to simulate key press:', error);
        // Don't throw error here as the image is already in clipboard
      }

      return;
    } finally {
      await browser.close();
    }
  } finally {
    // Make sure Chrome is killed
    await chrome.kill();
  }
} 