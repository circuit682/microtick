import { Money } from "@domain";

export interface PaymentRequest {
  phoneNumber: string;
  amount: Money;
  reference: string;
}

export interface PaymentGateway {
  requestPayment(request: PaymentRequest): Promise<void>;
}