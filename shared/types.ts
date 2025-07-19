export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubAccount {
  id: string;
  userId: string;
  name: string;
  assignedNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhoneNumber {
  id: string;
  userId: string;
  phoneNumber: string;
  friendlyName: string;
  isPrimary: boolean;
  assignedToSubAccount?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactWithUnread extends Contact {
  unreadCount: number;
  lastMessage?: Message;
  lastMessageAt?: Date;
}

export interface Message {
  id: string;
  userId: string;
  contactId: string;
  fromNumber: string;
  toNumber: string;
  body: string;
  direction: "inbound" | "outbound";
  status: "sent" | "delivered" | "failed" | "received";
  isRead: boolean;
  twilioSid?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface SendSmsRequest {
  contactId: string;
  body: string;
  fromNumber: string;
}

export interface CreateContactRequest {
  name: string;
  phoneNumber: string;
}

export interface CreateSubAccountRequest {
  name: string;
  assignedNumber?: string;
}

export interface BuyNumberRequest {
  areaCode?: string;
  country?: string;
}

export interface SocketEvents {
  "new-message": Message;
  "message-status-update": {
    messageId: string;
    status: Message["status"];
  };
  "contact-updated": Contact;
}
