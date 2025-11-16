// hooks/useMCP.ts
"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useCallback, useEffect } from "react";
import { callMCP } from "@/src/lib/mcp-client";

export function useMCP() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize MCP connection on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Initialize the MCP connection
        await callMCP(
          "initialize",
          {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
              name: "tick-tac-frontend",
              version: "1.0.0",
            },
          },
          token
        );

        // Send initialized notification
        await callMCP("notifications/initialized", {}, token);
        setInitialized(true);
      } catch (err) {
        console.error("Failed to initialize MCP:", err);
      }
    };

    initialize();
  }, [getToken]);

  const sendMCPRequest = useCallback(
    async (method: string, params: any = {}) => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error("Not authenticated");
        }

        const response = await callMCP(method, params, token);

        if (response.error) {
          throw new Error(response.error.message);
        }

        return response.result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  // Helper methods for common operations
  const listTools = useCallback(async () => {
    return sendMCPRequest("tools/list", {});
  }, [sendMCPRequest]);

  const callTool = useCallback(
    async (name: string, arguments_: any = {}) => {
      return sendMCPRequest("tools/call", {
        name,
        arguments: arguments_,
      });
    },
    [sendMCPRequest]
  );

  const listResources = useCallback(async () => {
    return sendMCPRequest("resources/list", {});
  }, [sendMCPRequest]);

  const readResource = useCallback(
    async (uri: string) => {
      return sendMCPRequest("resources/read", { uri });
    },
    [sendMCPRequest]
  );

  return {
    sendMCPRequest,
    listTools,
    callTool,
    listResources,
    readResource,
    loading,
    error,
    initialized,
  };
}
