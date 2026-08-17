import type { OtpDeliveryProvider } from "./OtpDeliveryService.js";

interface AfricaTalkingSmsRecipient {
  status: string;
  messageId?: string;
  cost?: string;
  number?: string;
}

interface AfricaTalkingSmsResponse {
  SMSMessageData?: {
    Recipients?: AfricaTalkingSmsRecipient[];
  };
}

interface AfricaTalkingSmsClient {
  send(options: {
    to: string[];
    message: string;
    from?: string;
  }): Promise<AfricaTalkingSmsResponse>;
}

interface AfricaTalkingClient {
  SMS: AfricaTalkingSmsClient;
}

type AfricaTalkingFactory = (options: {
  username: string;
  apiKey: string;
}) => AfricaTalkingClient;

export interface AfricaTalkingOtpDeliveryProviderOptions {
  username: string;
  apiKey: string;
  senderId?: string;
}

export class AfricaTalkingOtpDeliveryProvider implements OtpDeliveryProvider {
  private readonly sms: AfricaTalkingSmsClient;

  constructor(
    private readonly options: AfricaTalkingOtpDeliveryProviderOptions,
    createClient: AfricaTalkingFactory,
  ) {
    this.sms = createClient({
      username: options.username,
      apiKey: options.apiKey,
    }).SMS;
  }

  async send(phoneNumber: string, message: string): Promise<void> {
    const response = await this.sms.send({
      to: [phoneNumber],
      message,
      ...(this.options.senderId ? { from: this.options.senderId } : {}),
    });

    const recipient = response.SMSMessageData?.Recipients?.[0];

    if (!recipient) {
      throw new Error("Africa's Talking returned no SMS recipient result.");
    }

    if (recipient.status !== "Success") {
      throw new Error(
        `Africa's Talking OTP delivery failed: ${recipient.status}`,
      );
    }
  }
}
