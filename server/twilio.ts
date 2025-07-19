// Environment variables for Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID || "demo_sid";
const authToken = process.env.TWILIO_AUTH_TOKEN || "demo_token";

export class TwilioService {
  private client: any = null;

  private getClient() {
    if (!this.client) {
      // Only initialize Twilio client when actually needed
      // and not during build/config time
      if (accountSid === "demo_sid") {
        // For demo mode, don't initialize real Twilio client
        return null;
      }

      const twilio = require("twilio");
      this.client = twilio(accountSid, authToken);
    }
    return this.client;
  }

  async sendSMS(from: string, to: string, body: string): Promise<string> {
    try {
      // In demo mode, simulate SMS sending
      if (accountSid === "demo_sid") {
        console.log(`[DEMO] Sending SMS from ${from} to ${to}: ${body}`);
        return "demo_message_sid";
      }

      const client = this.getClient();
      if (!client) {
        throw new Error("Twilio client not initialized");
      }

      const message = await client.messages.create({
        body,
        from,
        to,
      });

      return message.sid;
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new Error("Failed to send SMS");
    }
  }

  async getAvailablePhoneNumbers(areaCode?: string, country = "US") {
    try {
      // In demo mode, return mock numbers
      if (accountSid === "demo_sid") {
        return [
          { phoneNumber: "+1234567890", friendlyName: "+1 (234) 567-890" },
          { phoneNumber: "+1234567891", friendlyName: "+1 (234) 567-891" },
          { phoneNumber: "+1234567892", friendlyName: "+1 (234) 567-892" },
        ];
      }

      const client = this.getClient();
      if (!client) {
        throw new Error("Twilio client not initialized");
      }

      const availableNumbers = await client
        .availablePhoneNumbers(country)
        .local.list({
          areaCode,
          limit: 10,
        });

      return availableNumbers.map((number: any) => ({
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
      }));
    } catch (error) {
      console.error("Error fetching available numbers:", error);
      throw new Error("Failed to fetch available phone numbers");
    }
  }

  async purchasePhoneNumber(phoneNumber: string): Promise<string> {
    try {
      // In demo mode, simulate purchase
      if (accountSid === "demo_sid") {
        console.log(`[DEMO] Purchasing number: ${phoneNumber}`);
        return "demo_purchase_sid";
      }

      const client = this.getClient();
      if (!client) {
        throw new Error("Twilio client not initialized");
      }

      const purchasedNumber = await client.incomingPhoneNumbers.create({
        phoneNumber,
        smsUrl: `${process.env.BASE_URL}/api/webhooks/sms`,
        smsMethod: "POST",
      });

      return purchasedNumber.sid;
    } catch (error) {
      console.error("Error purchasing phone number:", error);
      throw new Error("Failed to purchase phone number");
    }
  }

  async configureWebhook(phoneNumber: string, webhookUrl: string) {
    try {
      // In demo mode, simulate webhook configuration
      if (accountSid === "demo_sid") {
        console.log(
          `[DEMO] Configuring webhook for ${phoneNumber}: ${webhookUrl}`,
        );
        return true;
      }

      const client = this.getClient();
      if (!client) {
        return false;
      }

      const phoneNumbers = await client.incomingPhoneNumbers.list({
        phoneNumber,
      });

      if (phoneNumbers.length > 0) {
        await client.incomingPhoneNumbers(phoneNumbers[0].sid).update({
          smsUrl: webhookUrl,
          smsMethod: "POST",
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error configuring webhook:", error);
      return false;
    }
  }
}

export const twilioService = new TwilioService();
