import { MongoClient, Db, ObjectId } from "mongodb";
import {
  User,
  Contact,
  ContactWithUnread,
  Message,
  PhoneNumber,
  SubAccount,
  Wallet,
  WalletTransaction,
  SubAccountStats,
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
      // Get wallet balance
      const wallet = await this.getWalletByUserId(id);
      
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        walletBalance: wallet?.balance || 0,
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
      // Get wallet balance
      const wallet = await this.getWalletByUserId(user._id.toString());
      
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        walletBalance: wallet?.balance || 0,
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

    return result.map((doc) => ({
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
      const lastMessage =
        messages.length > 0 ? messages[messages.length - 1] : undefined;

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

    return result.map((doc) => ({
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

    return result.map((doc) => ({
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

  async updateMessage(
    id: string,
    updates: Partial<Message>,
  ): Promise<Message | undefined> {
    const messages = await this.getCollection("messages");
    const result = await messages.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" },
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

    return result.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      phoneNumber: doc.phoneNumber,
      friendlyName: doc.friendlyName,
      isPrimary: doc.isPrimary,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async getPhoneNumberByNumber(
    phoneNumber: string,
  ): Promise<PhoneNumber | undefined> {
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

  async updatePhoneNumber(
    id: string,
    updates: Partial<PhoneNumber>,
  ): Promise<PhoneNumber | undefined> {
    const phoneNumbers = await this.getCollection("phone_numbers");
    const result = await phoneNumbers.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (result) {
      return {
        id: result._id.toString(),
        userId: result.userId,
        phoneNumber: result.phoneNumber,
        friendlyName: result.friendlyName,
        isPrimary: result.isPrimary,
        assignedToSubAccount: result.assignedToSubAccount,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    }
    return undefined;
  }

  // Sub-account methods
  async createSubAccount(
    userId: string,
    subAccountData: Omit<
      SubAccount,
      "id" | "userId" | "createdAt" | "updatedAt"
    >,
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

    return result.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      email: doc.email,
      friendlyName: doc.friendlyName,
      status: doc.status,
      assignedNumber: doc.assignedNumber,
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
      { returnDocument: "after" },
    );

    if (result) {
      return {
        id: result._id.toString(),
        userId: result.userId,
        name: result.name,
        email: result.email,
        friendlyName: result.friendlyName,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    }
    return undefined;
  }

  async getSubAccountByEmail(email: string): Promise<SubAccount | undefined> {
    const subAccounts = await this.getCollection("sub_accounts");
    const result = await subAccounts.findOne({ email });

    if (result) {
      return {
        id: result._id.toString(),
        userId: result.userId,
        name: result.name,
        email: result.email,
        password: result.password,
        friendlyName: result.friendlyName,
        status: result.status,
        assignedNumber: result.assignedNumber,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    }
    return undefined;
  }

  async getSubAccountById(id: string): Promise<SubAccount | undefined> {
    const subAccounts = await this.getCollection("sub_accounts");
    const result = await subAccounts.findOne({ _id: new ObjectId(id) });

    if (result) {
      return {
        id: result._id.toString(),
        userId: result.userId,
        name: result.name,
        email: result.email,
        password: result.password,
        friendlyName: result.friendlyName,
        status: result.status,
        assignedNumber: result.assignedNumber,
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

  // Wallet methods
  async createWallet(userId: string): Promise<Wallet> {
    const wallets = await this.getCollection("wallets");
    
    const now = new Date();
    const walletDoc = {
      userId,
      balance: 0,
      currency: "USD",
      createdAt: now,
      updatedAt: now,
    };

    const result = await wallets.insertOne(walletDoc);
    const id = result.insertedId.toString();

    return {
      id,
      userId,
      balance: 0,
      currency: "USD",
      createdAt: now,
      updatedAt: now,
    };
  }

  async getWalletByUserId(userId: string): Promise<Wallet | undefined> {
    const wallets = await this.getCollection("wallets");
    const wallet = await wallets.findOne({ userId });

    if (wallet) {
      return {
        id: wallet._id.toString(),
        userId: wallet.userId,
        balance: wallet.balance,
        currency: wallet.currency,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      };
    }
    return undefined;
  }

  async updateWalletBalance(userId: string, amount: number): Promise<Wallet | undefined> {
    const wallets = await this.getCollection("wallets");
    const result = await wallets.findOneAndUpdate(
      { userId },
      { 
        $inc: { balance: amount },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: "after" }
    );

    if (result) {
      return {
        id: result._id.toString(),
        userId: result.userId,
        balance: result.balance,
        currency: result.currency,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    }
    return undefined;
  }

  // Wallet Transaction methods
  async createWalletTransaction(
    transactionData: Omit<WalletTransaction, "id" | "createdAt" | "updatedAt">
  ): Promise<WalletTransaction> {
    const transactions = await this.getCollection("wallet_transactions");

    const now = new Date();
    const transactionDoc = {
      ...transactionData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await transactions.insertOne(transactionDoc);
    const id = result.insertedId.toString();

    return {
      id,
      ...transactionData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getWalletTransactionsByUserId(userId: string, limit = 50): Promise<WalletTransaction[]> {
    const transactions = await this.getCollection("wallet_transactions");
    const result = await transactions
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return result.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      amount: doc.amount,
      description: doc.description,
      reference: doc.reference,
      subAccountId: doc.subAccountId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  // Sub Account Stats methods
  async createSubAccountStats(
    statsData: Omit<SubAccountStats, "id" | "createdAt" | "updatedAt">
  ): Promise<SubAccountStats> {
    const stats = await this.getCollection("sub_account_stats");

    const now = new Date();
    const statsDoc = {
      ...statsData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await stats.insertOne(statsDoc);
    const id = result.insertedId.toString();

    return {
      id,
      ...statsData,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getSubAccountStats(subAccountId: string): Promise<SubAccountStats | undefined> {
    const stats = await this.getCollection("sub_account_stats");
    const result = await stats.findOne({ subAccountId });

    if (result) {
      return {
        id: result._id.toString(),
        subAccountId: result.subAccountId,
        totalSmsCount: result.totalSmsCount,
        totalCost: result.totalCost,
        lastActivityAt: result.lastActivityAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    }
    return undefined;
  }

  async updateSubAccountStats(
    subAccountId: string,
    updates: Partial<SubAccountStats>
  ): Promise<SubAccountStats | undefined> {
    const stats = await this.getCollection("sub_account_stats");
    const result = await stats.findOneAndUpdate(
      { subAccountId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after", upsert: true }
    );

    if (result) {
      return {
        id: result._id.toString(),
        subAccountId: result.subAccountId,
        totalSmsCount: result.totalSmsCount,
        totalCost: result.totalCost,
        lastActivityAt: result.lastActivityAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    }
    return undefined;
  }

  async getMessagesBySubAccount(subAccountId: string, startDate?: Date, endDate?: Date): Promise<Message[]> {
    const messages = await this.getCollection("messages");
    const subAccount = await this.getSubAccountById(subAccountId);
    
    if (!subAccount || !subAccount.assignedNumber) {
      return [];
    }

    const query: any = {
      $or: [
        { fromNumber: subAccount.assignedNumber },
        { toNumber: subAccount.assignedNumber }
      ]
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const result = await messages
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return result.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      contactId: doc.contactId,
      fromNumber: doc.fromNumber,
      toNumber: doc.toNumber,
      body: doc.body,
      direction: doc.direction,
      status: doc.status,
      isRead: doc.isRead,
      twilioSid: doc.twilioSid,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
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
