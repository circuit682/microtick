export interface IntaSendCheckoutRequest {
  amount: number;
  currency: string;
  phone_number: string;
  api_ref: string;
  host: string;
  redirect_url: string;
  channel: string;
  mobile_tarrif: string;
  card_tarrif: string;
}