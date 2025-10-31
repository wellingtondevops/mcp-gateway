import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import express from 'express';

const server = new McpServer({
    name: "My Server 1",
    version: "1.0.0",

});


server.registerTool('sum_number', {
    title: "Sum Number",
    description: "Sum two numbers together",
    inputSchema: {
        a: z.number().describe("The first number to add"),
        b: z.number().describe("The second number to add"),
    },
    outputSchema: {
        result: z.number().describe("The result of the Sum"),
    },
},
    async ({ a, b }) => {
        const output = { result: a + b };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output,
        }
    }
)


server.registerTool('subtract_number', {
    title: "Subtract Number",
    description: "Subtract two numbers together",
    inputSchema: {
        a: z.number().describe("The first number to add"),
        b: z.number().describe("The second number to add"),
    },
    outputSchema: {
        result: z.number().describe("The result of the Subtraction"),
    },
},
    async ({ a, b }) => {
        const output = { result: a - b };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output,
        }
    }
)

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

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

})

app.listen(3000, () => console.log('MCP Server 1 is running on port 3000'))