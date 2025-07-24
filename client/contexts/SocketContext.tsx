import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Message, SocketEvents } from "@shared/types";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface InAppNotification {
  id: string;
  message: Message;
  contactName?: string;
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  newMessage: Message | null;
  notifications: InAppNotification[];
  clearNewMessage: () => void;
  removeNotification: (id: string) => void;
  playNotificationSound: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to Socket.IO server
      const newSocket = io("/", {
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
      });

      newSocket.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
        // Join user-specific room
        newSocket.emit("join-user-room", user.id);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Disconnected from server:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      });

      // Listen for new messages
      newSocket.on("new-message", (message: Message) => {
        try {
          setNewMessage(message);
          // Show notification for inbound messages
          if (message.direction === "inbound") {
            handleIncomingMessage(message);
          }
        } catch (error) {
          console.error("Error handling new message:", error);
        }
      });

      newSocket.on("message-status-update", (update) => {
        console.log("Message status update:", update);
      });

      newSocket.on("contact-updated", (contact) => {
        console.log("Contact updated:", contact);
      });

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket connection");
        newSocket.removeAllListeners();
        newSocket.disconnect();
      };
    } else {
      // Disconnect socket when user logs out
      if (socket) {
        console.log("User logged out, disconnecting socket");
        socket.removeAllListeners();
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user?.id]); // Only depend on user.id to prevent unnecessary reconnections

  const handleIncomingMessage = async (message: Message) => {
    try {
      // Play notification sound
      playNotificationSound();

      // Show browser notification
      showBrowserNotification(message);

      // Show toast notification
      toast({
        title: "New SMS Message",
        description: `From ${message.fromNumber}: ${message.body.substring(0, 50)}${message.body.length > 50 ? "..." : ""}`,
        duration: 5000,
      });

      // Add to in-app notifications
      const notification: InAppNotification = {
        id: `${message.id}-${Date.now()}`,
        message,
        timestamp: new Date(),
      };

      setNotifications((prev) => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications

      // Auto-remove notification after 30 seconds
      const timeoutId = setTimeout(() => {
        removeNotification(notification.id);
      }, 30000);

      // Store timeout ID for cleanup if needed
      (notification as any).timeoutId = timeoutId;
    } catch (error) {
      console.error("Error handling incoming message:", error);
    }
  };

  const showBrowserNotification = (message: Message) => {
    if (Notification.permission === "granted") {
      const notification = new Notification("New SMS Message", {
        body: `${message.fromNumber}: ${message.body}`,
        icon: "/placeholder.svg",
        tag: `sms-${message.id}`, // Prevent duplicate notifications
        badge: "/placeholder.svg",
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showBrowserNotification(message);
        }
      });
    }
  };

  const playNotificationSound = () => {
    try {
      // Check if AudioContext is available
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        console.warn("AudioContext not supported");
        return;
      }

      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      
      // Check if audio context is in suspended state (common in modern browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          playBeep(audioContext);
        }).catch((error) => {
          console.error("Could not resume audio context:", error);
        });
      } else {
        playBeep(audioContext);
      }
    } catch (error) {
      console.error("Could not play notification sound:", error);
    }
  };

  const playBeep = (audioContext: AudioContext) => {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error("Error playing beep:", error);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearNewMessage = () => {
    setNewMessage(null);
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    newMessage,
    notifications,
    clearNewMessage,
    removeNotification,
    playNotificationSound,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
