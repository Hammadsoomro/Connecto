import { MongoClient, Db, ObjectId } from "mongodb";
import {
  User,
  Contact,
  ContactWithUnread,
  Message,
  PhoneNumber,
  SubAccount,
} from "@shared/types";
import bcrypt from "bcryptjs";

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  async connect() {
    if (this.isConnected) return;

    try {
      const connectionString = process.env.DB_URL;
      if (!connectionString) {
        throw new Error("DB_URL environment variable is required");
      }

      this.client = new MongoClient(connectionString);
      await this.client.connect();
      this.db = this.client.db("connectify");
      this.isConnected = true;
      
      console.log("Connected to MongoDB successfully");
      
      // Initialize with demo data if needed
      await this.initializeDemoData();
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  private async getCollection(name: string) {
    if (!this.db) {
      await this.connect();
    }
    return this.db!.collection(name);
  }

  private async initializeDemoData() {
    // Check if demo user already exists
    const users = await this.getCollection("users");
    const existingUser = await users.findOne({ email: "demo@example.com" });
    
    if (!existingUser) {
      // Create demo user
      const hashedPassword = await bcrypt.hash("password123", 10);
      const demoUser = await this.createUser(
        {
          email: "demo@example.com",
          name: "Demo User",
        },
        hashedPassword,
      );

      // Create demo phone numbers
      await this.createPhoneNumber(demoUser.id, {
        phoneNumber: "+1234567890",
        friendlyName: "Primary Number",
        isPrimary: true,
      });

      await this.createPhoneNumber(demoUser.id, {
        phoneNumber: "+1234567891",
        friendlyName: "Secondary Number",
        isPrimary: false,
      });

      // Create demo contacts
      const contact1 = await this.createContact(demoUser.id, {
        name: "John Doe",
        phoneNumber: "+1987654321",
      });

      const contact2 = await this.createContact(demoUser.id, {
        name: "Jane Smith",
        phoneNumber: "+1987654322",
      });

      // Create demo messages
      await this.createMessage({
        userId: demoUser.id,
        contactId: contact1.id,
        fromNumber: "+1987654321",
        toNumber: "+1234567890",
        body: "Hello! This is John. How are you doing?",
        direction: "inbound",
        status: "received",
        isRead: false,
      });

      await this.createMessage({
        userId: demoUser.id,
        contactId: contact1.id,
        fromNumber: "+1234567890",
        toNumber: "+1987654321",
        body: "Hi John! I'm doing great, thanks for asking!",
        direction: "outbound",
        status: "delivered",
        isRead: true,
      });

      await this.createMessage({
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
  async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
    password: string,
  ): Promise<User> {
    const users = await this.getCollection("users");
    const passwords = await this.getCollection("user_passwords");
    
    const now = new Date();
    const userDoc = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await users.insertOne(userDoc);
    const id = result.insertedId.toString();
    
    // Store password separately
    await passwords.insertOne({
      email: userData.email,
      password,
    });
    
    return {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = await this.getCollection("users");
    const user = await users.findOne({ _id: new ObjectId(id) });
    
    if (user) {
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.getCollection("users");
    const user = await users.findOne({ email });
    
    if (user) {
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }
    return undefined;
  }

  async getUserPassword(email: string): Promise<string | undefined> {
    const passwords = await this.getCollection("user_passwords");
    const result = await passwords.findOne({ email });
    return result?.password;
  }

  // Contact methods
  async createContact(
    userId: string,
    contactData: Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<Contact> {
    const contacts = await this.getCollection("contacts");
    
    const now = new Date();
    const contactDoc = {
      userId,
      ...contactData,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await contacts.insertOne(contactDoc);
    const id = result.insertedId.toString();
    
    return {
      id,
      userId,
      ...contactData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getContactsByUserId(userId: string): Promise<Contact[]> {
    const contacts = await this.getCollection("contacts");
    const result = await contacts.find({ userId }).toArray();
    
    return result.map(doc => ({
      id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      phoneNumber: doc.phoneNumber,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async getContactById(id: string): Promise<Contact | undefined> {
    const contacts = await this.getCollection("contacts");
    const contact = await contacts.findOne({ _id: new ObjectId(id) });
    
    if (contact) {
      return {
        id: contact._id.toString(),
        userId: contact.userId,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      };
    }
    return undefined;
  }

  async getContactByPhoneNumber(
    userId: string,
    phoneNumber: string,
  ): Promise<Contact | undefined> {
    const contacts = await this.getCollection("contacts");
    const contact = await contacts.findOne({ userId, phoneNumber });
    
    if (contact) {
      return {
        id: contact._id.toString(),
        userId: contact.userId,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      };
    }
    return undefined;
  }

  async deleteContact(id: string): Promise<boolean> {
    const contacts = await this.getCollection("contacts");
    const result = await contacts.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async getContactsWithUnread(userId: string): Promise<ContactWithUnread[]> {
    const contacts = await this.getContactsByUserId(userId);
    const result: ContactWithUnread[] = [];
    
    for (const contact of contacts) {
      const messages = await this.getMessagesByContactId(contact.id);
      const unreadMessages = messages.filter(
        (m) => m.direction === "inbound" && !m.isRead,
      );
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
      
      result.push({
        ...contact,
        unreadCount: unreadMessages.length,
        lastMessage,
        lastMessageAt: lastMessage?.createdAt,
      });
    }
    
    // Sort by last message time, most recent first
    return result.sort((a, b) => {
      if (a.lastMessageAt && b.lastMessageAt) {
        return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
      }
      if (a.lastMessageAt) return -1;
      if (b.lastMessageAt) return 1;
      return 0;
    });
  }

  // Message methods
  async createMessage(
    messageData: Omit<Message, "id" | "createdAt" | "updatedAt">,
  ): Promise<Message> {
    const messages = await this.getCollection("messages");
    
    const now = new Date();
    const messageDoc = {
      ...messageData,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await messages.insertOne(messageDoc);
    const id = result.insertedId.toString();
    
    return {
      id,
      ...messageData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getMessagesByContactId(contactId: string): Promise<Message[]> {
    const messages = await this.getCollection("messages");
    const result = await messages
      .find({ contactId })
      .sort({ createdAt: 1 })
      .toArray();
    
    return result.map(doc => ({
      id: doc._id.toString(),
      userId: doc.userId,
      contactId: doc.contactId,
      fromNumber: doc.fromNumber,
      toNumber: doc.toNumber,
      body: doc.body,
      direction: doc.direction,
      status: doc.status,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async getMessagesByUserId(userId: string): Promise<Message[]> {
    const messages = await this.getCollection("messages");
    const result = await messages.find({ userId }).toArray();
    
    return result.map(doc => ({
      id: doc._id.toString(),
      userId: doc.userId,
      contactId: doc.contactId,
      fromNumber: doc.fromNumber,
      toNumber: doc.toNumber,
      body: doc.body,
      direction: doc.direction,
      status: doc.status,
      isRead: doc.isRead,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message | undefined> {
    const messages = await this.getCollection("messages");
    const result = await messages.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (result) {
      return {
        id: result._id.toString(),
        userId: result.userId,
        contactId: result.contactId,
        fromNumber: result.fromNumber,
        toNumber: result.toNumber,
        body: result.body,
        direction: result.direction,
        status: result.status,
        isRead: result.isRead,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    }
    return undefined;
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    const messages = await this.getCollection("messages");
    return await messages.countDocuments({
      userId,
      isRead: false,
      direction: "inbound",
    });
  }

  // Phone number methods
  async createPhoneNumber(
    userId: string,
    numberData: Omit<PhoneNumber, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<PhoneNumber> {
    const phoneNumbers = await this.getCollection("phone_numbers");
    
    const now = new Date();
    const numberDoc = {
      userId,
      ...numberData,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await phoneNumbers.insertOne(numberDoc);
    const id = result.insertedId.toString();
    
    return {
      id,
      userId,
      ...numberData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getPhoneNumbersByUserId(userId: string): Promise<PhoneNumber[]> {
    const phoneNumbers = await this.getCollection("phone_numbers");
    const result = await phoneNumbers.find({ userId }).toArray();
    
    return result.map(doc => ({
      id: doc._id.toString(),
      userId: doc.userId,
      phoneNumber: doc.phoneNumber,
      friendlyName: doc.friendlyName,
      isPrimary: doc.isPrimary,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async getPhoneNumberByNumber(phoneNumber: string): Promise<PhoneNumber | undefined> {
    const phoneNumbers = await this.getCollection("phone_numbers");
    const number = await phoneNumbers.findOne({ phoneNumber });
    
    if (number) {
      return {
        id: number._id.toString(),
        userId: number.userId,
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
        isPrimary: number.isPrimary,
        createdAt: number.createdAt,
        updatedAt: number.updatedAt,
      };
    }
    return undefined;
  }

  // Sub-account methods
  async createSubAccount(
    userId: string,
    subAccountData: Omit<SubAccount, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<SubAccount> {
    const subAccounts = await this.getCollection("sub_accounts");
    
    const now = new Date();
    const subAccountDoc = {
      userId,
      ...subAccountData,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await subAccounts.insertOne(subAccountDoc);
    const id = result.insertedId.toString();
    
    return {
      id,
      userId,
      ...subAccountData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getSubAccountsByUserId(userId: string): Promise<SubAccount[]> {
    const subAccounts = await this.getCollection("sub_accounts");
    const result = await subAccounts.find({ userId }).toArray();
    
    return result.map(doc => ({
      id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      friendlyName: doc.friendlyName,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async updateSubAccount(
    id: string,
    updates: Partial<SubAccount>,
  ): Promise<SubAccount | undefined> {
    const subAccounts = await this.getCollection("sub_accounts");
    const result = await subAccounts.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (result) {
      return {
        id: result._id.toString(),
        userId: result.userId,
        name: result.name,
        friendlyName: result.friendlyName,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    }
    return undefined;
  }

  async deleteSubAccount(id: string): Promise<boolean> {
    const subAccounts = await this.getCollection("sub_accounts");
    const result = await subAccounts.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log("Disconnected from MongoDB");
    }
  }
}

export const db = new Database();
