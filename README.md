# MCP Cursor Screenshot Server

A [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/mcp) server implementation specifically designed for Cursor IDE integration. This server not only captures screenshots of web pages or local HTML files but also automatically copies them to your clipboard and simulates paste action (Ctrl+V/Cmd+V) to instantly insert them into your active Cursor chat.

## Features

- Capture screenshots of any web page (HTTP/HTTPS URLs) or local HTML file (file:/// URLs)
- Optimized image processing for better quality and smaller file sizes
- Seamless Cursor IDE integration with automatic clipboard handling
- Automatic paste simulation (Ctrl+V on Windows/Linux, Cmd+V on macOS)
- Configurable full-page screenshot option
- Built on Puppeteer and Chrome for reliable rendering

## Requirements

- Node.js (version 18 or higher recommended)
- Chrome/Chromium browser installed on your system
- Operating system with clipboard support

## Installation

```bash
# Clone the repository
git clone https://github.com/kirill-markin/mcp-screenshots-cursor-ide
cd mcp-screenshots-cursor-ide

# Install dependencies
npm install
```

## Usage

### As an MCP Tool

This server implements the MCP protocol's tool interface, exposing a `take_screenshot` tool with the following parameters:

```typescript
{
  url: string;       // URL to capture (http://, https://, or file:///)
  fullPage?: boolean; // Capture full scrollable page (default: false)
}
```

### Running the Server

```bash
# Build the project
npm run build

# Run the MCP inspector for testing
npm run inspector
```

### Manual Testing

The repository includes a test script for manual screenshot testing:

```bash
# Take a screenshot of a specific URL
node build/test/manual-screenshot.js https://example.com

# Take a full-page screenshot
node build/test/manual-screenshot.js https://example.com --full-page
```

## Development

```bash
# Build the project
npm run build

# Watch mode (for development)
npm run watch
```

## How It Works

1. The server launches a headless Chrome instance using chrome-launcher
2. It navigates to the specified URL using Puppeteer
3. After the page is fully loaded, it captures a screenshot
4. The image is processed with Sharp for optimization
5. The screenshot is copied to the system clipboard
6. A paste command (Ctrl+V or Cmd+V) is automatically simulated to instantly paste the image into your active Cursor chat

## License

MIT
