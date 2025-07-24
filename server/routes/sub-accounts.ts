import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../database";
import { CreateSubAccountRequest } from "@shared/types";

export const getSubAccounts: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot manage other sub-accounts
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot access sub-account management" });
    }

    const userId = req.user!.id;
    const subAccounts = await db.getSubAccountsByUserId(userId);
    res.json(subAccounts);
  } catch (error) {
    console.error("Error fetching sub accounts:", error);
    res.status(500).json({ error: "Failed to fetch sub accounts" });
  }
};

export const createSubAccount: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot create other sub-accounts
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot create other sub-accounts" });
    }

    const userId = req.user!.id;
    const { name, email, password, assignedNumber } =
      req.body as CreateSubAccountRequest;

    // Check if user already has 3 sub-accounts
    const existingSubAccounts = await db.getSubAccountsByUserId(userId);
    if (existingSubAccounts.length >= 3) {
      return res.status(400).json({ error: "Maximum 3 sub-accounts allowed" });
    }

    // Validate assigned number belongs to user if provided
    if (assignedNumber) {
      const phoneNumbers = await db.getPhoneNumbersByUserId(userId);
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

    // Hash password for sub-account
    const hashedPassword = await bcrypt.hash(password, 10);

    const subAccount = await db.createSubAccount(userId, {
      name,
      email,
      password: hashedPassword,
      assignedNumber,
      friendlyName: name,
      status: "active",
    });

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

export const updateSubAccount: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot update other sub-accounts
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot update other sub-accounts" });
    }

    const userId = req.user!.id;
    const { subAccountId } = req.params;
    const { name, email, password, assignedNumber } = req.body;

    // Check if sub-account exists and belongs to user
    const subAccounts = await db.getSubAccountsByUserId(userId);
    const subAccount = subAccounts.find((sub) => sub.id === subAccountId);
    if (!subAccount) {
      return res.status(404).json({ error: "Sub-account not found" });
    }

    // Validate assigned number if provided
    if (assignedNumber) {
      const phoneNumbers = await db.getPhoneNumbersByUserId(userId);
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
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (assignedNumber !== undefined)
      updateData.assignedNumber = assignedNumber;

    const updatedSubAccount = await db.updateSubAccount(
      subAccountId,
      updateData,
    );
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

export const deleteSubAccount: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot delete other sub-accounts
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot delete other sub-accounts" });
    }

    const userId = req.user!.id;
    const { subAccountId } = req.params;

    // Check if sub-account exists and belongs to user
    const subAccounts = await db.getSubAccountsByUserId(userId);
    const subAccount = subAccounts.find((sub) => sub.id === subAccountId);
    if (!subAccount) {
      return res.status(404).json({ error: "Sub-account not found" });
    }

    const deleted = await db.deleteSubAccount(subAccountId);
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

export const loginSubAccount: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find sub-account by email
    const subAccount = await db.getSubAccountByEmail(email);

    if (!subAccount) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, subAccount.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token for sub-account
    const token = jwt.sign(
      {
        id: subAccount.id,
        type: "sub-account",
        parentUserId: subAccount.userId,
        assignedNumber: subAccount.assignedNumber,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    // Return sub-account info (excluding password)
    const subAccountResponse = {
      id: subAccount.id,
      userId: subAccount.userId,
      name: subAccount.name,
      email: subAccount.email,
      friendlyName: subAccount.friendlyName,
      status: subAccount.status,
      assignedNumber: subAccount.assignedNumber,
      createdAt: subAccount.createdAt,
      updatedAt: subAccount.updatedAt,
    };

    res.json({
      user: subAccountResponse,
      token,
      isSubAccount: true,
    });
  } catch (error) {
    console.error("Error logging in sub account:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
