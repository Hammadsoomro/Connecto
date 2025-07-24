import twilio from "twilio";

export class TwilioService {
  private client: any = null;

  private getClient() {
    if (!this.client) {
      const accountSid = process.env.TWILIO_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      if (!accountSid || !authToken) throw new Error("Twilio not configured");
      this.client = twilio(accountSid, authToken);
    }
    return this.client;
  }

  async sendSMS(from: string, to: string, body: string): Promise<string> {
    const client = this.getClient();
    const message = await client.messages.create({ from, to, body });
    return message.sid;
  }

  async getAvailablePhoneNumbers(areaCode?: string, country = "US") {
    const client = this.getClient();
    const numbers = await client.availablePhoneNumbers(country).local.list({ areaCode, limit: 10 });
    return numbers.map((n: any) => ({ phoneNumber: n.phoneNumber, friendlyName: n.friendlyName }));
  }

  async purchasePhoneNumber(phoneNumber: string): Promise<string> {
    const client = this.getClient();
    const purchased = await client.incomingPhoneNumbers.create({ phoneNumber, smsUrl: "https://connectlify.netlify.app/api/twilio/webhook", smsMethod: "POST" });
    return purchased.sid;
  }
}

export const twilioService = new TwilioService();
