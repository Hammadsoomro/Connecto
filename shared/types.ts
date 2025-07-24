export interface User {
  id: string;
  email: string;
  name: string;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference?: string;
  subAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubAccountStats {
  id: string;
  subAccountId: string;
  totalSmsCount: number;
  totalCost: number;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubAccount {
  id: string;
  userId: string;
  name: string;
  email: string;
  password?: string;
  friendlyName: string;
  status: string;
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
  email: string;
  password: string;
  assignedNumber?: string;
}

export interface BuyNumberRequest {
  areaCode?: string;
  country?: string;
}

export interface AddFundsRequest {
  amount: number;
  paymentMethod: string;
}

export interface SubAccountDetailRequest {
  subAccountId: string;
  startDate?: string;
  endDate?: string;
}

export interface SocketEvents {
  "new-message": Message;
  "message-status-update": {
    messageId: string;
    status: Message["status"];
  };
  "contact-updated": Contact;
}
