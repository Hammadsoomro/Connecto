import { RequestHandler } from "express";
import { db } from "../database";
import { SubAccountDetailRequest } from "@shared/types";

export const getSubAccountDetails: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot access other sub-account details
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot access sub-account management" });
    }

    const userId = req.user!.id;
    const { subAccountId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify sub-account belongs to user
    const subAccounts = await db.getSubAccountsByUserId(userId);
    const subAccount = subAccounts.find(acc => acc.id === subAccountId);
    
    if (!subAccount) {
      return res.status(404).json({ error: "Sub-account not found" });
    }

    // Get sub-account stats
    let stats = await db.getSubAccountStats(subAccountId);
    if (!stats) {
      stats = await db.createSubAccountStats({
        subAccountId,
        totalSmsCount: 0,
        totalCost: 0,
      });
    }

    // Get messages for the sub-account
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const messages = await db.getMessagesBySubAccount(subAccountId, start, end);

    // Get wallet transactions related to this sub-account
    const transactions = await db.getWalletTransactionsByUserId(userId);
    const subAccountTransactions = transactions.filter(t => t.subAccountId === subAccountId);

    res.json({
      subAccount,
      stats,
      messages,
      transactions: subAccountTransactions,
    });
  } catch (error) {
    console.error("Error fetching sub-account details:", error);
    res.status(500).json({ error: "Failed to fetch sub-account details" });
  }
};

export const getSubAccountStats: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot access stats
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot access sub-account stats" });
    }

    const userId = req.user!.id;
    const subAccounts = await db.getSubAccountsByUserId(userId);
    
    const statsPromises = subAccounts.map(async (subAccount) => {
      let stats = await db.getSubAccountStats(subAccount.id);
      if (!stats) {
        stats = await db.createSubAccountStats({
          subAccountId: subAccount.id,
          totalSmsCount: 0,
          totalCost: 0,
        });
      }
      return {
        ...subAccount,
        stats,
      };
    });

    const subAccountsWithStats = await Promise.all(statsPromises);
    res.json(subAccountsWithStats);
  } catch (error) {
    console.error("Error fetching sub-account stats:", error);
    res.status(500).json({ error: "Failed to fetch sub-account stats" });
  }
};

export const updateSubAccountStats: RequestHandler = async (req, res) => {
  try {
    const { subAccountId, smsCount, cost } = req.body;
    
    // Get current stats
    let stats = await db.getSubAccountStats(subAccountId);
    
    const updates = {
      totalSmsCount: (stats?.totalSmsCount || 0) + (smsCount || 0),
      totalCost: (stats?.totalCost || 0) + (cost || 0),
      lastActivityAt: new Date(),
    };

    const updatedStats = await db.updateSubAccountStats(subAccountId, updates);
    res.json(updatedStats);
  } catch (error) {
    console.error("Error updating sub-account stats:", error);
    res.status(500).json({ error: "Failed to update sub-account stats" });
  }
};