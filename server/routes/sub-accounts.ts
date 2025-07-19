import { RequestHandler } from "express";
import { db } from "../database";
import { CreateSubAccountRequest } from "@shared/types";

export const getSubAccounts: RequestHandler = (req, res) => {
  try {
    const userId = req.user!.id;
    const subAccounts = db.getSubAccountsByUserId(userId);
    res.json(subAccounts);
  } catch (error) {
    console.error("Error fetching sub accounts:", error);
    res.status(500).json({ error: "Failed to fetch sub accounts" });
  }
};

export const createSubAccount: RequestHandler = (req, res) => {
  try {
    const userId = req.user!.id;
    const { name, assignedNumber } = req.body as CreateSubAccountRequest;

    // Check if user already has 3 sub-accounts
    const existingSubAccounts = db.getSubAccountsByUserId(userId);
    if (existingSubAccounts.length >= 3) {
      return res.status(400).json({ error: "Maximum 3 sub-accounts allowed" });
    }

    // Validate assigned number belongs to user if provided
    if (assignedNumber) {
      const phoneNumbers = db.getPhoneNumbersByUserId(userId);
      const phoneExists = phoneNumbers.some(
        (p) => p.phoneNumber === assignedNumber,
      );
      if (!phoneExists) {
        return res
          .status(400)
          .json({ error: "Phone number not found or not owned by user" });
      }

      // Check if number is already assigned to another sub-account
      const isAssigned = existingSubAccounts.some(
        (sub) => sub.assignedNumber === assignedNumber,
      );
      if (isAssigned) {
        return res.status(400).json({
          error: "Phone number already assigned to another sub-account",
        });
      }
    }

    const subAccount = db.createSubAccount(userId, { name, assignedNumber });

    // Emit to Socket.IO for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("sub-account-created", subAccount);
    }

    res.status(201).json(subAccount);
  } catch (error) {
    console.error("Error creating sub account:", error);
    res.status(500).json({ error: "Failed to create sub account" });
  }
};

export const updateSubAccount: RequestHandler = (req, res) => {
  try {
    const userId = req.user!.id;
    const { subAccountId } = req.params;
    const { name, assignedNumber } = req.body;

    // Check if sub-account exists and belongs to user
    const subAccounts = db.getSubAccountsByUserId(userId);
    const subAccount = subAccounts.find((sub) => sub.id === subAccountId);
    if (!subAccount) {
      return res.status(404).json({ error: "Sub-account not found" });
    }

    // Validate assigned number if provided
    if (assignedNumber) {
      const phoneNumbers = db.getPhoneNumbersByUserId(userId);
      const phoneExists = phoneNumbers.some(
        (p) => p.phoneNumber === assignedNumber,
      );
      if (!phoneExists) {
        return res
          .status(400)
          .json({ error: "Phone number not found or not owned by user" });
      }

      // Check if number is already assigned to another sub-account
      const isAssigned = subAccounts.some(
        (sub) =>
          sub.id !== subAccountId && sub.assignedNumber === assignedNumber,
      );
      if (isAssigned) {
        return res.status(400).json({
          error: "Phone number already assigned to another sub-account",
        });
      }
    }

    const updateData: Partial<typeof subAccount> = {};
    if (name !== undefined) updateData.name = name;
    if (assignedNumber !== undefined)
      updateData.assignedNumber = assignedNumber;

    const updatedSubAccount = db.updateSubAccount(subAccountId, updateData);
    if (!updatedSubAccount) {
      return res.status(500).json({ error: "Failed to update sub-account" });
    }

    // Emit to Socket.IO for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("sub-account-updated", updatedSubAccount);
    }

    res.json(updatedSubAccount);
  } catch (error) {
    console.error("Error updating sub account:", error);
    res.status(500).json({ error: "Failed to update sub account" });
  }
};

export const deleteSubAccount: RequestHandler = (req, res) => {
  try {
    const userId = req.user!.id;
    const { subAccountId } = req.params;

    // Check if sub-account exists and belongs to user
    const subAccounts = db.getSubAccountsByUserId(userId);
    const subAccount = subAccounts.find((sub) => sub.id === subAccountId);
    if (!subAccount) {
      return res.status(404).json({ error: "Sub-account not found" });
    }

    const deleted = db.deleteSubAccount(subAccountId);
    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete sub-account" });
    }

    // Emit to Socket.IO for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("sub-account-deleted", subAccountId);
    }

    res.json({ message: "Sub-account deleted successfully" });
  } catch (error) {
    console.error("Error deleting sub account:", error);
    res.status(500).json({ error: "Failed to delete sub account" });
  }
};
