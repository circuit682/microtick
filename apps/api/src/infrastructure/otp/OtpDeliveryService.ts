export interface OtpDeliveryProvider {
  send(phoneNumber: string, message: string): Promise<void>;
}

export interface OtpDeliveryRequest {
  phoneNumber: string;
  code: string;
}

export class OtpDeliveryService {
  constructor(private readonly provider: OtpDeliveryProvider) {}

  async send(request: OtpDeliveryRequest): Promise<void> {
    const message = `Your MicroTick verification code is: ${request.code}`;

    await this.provider.send(request.phoneNumber, message);
  }
}
