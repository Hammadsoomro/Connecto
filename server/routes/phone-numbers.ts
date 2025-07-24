import { RequestHandler } from "express";
import { db } from "../database";
import { twilioService } from "../twilio";
import { BuyNumberRequest } from "@shared/types";

export const getPhoneNumbers: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id;
    const phoneNumbers = await db.getPhoneNumbersByUserId(userId);
    
    // If this is a sub-account, only return their assigned number
    if (req.subAccount) {
      const assignedNumbers = phoneNumbers.filter(
        (num) => num.phoneNumber === req.subAccount!.assignedNumber
      );
      res.json(assignedNumbers);
    } else {
      res.json(phoneNumbers);
    }
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    res.status(500).json({ error: "Failed to fetch phone numbers" });
  }
};

export const getAvailableNumbers: RequestHandler = async (req, res) => {
  try {
    const { areaCode, country } = req.query as BuyNumberRequest;

    const availableNumbers = await twilioService.getAvailablePhoneNumbers(
      areaCode,
      country,
    );

    res.json(availableNumbers);
  } catch (error) {
    console.error("Error fetching available numbers:", error);
    res.status(500).json({ error: "Failed to fetch available numbers" });
  }
};

export const purchaseNumber: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot purchase numbers
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot purchase phone numbers" });
    }

    const userId = req.user!.id;
    const { phoneNumber, friendlyName } = req.body;

    // Check if user already owns this number
    const existingNumber = await db.getPhoneNumberByNumber(phoneNumber);
    if (existingNumber) {
      return res.status(400).json({ error: "Number already owned" });
    }

    // Purchase the number via Twilio
    const twilioSid = await twilioService.purchasePhoneNumber(phoneNumber);

    // Save to database
    const newPhoneNumber = await db.createPhoneNumber(userId, {
      phoneNumber,
      friendlyName: friendlyName || phoneNumber,
      isPrimary: false,
    });

    res.status(201).json(newPhoneNumber);
  } catch (error) {
    console.error("Error purchasing phone number:", error);
    res.status(500).json({ error: "Failed to purchase phone number" });
  }
};

export const setPrimaryNumber: RequestHandler = async (req, res) => {
  try {
    // Sub-accounts cannot set primary numbers
    if (req.subAccount) {
      return res.status(403).json({ error: "Sub-accounts cannot set primary phone numbers" });
    }

    const userId = req.user!.id;
    const { numberId } = req.params;

    const userNumbers = await db.getPhoneNumbersByUserId(userId);
    const targetNumber = userNumbers.find((num) => num.id === numberId);

    if (!targetNumber) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    // First, set all user's numbers to isPrimary: false
    for (const number of userNumbers) {
      if (number.isPrimary) {
        await db.updatePhoneNumber(number.id, { isPrimary: false });
      }
    }

    // Then set the target number to isPrimary: true
    await db.updatePhoneNumber(numberId, { isPrimary: true });

    res.json({ message: "Primary number updated successfully" });
  } catch (error) {
    console.error("Error setting primary number:", error);
    res.status(500).json({ error: "Failed to set primary number" });
  }
};
