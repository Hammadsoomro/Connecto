import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contact, Message, PhoneNumber } from "@shared/types";
import { Send, MessageSquare, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ChatAreaProps {
  selectedContact: Contact | null;
  phoneNumbers: PhoneNumber[];
  selectedPhoneNumber?: PhoneNumber | null;
  onContactSelect: (contact: Contact) => void;
}

export default function ChatArea({
  selectedContact,
  phoneNumbers,
  selectedPhoneNumber,
}: ChatAreaProps) {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [selectedFromNumber, setSelectedFromNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Set from number based on selected phone number
  useEffect(() => {
    if (selectedPhoneNumber) {
      setSelectedFromNumber(selectedPhoneNumber.phoneNumber);
    } else if (phoneNumbers.length > 0 && !selectedFromNumber) {
      const primary = phoneNumbers.find((num) => num.isPrimary);
      setSelectedFromNumber(
        primary?.phoneNumber || phoneNumbers[0].phoneNumber,
      );
    }
  }, [phoneNumbers, selectedFromNumber, selectedPhoneNumber]);

  // Fetch messages for selected contact
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedContact?.id],
    queryFn: async () => {
      if (!selectedContact) return [];
      const response = await fetch(`/api/sms/messages/${selectedContact.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json() as Promise<Message[]>;
    },
    enabled: !!selectedContact && !!token,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedContact || !selectedFromNumber || isSending)
      return;

    setIsSending(true);
    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contactId: selectedContact.id,
          body: message.trim(),
          fromNumber: selectedFromNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedContact.id],
      });

      toast({
        title: "Message sent",
        description: `Message sent to ${selectedContact.name}`,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 mx-auto text-purple-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-purple-800 dark:text-white">No conversation selected</h3>
          <p className="text-purple-600 dark:text-gray-400">
            Select a contact to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="border-b p-4 bg-white/90 dark:bg-black/90 border-purple-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
            {selectedContact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-purple-900 dark:text-white">{selectedContact.name}</h3>
            <p className="text-sm text-purple-600 dark:text-gray-400">
              {selectedContact.phoneNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-transparent">
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4 bg-white/90 dark:bg-black/90 border-purple-200 dark:border-gray-700 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* From Number Selection */}
          {phoneNumbers.length > 1 && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-600 dark:text-gray-400" />
              <Select
                value={selectedFromNumber}
                onValueChange={setSelectedFromNumber}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  {phoneNumbers.map((number) => (
                    <SelectItem key={number.id} value={number.phoneNumber}>
                      {number.friendlyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isSending}
            />
            <Button type="submit" disabled={!message.trim() || isSending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === "outbound";

  return (
    <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-3 py-2",
          isOutbound
            ? "bg-purple-600 text-white"
            : "bg-purple-100 dark:bg-gray-700 text-purple-900 dark:text-white",
        )}
      >
        <p className="text-sm">{message.body}</p>
        <div
          className={cn(
            "text-xs mt-1 opacity-70",
            isOutbound ? "text-right" : "text-left",
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isOutbound && (
            <span className="ml-1">
              {message.status === "delivered" ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
