# Yatis MCP Server

## Overview
This is the MCP Server for Yatis Telematics. The MCP (Model Context Protocol) server allows you to integrate custom tools to an AI agent like Cursor, VS Code or Claude. This a NODE JS based MCP server that has to be run locally. 

It exposes the Yatis APIs for LLM agents to consume enabling a richer and flexible environment. User can access data using natural language and enable higher level integrations. 

It has been tested with VS Code Agent and Claude Desktop agent. 

To run it you will need an Yatis API key. Connect with your sales manager to access this.

## Requirements

It need Node version 20 and above

## Features

1. Get all Groups associated with the API token
2. Get all vehicles, device and meta information 
3. Get location information
4. For EVs get all battery information like voltage and SoC
5. Get distance travelled and power consumed data in the past
6. Get distance between 2 coordinates with Haversine


## Installation

`npm install @modelcontextprotocol/sdk`

There are no other dependancies

## Integration to VS Code

### Enable in workspace

To enable the MCP server in the workspace we have create a directory and a configuration file in that directory.

```
mkdir .vscode
cd .vscode
touch mcp.json

```

Make a directory called .vscode in you working directory, create a file called mcp.json and add the configuration below. Update the paths to you node and your API key

```javascript
{
    "servers": {
        "my-mcp-server-bfba9100": {
            "type": "stdio",
            "command": "/path/to/node",
            "args": [       
                "/path/to/server.js"
            ],
            "env": {
                "NODE_ENV": "development",
                "YATIS_API_KEY": <YOUR_KEY>
            },
        }
    }
}
```

### Global VScode

Add the configuration file in ~/.vscode to make it accessible across all directories

### Cursor

The global and local workspace will work for cursor also. The directories will be called .cursor. You can place the configuration file.

## Claude Integration

The MCP server can be added to Claude Desktop app. Find the file claude_desktop_config.json. In MAC they will be available at 

` 
~/Library/Application\ Support/Claude/claude_desktop_config.json







