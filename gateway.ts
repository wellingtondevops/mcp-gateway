import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import express from 'express';
import 'dotenv/config';





const gatewayServer = new Server({
    name: "MCP Gateway",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {}
    }
})

const REGISTRY = [
    { id: '1', url: 'http://localhost:3000/mcp' },
    { id: '2', url: 'http://localhost:3001/mcp' },
    { id: '3', url: 'https://api.githubcopilot.com/mcp',headers:{
        Authorization:`Bearer ${process.env.GIT_KEY}`
    } },

    

]

const app = express();
app.use(express.json());

app.use('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });
    

    res.on('close', () => {
        transport.close();
    });

    gatewayServer.setRequestHandler(ListToolsRequestSchema, async () => {
        const allTools: Tool[] = []
        for (const reg of REGISTRY) {
            const proxyClient = new Client({
                name: `Proxy for ${reg.id}`,
                version: '1.0.0'
            })
            await proxyClient.connect(new StreamableHTTPClientTransport(new URL(reg.url),{
                requestInit:{
                    headers:reg.headers
                }
            }))
            const toolsRequest = await proxyClient.listTools()
            for (const tool of toolsRequest.tools) {
                allTools.push(tool)
            }
        }

        return {
            tools: allTools
        }


    })

    await gatewayServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
})
app.listen(8001, () => console.log('MCP Gateway is running on port 8001'))
