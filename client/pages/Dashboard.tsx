import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSocket } from "@/contexts/SocketContext";
import {
  Contact,
  ContactWithUnread,
  Message,
  PhoneNumber,
} from "@shared/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { 
  MessageSquare, 
  Phone, 
  CreditCard, 
  Users 
} from "lucide-react";
import ChatNavbar from "@/components/ChatNavbar";
import ContactList from "@/components/ContactList";
import ChatArea from "@/components/ChatArea";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const { newMessage, clearNewMessage } = useSocket();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedPhoneNumber, setSelectedPhoneNumber] =
    useState<PhoneNumber | null>(null);

  const queryClient = useQueryClient();

  // Fetch contacts with unread count
  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await fetch("/api/contacts/with-unread", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch contacts");
      return response.json() as Promise<ContactWithUnread[]>;
    },
    enabled: !!token,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Fetch phone numbers
  const { data: phoneNumbers = [] } = useQuery({
    queryKey: ["phone-numbers"],
    queryFn: async () => {
      const response = await fetch("/api/phone-numbers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch phone numbers");
      return response.json() as Promise<PhoneNumber[]>;
    },
    enabled: !!token,
    staleTime: 60000, // Consider data fresh for 60 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Set default selected phone number to primary or first available
  useEffect(() => {
    if (!selectedPhoneNumber && phoneNumbers.length > 0) {
      const primary =
        phoneNumbers.find((num) => num.isPrimary) || phoneNumbers[0];
      setSelectedPhoneNumber(primary);
    }
  }, [phoneNumbers, selectedPhoneNumber]);

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: async () => {
      const response = await fetch("/api/sms/unread-count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch unread count");
      return response.json() as Promise<{ unreadCount: number }>;
    },
    enabled: !!token,
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Handle new messages from Socket.io
  useEffect(() => {
    if (newMessage) {
      // Update contacts and messages queries
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });

      // If this is for the selected contact, mark as read
      if (
        selectedContact &&
        newMessage.contactId === selectedContact.id &&
        newMessage.direction === "inbound"
      ) {
        markMessageAsRead(newMessage.id);
      }

      clearNewMessage();
    }
  }, [newMessage, selectedContact, queryClient, clearNewMessage]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await fetch(`/api/sms/messages/${messageId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }, [token, queryClient]);

  const handleContactSelect = useCallback((contact: Contact) => {
    setSelectedContact(contact);
  }, []);

  const handleContactDelete = useCallback(async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      // If the deleted contact was selected, clear selection
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }

      // Refresh contacts list
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  }, [token, queryClient, selectedContact?.id]);

  const handleNotificationMessageClick = useCallback((contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      handleContactSelect(contact);
    }
  }, [contacts, handleContactSelect]);

  if (!user) {
    return null;
  }

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden relative ${theme === "dark" ? "bg-gradient-to-br from-black via-gray-900 to-black" : "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"}`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${theme === "dark" ? "bg-purple-500/10" : "bg-purple-500/20"} rounded-full blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${theme === "dark" ? "bg-blue-500/10" : "bg-blue-500/20"} rounded-full blur-3xl animate-pulse delay-1000`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 ${theme === "dark" ? "bg-pink-500/10" : "bg-pink-500/20"} rounded-full blur-3xl animate-pulse delay-500`}
        ></div>
      </div>
      
      <ChatNavbar
        phoneNumbers={phoneNumbers}
        selectedPhoneNumber={selectedPhoneNumber}
        unreadCount={unreadData?.unreadCount || 0}
        onPhoneNumberSelect={setSelectedPhoneNumber}
        onNotificationMessageClick={handleNotificationMessageClick}
      />



      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Contact List Sidebar - Always visible and locked */}
        <div className={`w-80 border-r ${theme === "dark" ? "bg-black/90 border-white/10" : "bg-black/20 border-white/10"} backdrop-blur-sm`}>
          <ContactList
            contacts={contacts}
            selectedContact={selectedContact}
            onContactSelect={handleContactSelect}
            onContactDelete={handleContactDelete}
            onClose={() => {}}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatArea
            selectedContact={selectedContact}
            phoneNumbers={phoneNumbers}
            selectedPhoneNumber={selectedPhoneNumber}
            onContactSelect={handleContactSelect}
          />
        </div>
      </div>
    </div>
  );
}
