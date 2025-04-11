#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { takeScreenshot, ScreenshotOptions } from './screenshot.js';

interface McpScreenshotOptions {
  url: string;
  fullPage?: boolean;
}

class ScreenshotServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'screenshot-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {
            take_screenshot: {
              name: 'take_screenshot',
              description: 'Capture a screenshot of any web page or local GUI',
              inputSchema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL to capture (can be http://, https://, or file:///)',
                  },
                  fullPage: {
                    type: 'boolean',
                    description: 'Set to true only if you really need full page screenshot, defaults to false',
                  }
                },
                required: ['url'],
              },
            },
          },
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'take_screenshot',
          description: 'Capture a screenshot of any web page or local GUI',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to capture (can be http://, https://, or file:///)',
              },
              fullPage: {
                type: 'boolean',
                description: 'Set to true only if you really need full page screenshot, defaults to false',
              }
            },
            required: ['url'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'take_screenshot') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const options = request.params.arguments as unknown as McpScreenshotOptions;
      if (!options?.url) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'URL is required'
        );
      }
      
      try {
        const screenshot = await takeScreenshot({
          url: options.url,
          fullPage: options.fullPage
        });
        
        return {
          content: [
            {
              type: 'text',
              text: 'Screenshot has been copied to clipboard and Ctrl+V was simulated to paste it.'
            }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Screenshot error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Screenshot MCP server running on stdio');
  }
}

const server = new ScreenshotServer();
server.run().catch(console.error);
