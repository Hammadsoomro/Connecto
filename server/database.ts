import {
  User,
  Contact,
  ContactWithUnread,
  Message,
  PhoneNumber,
  SubAccount,
} from "@shared/types";

// In-memory database for demonstration
// In production, replace with a real database like PostgreSQL, MongoDB, etc.

class Database {
  private users: Map<string, User> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private messages: Map<string, Message> = new Map();
  private phoneNumbers: Map<string, PhoneNumber> = new Map();
  private subAccounts: Map<string, SubAccount> = new Map();
  private userPasswords: Map<string, string> = new Map();

  constructor() {
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo user if it doesn't exist
    if (!this.getUserByEmail("demo@example.com")) {
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash("password123", 10);
      const demoUser = this.createUser(
        {
          email: "demo@example.com",
          name: "Demo User",
        },
        hashedPassword,
      );

      // Create demo phone numbers
      this.createPhoneNumber(demoUser.id, {
        phoneNumber: "+1234567890",
        friendlyName: "Primary Number",
        isPrimary: true,
      });

      this.createPhoneNumber(demoUser.id, {
        phoneNumber: "+1234567891",
        friendlyName: "Secondary Number",
        isPrimary: false,
      });

      // Create demo contacts
      const contact1 = this.createContact(demoUser.id, {
        name: "John Doe",
        phoneNumber: "+1987654321",
      });

      const contact2 = this.createContact(demoUser.id, {
        name: "Jane Smith",
        phoneNumber: "+1987654322",
      });

      // Create demo messages
      this.createMessage({
        userId: demoUser.id,
        contactId: contact1.id,
        fromNumber: "+1987654321",
        toNumber: "+1234567890",
        body: "Hello! This is John. How are you doing?",
        direction: "inbound",
        status: "received",
        isRead: false,
      });

      this.createMessage({
        userId: demoUser.id,
        contactId: contact1.id,
        fromNumber: "+1234567890",
        toNumber: "+1987654321",
        body: "Hi John! I'm doing great, thanks for asking!",
        direction: "outbound",
        status: "delivered",
        isRead: true,
      });

      this.createMessage({
        userId: demoUser.id,
        contactId: contact2.id,
        fromNumber: "+1987654322",
        toNumber: "+1234567890",
        body: "Hey! Jane here. Are we still on for the meeting tomorrow?",
        direction: "inbound",
        status: "received",
        isRead: false,
      });

      console.log("Demo data initialized: demo@example.com / password123");
    }
  }

