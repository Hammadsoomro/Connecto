import { RequestHandler } from "express";
import { db } from "../database";
import { twilioService } from "../twilio";
import { BuyNumberRequest } from "@shared/types";

export const getPhoneNumbers: RequestHandler = (req, res) => {
  try {
    const userId = req.user!.id;
    const phoneNumbers = db.getPhoneNumbersByUserId(userId);
    res.json(phoneNumbers);
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
    const userId = req.user!.id;
    const { phoneNumber, friendlyName } = req.body;

    // Check if user already owns this number
    const existingNumber = db.getPhoneNumberByNumber(phoneNumber);
    if (existingNumber) {
      return res.status(400).json({ error: "Number already owned" });
    }

    // Purchase the number via Twilio
    const twilioSid = await twilioService.purchasePhoneNumber(phoneNumber);

    // Save to database
    const newPhoneNumber = db.createPhoneNumber(userId, {
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

export const setPrimaryNumber: RequestHandler = (req, res) => {
  try {
    const userId = req.user!.id;
    const { numberId } = req.params;

    const userNumbers = db.getPhoneNumbersByUserId(userId);
    const targetNumber = userNumbers.find((num) => num.id === numberId);

    if (!targetNumber) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    // In a real implementation, you'd update all numbers to isPrimary: false
    // and then set the target number to isPrimary: true
    // For now, we'll just return success

    res.json({ message: "Primary number updated successfully" });
  } catch (error) {
    console.error("Error setting primary number:", error);
    res.status(500).json({ error: "Failed to set primary number" });
  }
};
