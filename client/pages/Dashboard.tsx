import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import {
  Contact,
  ContactWithUnread,
  Message,
  PhoneNumber,
} from "@shared/types";
import ChatNavbar from "@/components/ChatNavbar";
import ContactList from "@/components/ContactList";
import ChatArea from "@/components/ChatArea";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, token } = useAuth();
  const { newMessage, clearNewMessage } = useSocket();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedPhoneNumber, setSelectedPhoneNumber] =
    useState<PhoneNumber | null>(null);
  const [isMobileContactListOpen, setIsMobileContactListOpen] = useState(false);
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
    onSuccess: (numbers) => {
      // Set default selected phone number to primary or first available
      if (!selectedPhoneNumber && numbers.length > 0) {
        const primary = numbers.find((num) => num.isPrimary) || numbers[0];
        setSelectedPhoneNumber(primary);
      }
    },
  });

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
    refetchInterval: 30000, // Refetch every 30 seconds
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
  }, [newMessage, selectedContact, queryClient, token]);

  const markMessageAsRead = async (messageId: string) => {
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
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setIsMobileContactListOpen(false);
  };

  const handleNotificationMessageClick = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      handleContactSelect(contact);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatNavbar
        phoneNumbers={phoneNumbers}
        selectedPhoneNumber={selectedPhoneNumber}
        unreadCount={unreadData?.unreadCount || 0}
        onToggleContactList={() =>
          setIsMobileContactListOpen(!isMobileContactListOpen)
        }
        onPhoneNumberSelect={setSelectedPhoneNumber}
        onNotificationMessageClick={handleNotificationMessageClick}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Contact List Sidebar */}
        <div
          className={cn(
            "w-80 border-r bg-background",
            "lg:block",
            isMobileContactListOpen ? "block" : "hidden",
            "lg:relative absolute lg:z-auto z-10 h-full lg:h-auto",
          )}
        >
          <ContactList
            contacts={contacts}
            selectedContact={selectedContact}
            onContactSelect={handleContactSelect}
            onClose={() => setIsMobileContactListOpen(false)}
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
