import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";

import { register, login, authenticateToken } from "./routes/auth";
import {
  sendSMS,
  getMessages,
  markMessageAsRead,
  receiveSMS,
  getUnreadCount,
} from "./routes/sms";
import {
  getContacts,
  getContactsWithUnread,
  createContact,
  deleteContact,
  updateContact,
} from "./routes/contacts";
import {
  getPhoneNumbers,
  getAvailableNumbers,
  purchaseNumber,
  setPrimaryNumber,
} from "./routes/phone-numbers";
import {
  getSubAccounts,
  createSubAccount,
  updateSubAccount,
  deleteSubAccount,
} from "./routes/sub-accounts";
import { db } from "./database";

export function createExpressApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Public routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  

  // Auth routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);

  // Webhook routes (no auth required)
  app.post("/api/webhooks/sms", receiveSMS);

  // Protected routes (require authentication)
  app.use("/api", authenticateToken);

  // SMS routes
  app.post("/api/sms/send", sendSMS);
  app.get("/api/sms/messages", getMessages);
  app.get("/api/sms/messages/:contactId", getMessages);
  app.put("/api/sms/messages/:messageId/read", markMessageAsRead);
  app.get("/api/sms/unread-count", getUnreadCount);

  // Contact routes
  app.get("/api/contacts", getContacts);
  app.get("/api/contacts/with-unread", getContactsWithUnread);
  app.post("/api/contacts", createContact);
  app.delete("/api/contacts/:contactId", deleteContact);
  app.put("/api/contacts/:contactId", updateContact);

  // Phone number routes
  app.get("/api/phone-numbers", getPhoneNumbers);
  app.get("/api/phone-numbers/available", getAvailableNumbers);
  app.post("/api/phone-numbers/purchase", purchaseNumber);
  app.put("/api/phone-numbers/:numberId/primary", setPrimaryNumber);

  // Sub-account routes
  app.get("/api/sub-accounts", getSubAccounts);
  app.post("/api/sub-accounts", createSubAccount);
  app.put("/api/sub-accounts/:subAccountId", updateSubAccount);
  app.delete("/api/sub-accounts/:subAccountId", deleteSubAccount);

  return app;
}

export async function createServer() {
  // Initialize database connection
  await db.connect();

  const app = createExpressApp();
  const httpServer = createHttpServer(app);

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Store io instance in app for access in routes
  app.set("io", io);

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user to their personal room
    socket.on("join-user-room", (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return httpServer;
}
