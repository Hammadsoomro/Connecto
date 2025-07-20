import { RequestHandler } from "express";
import { twilioService } from "../twilio";

export const testTwilio: RequestHandler = async (req, res) => {
  try {
    console.log("Testing Twilio configuration...");
    console.log("TWILIO_SID:", process.env.TWILIO_SID ? "Set" : "Not set");
    console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "Set" : "Not set");
    console.log("TWILIO_MESSAGING_SERVICE_SID:", process.env.TWILIO_MESSAGING_SERVICE_SID ? "Set" : "Not set");
    
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
      configured: false,
      env: {
        twilioSid: !!process.env.TWILIO_SID,
        twilioAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
        messagingServiceSid: !!process.env.TWILIO_MESSAGING_SERVICE_SID
      }
    });
  }
};
