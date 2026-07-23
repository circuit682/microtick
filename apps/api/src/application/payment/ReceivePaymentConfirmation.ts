import { ConfirmPayment } from "./ConfirmPayment.js";

export interface ReceivePaymentConfirmationCommand {
  reference: string;
}

export class ReceivePaymentConfirmation {
  constructor(
    private readonly confirmPayment: ConfirmPayment,
  ) {}

  async execute(
    command: ReceivePaymentConfirmationCommand,
  ): Promise<void> {
    await this.confirmPayment.execute(
      command.reference,
    );
  }
}