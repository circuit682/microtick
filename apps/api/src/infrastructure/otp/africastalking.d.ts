declare module "africastalking" {
  interface SmsRecipient {
    status: string;
    messageId?: string;
    cost?: string;
    number?: string;
  }

  interface SmsResponse {
    SMSMessageData?: {
      Recipients?: SmsRecipient[];
    };
  }

  interface SmsClient {
    send(options: {
      to: string[];
      message: string;
      from?: string;
    }): Promise<SmsResponse>;
  }

  interface AfricaTalkingClient {
    SMS: SmsClient;
  }

  interface AfricaTalkingOptions {
    username: string;
    apiKey: string;
  }

  function AfricaTalking(options: AfricaTalkingOptions): AfricaTalkingClient;

  export = AfricaTalking;
}
