"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, X, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";
import SiriOrb from "@/src/components/smoothui/siri-orb";
import { MarkdownRenderer } from "@/src/components/notes/MarkdownRenderer";
import { useFocusCompass, EnergyLevel } from "@/src/hooks/useFocusCompass";
import { useFlowModeContext } from "@/src/context/FlowModeContext";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function TikkuChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm Tikku, your AI assistant. I can help you manage tasks, create lists, and more. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { getToken } = useAuth();
  const { updateEnergy } = useFocusCompass();
  const { startFlow, isActive } = useFlowModeContext();
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Parse and execute action commands from response
  const parseAndExecuteActions = async (
    responseText: string
  ): Promise<string> => {
    let processedText = responseText;

    // Extract JSON action objects from the response using a more robust pattern
    // Matches: { "action": "...", "parameters": { ... } }
    const actionPattern =
      /\{\s*"action"\s*:\s*"([^"]+)"\s*,\s*"parameters"\s*:\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})\s*\}/g;
    const actions: Array<{
      action: string;
      parameters: Record<string, unknown>;
    }> = [];

    // First, try to find and parse complete JSON objects
    let match;
    const matches: string[] = [];

    // Find all potential JSON action blocks
    while ((match = actionPattern.exec(responseText)) !== null) {
      matches.push(match[0]);
    }

    // Also try a simpler approach: find JSON objects that start with {"action"
    const jsonStartPattern = /\{\s*"action"/g;
    let jsonStart;
    while ((jsonStart = jsonStartPattern.exec(responseText)) !== null) {
      const startPos = jsonStart.index;
      // Try to find the matching closing brace
      let braceCount = 0;
      let endPos = startPos;
      for (let i = startPos; i < responseText.length; i++) {
        if (responseText[i] === "{") braceCount++;
        if (responseText[i] === "}") {
          braceCount--;
          if (braceCount === 0) {
            endPos = i + 1;
            break;
          }
        }
      }

      if (endPos > startPos) {
        const jsonStr = responseText.substring(startPos, endPos);
        if (!matches.includes(jsonStr)) {
          matches.push(jsonStr);
        }
      }
    }

    // Parse each matched JSON string
    for (const jsonStr of matches) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.action && parsed.parameters) {
          actions.push(parsed);
          // Remove the action JSON from the displayed text
          processedText = processedText.replace(jsonStr, "");
        }
      } catch {
        // If JSON parsing fails, skip this action
        console.warn("Failed to parse action JSON:", jsonStr.substring(0, 50));
      }
    }

    // Execute actions
    for (const action of actions) {
      try {
        if (action.action === "setEnergy") {
          const energyLevel =
            (action.parameters.energyLevel as string) ||
            (action.parameters.energy as string);
          if (
            energyLevel &&
            ["low", "medium", "high"].includes(energyLevel.toLowerCase())
          ) {
            await updateEnergy(energyLevel.toLowerCase() as EnergyLevel);
          }
        } else if (action.action === "generateDailyPlan") {
          const effortLevel =
            (action.parameters.effortLevel as string) ||
            (action.parameters.energy as string);
          const energyLevel = effortLevel
            ? effortLevel.toLowerCase()
            : "medium";
          if (["low", "medium", "high"].includes(energyLevel)) {
            // The plan will be generated by the backend and included in the response
            // We just need to ensure energy is set correctly
            if (energyLevel !== "medium") {
              await updateEnergy(energyLevel as EnergyLevel);
            }
          }
        }
      } catch (error) {
        console.error("Failed to execute action:", action, error);
      }
    }

    // Clean up the text - remove any remaining JSON artifacts and normalize whitespace
    processedText = processedText
      .replace(
        /\{\s*"action"\s*:\s*"[^"]+"\s*,\s*"parameters"\s*:\s*\{[^}]+\}\s*\}/g,
        ""
      )
      .replace(/\n{3,}/g, "\n\n") // Replace 3+ newlines with 2
      .replace(/^\s+|\s+$/gm, "") // Trim each line
      .trim();

    return processedText;
  };

  const sendChatMessage = async (userInput: string): Promise<string> => {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    // Check for Flow Mode requests (client-side detection for better UX)
    const flowModePattern =
      /(?:start|begin|launch|create).*flow.*mode|flow.*mode.*(?:for|duration|minutes|hours)/i;
    if (flowModePattern.test(userInput) && !isActive) {
      // Extract duration if mentioned
      const durationMatch = userInput.match(
        /(\d+)\s*(?:min|minute|hour|hr|h)/i
      );
      const duration = durationMatch
        ? parseInt(durationMatch[1]) *
          (userInput.toLowerCase().includes("hour") ||
          userInput.toLowerCase().includes("hr") ||
          userInput.toLowerCase().includes("h")
            ? 60
            : 1)
        : 60; // Default 60 minutes

      // Extract energy level if mentioned
      let energy: "low" | "medium" | "high" | undefined;
      if (/\blow\b/i.test(userInput)) energy = "low";
      else if (/\bhigh\b/i.test(userInput)) energy = "high";
      else energy = "medium";

      try {
        await startFlow(Math.min(Math.max(duration, 15), 480), energy);
        router.push("/flow");
        return `Flow Mode started for ${duration} minutes! Redirecting you to the Flow Mode page...`;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        return `I tried to start Flow Mode, but encountered an error: ${errorMessage}. Please try again or use the Flow Mode button in the Focus Compass widget.`;
      }
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    // Prepare message history (excluding the current message)
    const history = messages
      .filter((m) => m.role === "assistant" || m.role === "user")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: userInput,
        history: history,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const rawResponse =
      data.response ||
      data.message ||
      "I received your message, but got an empty response.";

    // Parse and execute actions, then return cleaned response
    const processedResponse = await parseAndExecuteActions(rawResponse);
    return processedResponse;
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    addMessage("user", userMessage);
    setIsProcessing(true);

    try {
      const response = await sendChatMessage(userMessage);
      addMessage("assistant", response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      addMessage("assistant", `❌ Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 w-96 h-[600px] z-50",
        isProcessing && "tikku-glow"
      )}
    >
      <div
        className={cn(
          "w-full h-full bg-background border rounded-lg shadow-2xl flex flex-col backdrop-blur-none relative",
          isProcessing && "tikku-glow-container"
        )}
      >
        {/* Glow effect border when processing */}
        {isProcessing && (
          <div className="absolute -inset-[4px] tikku-glow-border pointer-events-none rounded-lg" />
        )}

        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-muted relative z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Tikku</h3>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background relative z-10">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-3 max-w-[85%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.role === "assistant" ? (
                  <div className="text-sm">
                    <MarkdownRenderer
                      content={message.content}
                      className="prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1 [&_p]:mb-2 [&_strong]:font-semibold [&_em]:italic"
                    />
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3 justify-start items-center">
              <div className="shrink-0">
                <SiriOrb size="36px" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <span className="text-sm text-muted-foreground">
                  Tikku is thinking...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-muted relative z-10">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              size="icon"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Glow styles */}
        <style>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .tikku-glow {
          --c1: oklch(75% 0.15 350);
          --c2: oklch(80% 0.12 200);
          --c3: oklch(78% 0.14 280);
          --animation-duration: 20s;
          --blur-amount: 15px;
          --contrast-amount: 1.5;
        }

        .tikku-glow-container {
          overflow: visible;
        }

        .tikku-glow-border {
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--c3),
              transparent 20% 80%,
              var(--c3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--c2),
              transparent 30% 60%,
              var(--c2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--c1),
              transparent 40% 60%,
              var(--c1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--c2),
              transparent 10% 90%,
              var(--c2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--c1),
              transparent 10% 90%,
              var(--c1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--c3),
              transparent 20% 80%,
              var(--c3)
            );
          filter: blur(var(--blur-amount)) contrast(var(--contrast-amount));
          animation: rotate var(--animation-duration) linear infinite;
          opacity: 0.9;
          z-index: -1;
        }

        .tikku-glow-border::before {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: calc(inherit - 3px);
          background: hsl(var(--background));
          z-index: 1;
        }

        .tikku-glow-border::after {
          content: "";
          position: absolute;
          inset: -12px;
          border-radius: inherit;
          background: inherit;
          filter: blur(calc(var(--blur-amount) * 3)) contrast(calc(var(--contrast-amount) * 0.5));
          animation: rotate var(--animation-duration) linear infinite;
          opacity: 0.5;
          z-index: -2;
        }

        @keyframes rotate {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tikku-glow-border {
            animation: none;
          }
        }
      `}</style>
      </div>
    </div>
  );
}
