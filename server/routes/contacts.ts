import { RequestHandler } from "express";
import { db } from "../database";
import { CreateContactRequest } from "@shared/types";

export const getContacts: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id;
        const contacts = await db.getContactsByUserId(userId);
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

export const getContactsWithUnread: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id;
        const contacts = await db.getContactsWithUnread(userId);
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts with unread:", error);
    res.status(500).json({ error: "Failed to fetch contacts with unread" });
  }
};

export const createContact: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id;
    const { name, phoneNumber } = req.body as CreateContactRequest;

    // Check if contact already exists
        const existingContact = await db.getContactByPhoneNumber(userId, phoneNumber);
    if (existingContact) {
      return res.status(400).json({ error: "Contact already exists" });
    }

        const contact = await db.createContact(userId, { name, phoneNumber });

    // Emit to Socket.IO for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("contact-updated", contact);
    }

    res.status(201).json(contact);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
};

export const deleteContact: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contactId } = req.params;

        const contact = await db.getContactById(contactId);
    if (!contact || contact.userId !== userId) {
      return res.status(404).json({ error: "Contact not found" });
    }

        const deleted = await db.deleteContact(contactId);
    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete contact" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
};

export const updateContact: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contactId } = req.params;
    const { name } = req.body;

        const contact = await db.getContactById(contactId);
    if (!contact || contact.userId !== userId) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Update contact name (we'll implement this in the database service)
    const updatedContact = { ...contact, name, updatedAt: new Date() };

    // For now, we'll just return the updated contact
    // In a real database, you'd implement an update method
    res.json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
};
