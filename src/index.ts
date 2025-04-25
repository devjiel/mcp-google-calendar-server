import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { listEvents } from "./handlers/calendar.js";
import { loadAndAuthorize } from "./handlers/auth.js";
import { fileURLToPath } from "url";
import path from "path";
const server = new McpServer(
  {
    name: "mcp-google-calendar",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Add list-events tool
server.tool(
  "list-events", 
  { startDate: z.string(), endDate: z.string() },
  async ({ startDate, endDate }) => {
    try {
      const events = await loadAndAuthorize((auth) => listEvents(auth, startDate, endDate));
      return { 
        content: [{ 
          type: "text", 
          text: events.length > 0 
            ? `Événements trouvés: ${JSON.stringify(events)}` 
            : "Aucun événement trouvé pour cette période."
        }] 
      };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Erreur: ${error.message}` }] };
    }
  }
);

// Connexion du transport
const transport = new StdioServerTransport();
await server.connect(transport);