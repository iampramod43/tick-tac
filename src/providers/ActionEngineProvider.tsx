"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";

interface Nudge {
  id: string;
  message: string;
  type?: string;
  timestamp: number;
}

interface MicroFlow {
  id: string;
  steps: string[];
  title?: string;
  timestamp: number;
}

interface SessionDebrief {
  highlights: string[];
  insights?: string[];
  timestamp: number;
}

interface FocusLock {
  taskId: string | null;
}

interface SocketNudgeMessage {
  id?: string;
  message?: string;
  payload?: {
    message: string;
    type?: string;
  };
  type?: string;
}

interface SocketFocusLockMessage {
  taskId?: string;
  payload?: {
    taskId: string;
  };
}

interface SocketMicroFlowMessage {
  id?: string;
  steps?: string[];
  title?: string;
  payload?: {
    steps: string[];
    title?: string;
  };
}

interface SocketDebriefMessage {
  highlights?: string[];
  insights?: string[];
  payload?: {
    highlights: string[];
    insights?: string[];
  };
}

interface ActionEngineContextType {
  nudges: Nudge[];
  setNudges: React.Dispatch<React.SetStateAction<Nudge[]>>;
  focusLock: FocusLock;
  setFocusLock: React.Dispatch<React.SetStateAction<FocusLock>>;
  microFlows: MicroFlow[];
  setMicroFlows: React.Dispatch<React.SetStateAction<MicroFlow[]>>;
  sessionDebrief: SessionDebrief | null;
  setSessionDebrief: React.Dispatch<
    React.SetStateAction<SessionDebrief | null>
  >;
  isConnected: boolean;
}

const ActionEngineContext = createContext<ActionEngineContextType | null>(null);

export function ActionEngineProvider({ children }: { children: ReactNode }) {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [focusLock, setFocusLock] = useState<FocusLock>({
    taskId: null,
  });
  const [microFlows, setMicroFlows] = useState<MicroFlow[]>([]);
  const [sessionDebrief, setSessionDebrief] = useState<SessionDebrief | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    let socket: Socket | null = null;

    const connect = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.log(
            "Action Engine: No auth token available, skipping connection"
          );
          return;
        }

        const serverUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          (process.env.NODE_ENV === "production"
            ? "https://tick-tac-api.vercel.app"
            : "http://localhost:3001");

        socket = io(serverUrl, {
          path: "/socket.io",
          auth: {
            token: token,
          },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: Infinity,
        });

        socket.on("connect", () => {
          setIsConnected(true);
          console.log("Action Engine: Socket.io connected", socket?.id);
        });

        socket.on("disconnect", (reason) => {
          setIsConnected(false);
          console.log("Action Engine: Socket.io disconnected", reason);
        });

        socket.on("connect_error", (error) => {
          console.error("Action Engine: Socket.io connection error", error);
          setIsConnected(false);
        });

        socket.on("nudge", (msg: SocketNudgeMessage) => {
          setNudges((prev) => [
            ...prev,
            {
              id: msg.id || Date.now().toString(),
              message: msg.payload?.message || msg.message || "",
              type: msg.payload?.type || msg.type,
              timestamp: Date.now(),
            },
          ]);
        });

        socket.on("focus_lock", (msg: SocketFocusLockMessage) => {
          setFocusLock({ taskId: msg.payload?.taskId || msg.taskId || null });
        });

        socket.on("focus_unlock", () => {
          setFocusLock({ taskId: null });
        });

        socket.on("micro_flow_program", (msg: SocketMicroFlowMessage) => {
          setMicroFlows((prev) => [
            ...prev,
            {
              id: msg.id || Date.now().toString(),
              steps: msg.payload?.steps || msg.steps || [],
              title: msg.payload?.title || msg.title,
              timestamp: Date.now(),
            },
          ]);
        });

        socket.on("session_debrief", (msg: SocketDebriefMessage) => {
          setSessionDebrief({
            highlights: msg.payload?.highlights || msg.highlights || [],
            insights: msg.payload?.insights || msg.insights,
            timestamp: Date.now(),
          });
        });
      } catch (error) {
        console.error("Action Engine: Failed to connect", error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [getToken]);

  // Auto-dismiss nudges after 5 seconds
  useEffect(() => {
    if (nudges.length === 0) return;

    const timer = setTimeout(() => {
      setNudges((prev) => prev.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [nudges]);

  return (
    <ActionEngineContext.Provider
      value={{
        nudges,
        setNudges,
        focusLock,
        setFocusLock,
        microFlows,
        setMicroFlows,
        sessionDebrief,
        setSessionDebrief,
        isConnected,
      }}
    >
      {children}
    </ActionEngineContext.Provider>
  );
}

export const useActionEngine = () => {
  const context = useContext(ActionEngineContext);
  if (!context) {
    throw new Error("useActionEngine must be used within ActionEngineProvider");
  }
  return context;
};
