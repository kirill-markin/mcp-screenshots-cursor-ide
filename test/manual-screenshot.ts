#!/usr/bin/env node
import { takeScreenshot } from '../src/screenshot.js';

async function takeTestScreenshot(url: string, fullPage: boolean = false) {
  try {
    console.log('Taking screenshot of:', url);
    console.log('Full page mode:', fullPage ? 'yes' : 'no');
    
    await takeScreenshot({
      url,
      fullPage
    });
    
    console.log('Screenshot has been copied to clipboard');
    return;
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