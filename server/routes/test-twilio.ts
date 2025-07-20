import { RequestHandler } from "express";
import { twilioService } from "../twilio";

export const testTwilio: RequestHandler = async (req, res) => {
  try {
    // Test Twilio account info
    const accountInfo = await twilioService.getAccountInfo();
    const messagingService = await twilioService.getMessagingService();
    
    res.json({
      status: "success",
      twilio: {
        account: accountInfo,
        messagingService: messagingService,
        configured: true
      }
    });
  } catch (error) {
    console.error("Twilio test error:", error);
    res.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      configured: false
    });
  }
};
