import { RequestHandler } from "express";
import { db } from "../database";
import { twilioService } from "../twilio";
import { SendSmsRequest } from "@shared/types";

export const sendSMS: RequestHandler = async (req, res) => {
  try {
    const { contactId, body, fromNumber } = req.body as SendSmsRequest;
    const userId = req.user!.id;

        // Get contact
    const contact = await db.getContactById(contactId);
    if (!contact || contact.userId !== userId) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Verify user owns the from number
    const phoneNumber = await db.getPhoneNumberByNumber(fromNumber);
    if (!phoneNumber || phoneNumber.userId !== userId) {
      return res.status(400).json({ error: "Invalid from number" });
    }

    // Send SMS via Twilio
    const twilioSid = await twilioService.sendSMS(
      fromNumber,
      contact.phoneNumber,
      body,
    );

    // Save message to database
    const message = db.createMessage({
      userId,
      contactId,
      fromNumber,
      toNumber: contact.phoneNumber,
      body,
      direction: "outbound",
      status: "sent",
      isRead: true,
      twilioSid,
    });

    // Emit to Socket.IO for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("new-message", message);
    }

    res.json(message);
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ error: "Failed to send SMS" });
  }
};

export const getMessages: RequestHandler = (req, res) => {
  try {
    const userId = req.user!.id;
    const { contactId } = req.params;

    if (contactId) {
      // Get messages for specific contact
      const contact = db.getContactById(contactId);
      if (!contact || contact.userId !== userId) {
        return res.status(404).json({ error: "Contact not found" });
      }

      const messages = db.getMessagesByContactId(contactId);
      res.json(messages);
    } else {
      // Get all messages for user
      const messages = db.getMessagesByUserId(userId);
      res.json(messages);
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const markMessageAsRead: RequestHandler = (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user!.id;

    const message = db.updateMessage(messageId, { isRead: true });
    if (!message || message.userId !== userId) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Emit to Socket.IO for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("message-status-update", {
        messageId,
        status: message.status,
      });
    }

    res.json(message);
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
};

// Webhook endpoint for receiving SMS from Twilio
export const receiveSMS: RequestHandler = (req, res) => {
  try {
    const { From, To, Body, MessageSid } = req.body;

    // Find the phone number and user
    const phoneNumber = db.getPhoneNumberByNumber(To);
    if (!phoneNumber) {
      console.error("Received SMS for unknown number:", To);
      return res.status(404).send("Number not found");
    }

    const userId = phoneNumber.userId;

    // Find or create contact
    let contact = db.getContactByPhoneNumber(userId, From);
    if (!contact) {
      contact = db.createContact(userId, {
        name: From, // Use phone number as name initially
        phoneNumber: From,
      });
    }

    // Save message
    const message = db.createMessage({
      userId,
      contactId: contact.id,
      fromNumber: From,
      toNumber: To,
      body: Body,
      direction: "inbound",
      status: "received",
      isRead: false,
      twilioSid: MessageSid,
    });

    // Emit to Socket.IO for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("new-message", message);
    }

    res.send("OK");
  } catch (error) {
    console.error("Error processing incoming SMS:", error);
    res.status(500).send("Error");
  }
};

export const getUnreadCount: RequestHandler = (req, res) => {
  try {
    const userId = req.user!.id;
    const unreadCount = db.getUnreadMessagesCount(userId);
    res.json({ unreadCount });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};
