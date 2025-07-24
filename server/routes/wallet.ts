import { RequestHandler } from "express";
import { db } from "../database";
import { AddFundsRequest } from "@shared/types";

export const getWallet: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot access wallet
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot access wallet" });
    }

    const userId = req.user!.id;
    let wallet = await db.getWalletByUserId(userId);
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await db.createWallet(userId);
    }

    res.json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
};

export const addFunds: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot add funds
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot add funds" });
    }

    const userId = req.user!.id;
    const { amount, paymentMethod } = req.body as AddFundsRequest;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Ensure wallet exists
    let wallet = await db.getWalletByUserId(userId);
    if (!wallet) {
      wallet = await db.createWallet(userId);
    }

    // Update wallet balance
    const updatedWallet = await db.updateWalletBalance(userId, amount);
    
    // Create transaction record
    await db.createWalletTransaction({
      userId,
      type: "credit",
      amount,
      description: `Funds added via ${paymentMethod}`,
      reference: `payment_${Date.now()}`,
    });

    // Emit to Socket.IO for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("wallet-updated", updatedWallet);
    }

    res.json(updatedWallet);
  } catch (error) {
    console.error("Error adding funds:", error);
    res.status(500).json({ error: "Failed to add funds" });
  }
};

export const getWalletTransactions: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot access wallet transactions
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot access wallet transactions" });
    }

    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const transactions = await db.getWalletTransactionsByUserId(userId, limit);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    res.status(500).json({ error: "Failed to fetch wallet transactions" });
  }
};

export const deductFunds: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id;
    const { amount, description, subAccountId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Check wallet balance
    const wallet = await db.getWalletByUserId(userId);
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Deduct from wallet
    const updatedWallet = await db.updateWalletBalance(userId, -amount);
    
    // Create transaction record
    await db.createWalletTransaction({
      userId,
      type: "debit",
      amount,
      description,
      subAccountId,
    });

    // Emit to Socket.IO for real-time updates
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("wallet-updated", updatedWallet);
    }

    res.json(updatedWallet);
  } catch (error) {
    console.error("Error deducting funds:", error);
    res.status(500).json({ error: "Failed to deduct funds" });
  }
};