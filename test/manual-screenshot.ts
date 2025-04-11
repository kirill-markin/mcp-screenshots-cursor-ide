#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { takeScreenshot } from '../src/screenshot.js';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function takeTestScreenshot(url: string, fullPage: boolean = false) {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), 'test-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Generate filename based on URL and timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const urlSlug = url.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50);
  const filename = `${timestamp}-${urlSlug}.webp`;
  const outputPath = path.join(screenshotsDir, filename);

  try {
    console.log('Taking screenshot of:', url);
    console.log('Full page mode:', fullPage ? 'yes' : 'no');
    
    // Take screenshot using shared logic
    const screenshot = await takeScreenshot({
      url,
      fullPage
    });
    
    // Write the buffer directly to file
    fs.writeFileSync(outputPath, screenshot);

    console.log(`Screenshot saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error taking screenshot:', error);
    throw error;
  }
}

// Handle command line arguments
const url = process.argv[2];
const fullPage = process.argv.includes('--full-page');

if (!url) {
  console.error('Please provide a URL as an argument');
  console.error('Usage: node test/manual-screenshot.js <url> [--full-page]');
  process.exit(1);
}

// Validate URL format
try {
  new URL(url);
} catch (error) {
  console.error('Invalid URL format. Please provide a valid URL including protocol (e.g., https://www.example.com)');
  process.exit(1);
}

takeTestScreenshot(url, fullPage).catch((error) => {
  console.error('Failed to take screenshot:', error);
  process.exit(1);
}); 