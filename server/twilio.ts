import twilio from 'twilio';

// Environment variables for Twilio configuration
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

export class TwilioService {
  private client: any = null;

    private getClient() {
    if (!this.client) {
      // Get fresh environment variables each time
      const currentAccountSid = process.env.TWILIO_SID;
      const currentAuthToken = process.env.TWILIO_AUTH_TOKEN;

      console.log("Twilio getClient debug:");
      console.log("currentAccountSid:", currentAccountSid ? "Set" : "Not set");
      console.log("currentAuthToken:", currentAuthToken ? "Set" : "Not set");
      console.log("accountSid variable:", accountSid ? "Set" : "Not set");
      console.log("authToken variable:", authToken ? "Set" : "Not set");

      if (!currentAccountSid || !currentAuthToken) {
        throw new Error("Twilio credentials not configured. Please set TWILIO_SID and TWILIO_AUTH_TOKEN environment variables.");
      }

      this.client = twilio(currentAccountSid, currentAuthToken);
      console.log("Twilio client initialized successfully");
    }
    return this.client;
  }

  async sendSMS(from: string, to: string, body: string): Promise<string> {
    try {
      const client = this.getClient();

      const messageOptions: any = {
        body,
        to,
      };

      // Use messaging service if configured, otherwise use from number
      if (messagingServiceSid) {
        messageOptions.messagingServiceSid = messagingServiceSid;
      } else {
        messageOptions.from = from;
      }

      const message = await client.messages.create(messageOptions);
      console.log(`SMS sent successfully: ${message.sid}`);
      return message.sid;
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new Error("Failed to send SMS");
    }
  }

  async getAvailablePhoneNumbers(areaCode?: string, country = "US") {
    try {
      const client = this.getClient();

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
      const client = this.getClient();

      const purchasedNumber = await client.incomingPhoneNumbers.create({
        phoneNumber,
        smsUrl: `${process.env.BASE_URL}/api/webhooks/sms`,
        smsMethod: "POST",
      });

      console.log(`Phone number purchased successfully: ${purchasedNumber.sid}`);
      return purchasedNumber.sid;
    } catch (error) {
      console.error("Error purchasing phone number:", error);
      throw new Error("Failed to purchase phone number");
    }
  }

  async configureWebhook(phoneNumber: string, webhookUrl: string) {
    try {
      const client = this.getClient();

      const phoneNumbers = await client.incomingPhoneNumbers.list({
        phoneNumber,
      });

      if (phoneNumbers.length > 0) {
        await client.incomingPhoneNumbers(phoneNumbers[0].sid).update({
          smsUrl: webhookUrl,
          smsMethod: "POST",
        });
        console.log(`Webhook configured for ${phoneNumber}: ${webhookUrl}`);
        return true;
      }

      console.warn(`Phone number ${phoneNumber} not found in account`);
      return false;
    } catch (error) {
      console.error("Error configuring webhook:", error);
      return false;
    }
  }

  async getAccountInfo() {
    try {
      const client = this.getClient();
      const account = await client.api.accounts(accountSid).fetch();
      
      return {
        accountSid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      };
    } catch (error) {
      console.error("Error fetching account info:", error);
      throw new Error("Failed to fetch account information");
    }
  }

  async getMessagingService() {
    try {
      if (!messagingServiceSid) {
        return null;
      }

      const client = this.getClient();
      const service = await client.messaging.v1.services(messagingServiceSid).fetch();
      
      return {
        sid: service.sid,
        friendlyName: service.friendlyName,
        inboundRequestUrl: service.inboundRequestUrl,
        fallbackUrl: service.fallbackUrl,
      };
    } catch (error) {
      console.error("Error fetching messaging service:", error);
      return null;
    }
  }
}

export const twilioService = new TwilioService();