  // User methods
  createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
    password: string,
  ): User {
    const id = this.generateId();
    const now = new Date();
    const user: User = {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    this.userPasswords.set(userData.email, password);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  getUserPassword(email: string): string | undefined {
    return this.userPasswords.get(email);
  }

  // Contact methods
  createContact(
    userId: string,
    contactData: Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Contact {
    const id = this.generateId();
    const now = new Date();
    const contact: Contact = {
      id,
      userId,
      ...contactData,
      createdAt: now,
      updatedAt: now,
    };
    this.contacts.set(id, contact);
    return contact;
  }

  getContactsByUserId(userId: string): Contact[] {
    return Array.from(this.contacts.values()).filter(
      (contact) => contact.userId === userId,
    );
  }

  getContactById(id: string): Contact | undefined {
    return this.contacts.get(id);
  }

  getContactByPhoneNumber(
    userId: string,
    phoneNumber: string,
  ): Contact | undefined {
    return Array.from(this.contacts.values()).find(
      (contact) =>
        contact.userId === userId && contact.phoneNumber === phoneNumber,
    );
  }

  deleteContact(id: string): boolean {
    return this.contacts.delete(id);
  }

  getContactsWithUnread(userId: string): ContactWithUnread[] {
    const contacts = this.getContactsByUserId(userId);
    return contacts
      .map((contact) => {
        const messages = this.getMessagesByContactId(contact.id);
        const unreadMessages = messages.filter(
          (m) => m.direction === "inbound" && !m.isRead,
        );
        const lastMessage =
          messages.length > 0 ? messages[messages.length - 1] : undefined;

        return {
          ...contact,
          unreadCount: unreadMessages.length,
          lastMessage,
          lastMessageAt: lastMessage?.createdAt,
        };
      })
      .sort((a, b) => {
        // Sort by last message time, most recent first
        if (a.lastMessageAt && b.lastMessageAt) {
          return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
        }
        if (a.lastMessageAt) return -1;
        if (b.lastMessageAt) return 1;
        return 0;
      });
  }

  // Message methods
  createMessage(
    messageData: Omit<Message, "id" | "createdAt" | "updatedAt">,
  ): Message {
    const id = this.generateId();
    const now = new Date();
    const message: Message = {
      id,
      ...messageData,
      createdAt: now,
      updatedAt: now,
    };
    this.messages.set(id, message);
    return message;
  }

  getMessagesByContactId(contactId: string): Message[] {
    return Array.from(this.messages.values())
      .filter((message) => message.contactId === contactId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  getMessagesByUserId(userId: string): Message[] {
    return Array.from(this.messages.values()).filter(
      (message) => message.userId === userId,
    );
  }

  updateMessage(id: string, updates: Partial<Message>): Message | undefined {
    const message = this.messages.get(id);
    if (message) {
      const updatedMessage = { ...message, ...updates, updatedAt: new Date() };
      this.messages.set(id, updatedMessage);
      return updatedMessage;
    }
    return undefined;
  }

  getUnreadMessagesCount(userId: string): number {
    return Array.from(this.messages.values()).filter(
      (message) =>
        message.userId === userId &&
        !message.isRead &&
        message.direction === "inbound",
    ).length;
  }

  // Phone number methods
  createPhoneNumber(
    userId: string,
    numberData: Omit<PhoneNumber, "id" | "userId" | "createdAt" | "updatedAt">,
  ): PhoneNumber {
    const id = this.generateId();
    const now = new Date();
    const phoneNumber: PhoneNumber = {
      id,
      userId,
      ...numberData,
      createdAt: now,
      updatedAt: now,
    };
    this.phoneNumbers.set(id, phoneNumber);
    return phoneNumber;
  }

  getPhoneNumbersByUserId(userId: string): PhoneNumber[] {
    return Array.from(this.phoneNumbers.values()).filter(
      (number) => number.userId === userId,
    );
  }

  getPhoneNumberByNumber(phoneNumber: string): PhoneNumber | undefined {
    return Array.from(this.phoneNumbers.values()).find(
      (number) => number.phoneNumber === phoneNumber,
    );
  }

  // Sub-account methods
  createSubAccount(
    userId: string,
    subAccountData: Omit<
      SubAccount,
      "id" | "userId" | "createdAt" | "updatedAt"
    >,
  ): SubAccount {
    const id = this.generateId();
    const now = new Date();
    const subAccount: SubAccount = {
      id,
      userId,
      ...subAccountData,
      createdAt: now,
      updatedAt: now,
    };
    this.subAccounts.set(id, subAccount);
    return subAccount;
  }

  getSubAccountsByUserId(userId: string): SubAccount[] {
    return Array.from(this.subAccounts.values()).filter(
      (account) => account.userId === userId,
    );
  }

  updateSubAccount(
    id: string,
    updates: Partial<SubAccount>,
  ): SubAccount | undefined {
    const subAccount = this.subAccounts.get(id);
    if (subAccount) {
      const updatedSubAccount = {
        ...subAccount,
        ...updates,
        updatedAt: new Date(),
      };
      this.subAccounts.set(id, updatedSubAccount);
      return updatedSubAccount;
    }
    return undefined;
  }

  deleteSubAccount(id: string): boolean {
    return this.subAccounts.delete(id);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const db = new Database();
