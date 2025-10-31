import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import express from 'express';

const server = new McpServer({
    name: "My Server 2",
    version: "1.0.0",

});


server.registerTool('multiply_number', {
    title: "Multiply Number",
    description: "Multiply two numbers together",
    inputSchema: {
        a: z.number().describe("The first number to add"),
        b: z.number().describe("The second number to add"),
    },
    outputSchema: {
        result: z.number().describe("The result of the Multiplication"),
    },
},
    async ({ a, b }) => {
        const output = { result: a * b };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output,
        }
    }
)


server.registerTool('divide_number', {
    title: "Divide Number",
    description: "Divide two numbers together",
    inputSchema: {
        a: z.number().describe("The first number to add"),
        b: z.number().describe("The second number to add"),
    },
    outputSchema: {
        result: z.number().describe("The result of the Division"),
    },
},
    async ({ a, b }) => {
        const output = { result: a / b };
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

app.listen(3001, () => console.log('MCP Server 2 is running on port 3001'))