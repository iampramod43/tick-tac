// lib/mcp-client.ts

interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export async function callMCP(
  method: string,
  params: any = {},
  token: string
): Promise<MCPResponse> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://tick-tac-api.vercel.app"
      : "http://localhost:3001");

  const request: MCPRequest = {
    jsonrpc: '2.0',
    id: Date.now(), // or use a counter
    method,
    params,
  };

  const response = await fetch(`${apiUrl}/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`MCP request failed: ${response.statusText}`);
  }

  return await response.json();
}

