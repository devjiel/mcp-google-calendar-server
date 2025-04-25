# MCP Google Calendar

A simple MCP (Messaging Control Protocol) server that interract with google calendar

## Features

- List Event

## Installation

```bash
# Install dependencies
npm install
```

## Usage

### Development

```bash
# Build server
npm run build
```

## Declare MCP server

```json
{
  "mcpServers": {
    "calendar": {
      "command": "node",
      "args": ["<absolute-path-to-project-folder>/dist/index.js"]
    }
  }
}
```